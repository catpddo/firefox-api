import FirefoxApi, { ERROR_CODES, LoginParams, GetPhoneParams } from '../src/index';

/**
 * TypeScript 使用示例
 */
class FirefoxSmsService {
  private client: FirefoxApi;
  private token?: string;

  constructor() {
    this.client = new FirefoxApi({
      timeout: 30000,
      retries: 3
    });
  }

  /**
   * 初始化服务（登录）
   */
  async initialize(credentials: LoginParams): Promise<boolean> {
    try {
      const result = await this.client.login(credentials);
      
      if (result.success && result.token) {
        this.token = result.token;
        console.log('✅ 服务初始化成功');
        return true;
      } else {
        this.handleLoginError(result.errorCode);
        return false;
      }
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      return false;
    }
  }

  /**
   * 处理登录错误
   */
  private handleLoginError(errorCode?: number): void {
    switch (errorCode) {
      case ERROR_CODES.LOGIN_WRONG_CREDENTIALS:
        console.error('❌ 用户名或密码错误');
        break;
      case ERROR_CODES.LOGIN_ACCOUNT_DISABLED:
        console.error('❌ 账号已被禁用');
        break;
      case ERROR_CODES.LOGIN_IP_WAIT:
        console.error('❌ 请求过于频繁，请1分钟后重试');
        break;
      default:
        console.error('❌ 登录失败，错误代码:', errorCode);
    }
  }

  /**
   * 获取验证码
   */
  async getVerificationCode(projectId: string, options?: {
    country?: string;
    maxWaitTime?: number;
    checkInterval?: number;
  }): Promise<string | null> {
    if (!this.token) {
      throw new Error('服务未初始化，请先调用 initialize()');
    }

    const { 
      country, 
      maxWaitTime = 300000,  // 5分钟
      checkInterval = 5000   // 5秒
    } = options || {};

    try {
      // 1. 获取手机号
      console.log('📱 获取手机号...');
      const phoneParams: GetPhoneParams = {
        token: this.token,
        iid: projectId,
        country
      };

      const phoneResult = await this.client.getPhone(phoneParams);
      
      if (!phoneResult.success) {
        console.error('❌ 获取手机号失败:', phoneResult.error);
        return null;
      }

      console.log('✅ 手机号:', phoneResult.mobile);

      // 2. 循环等待验证码
      const startTime = Date.now();
      let attempt = 1;

      while (Date.now() - startTime < maxWaitTime) {
        console.log(`⏳ 第${attempt}次尝试获取验证码...`);

        const messageResult = await this.client.getMessage({
          token: this.token,
          pkey: phoneResult.pkey!
        });

        if (messageResult.success && messageResult.sms) {
          console.log('✅ 收到短信:', messageResult.sms);
          console.log('🔢 验证码:', messageResult.code);
          return messageResult.code || null;
        }

        await new Promise(resolve => setTimeout(resolve, checkInterval));
        attempt++;
      }

      // 3. 超时后释放手机号
      console.log('⚠️  等待超时，释放手机号...');
      await this.releasePhone(phoneResult.pkey!);
      return null;

    } catch (error) {
      console.error('💥 获取验证码失败:', error);
      return null;
    }
  }

  /**
   * 释放手机号
   */
  private async releasePhone(pkey: string): Promise<boolean> {
    if (!this.token) return false;

    try {
      const result = await this.client.releasePhone({
        token: this.token,
        pkey
      });

      if (result.success) {
        console.log('✅ 手机号释放成功');
        return true;
      } else {
        console.error('❌ 手机号释放失败:', result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 释放手机号异常:', error);
      return false;
    }
  }

  /**
   * 获取账户信息
   */
  async getAccountInfo() {
    if (!this.token) {
      throw new Error('服务未初始化');
    }

    try {
      const result = await this.client.getAccountInfo();
      
      if (result.success) {
        return {
          balance: result.balance,
          level: result.level,
          points: result.points
        };
      } else {
        console.error('❌ 获取账户信息失败:', result.error);
        return null;
      }
    } catch (error) {
      console.error('💥 获取账户信息异常:', error);
      return null;
    }
  }

  /**
   * 多次收码示例
   */
  async getMultipleCodes(projectId: string, count: number, mobile?: string): Promise<string[]> {
    if (!this.token) {
      throw new Error('服务未初始化');
    }

    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`\n🔄 开始第${i + 1}次收码...`);

      const phoneParams: GetPhoneParams = {
        token: this.token,
        iid: projectId,
        mobile: i === 0 ? undefined : mobile // 第一次不指定，后续使用相同手机号
      };

      try {
        const phoneResult = await this.client.getPhone(phoneParams);
        
        if (!phoneResult.success) {
          console.error(`❌ 第${i + 1}次获取手机号失败:`, phoneResult.error);
          break;
        }

        // 第一次记录手机号
        if (i === 0) {
          mobile = phoneResult.mobile;
          console.log('📱 使用手机号:', mobile);
        }

        // 等待验证码
        const code = await this.waitForSingleCode(phoneResult.pkey!);
        if (code) {
          codes.push(code);
          console.log(`✅ 第${i + 1}个验证码: ${code}`);
        } else {
          console.log(`❌ 第${i + 1}次收码失败`);
          break;
        }

      } catch (error) {
        console.error(`💥 第${i + 1}次收码异常:`, error);
        break;
      }
    }

    return codes;
  }

  /**
   * 等待单个验证码
   */
  private async waitForSingleCode(pkey: string, maxWait = 120000): Promise<string | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const messageResult = await this.client.getMessage({
          token: this.token!,
          pkey
        });

        if (messageResult.success && messageResult.sms && messageResult.code) {
          return messageResult.code;
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('获取验证码异常:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return null;
  }
}

/**
 * 使用示例
 */
async function demonstrateUsage() {
  const smsService = new FirefoxSmsService();

  try {
    // 1. 初始化服务
    const success = await smsService.initialize({
      ApiName: 'your_api_name',  // 替换为实际的 API 用户名
      PassWord: 'your_password'  // 替换为实际的密码
    });

    if (!success) {
      console.log('服务初始化失败，退出演示');
      return;
    }

    // 2. 获取账户信息
    const accountInfo = await smsService.getAccountInfo();
    if (accountInfo) {
      console.log('💰 账户信息:', accountInfo);
    }

    // 3. 获取单个验证码
    console.log('\n📱 获取验证码演示...');
    const code = await smsService.getVerificationCode('1001', {
      country: 'CN',
      maxWaitTime: 120000  // 2分钟超时
    });

    if (code) {
      console.log('🎉 成功获取验证码:', code);
    } else {
      console.log('❌ 未能获取到验证码');
    }

    // 4. 多次收码演示（注释掉，避免消耗余额）
    /*
    console.log('\n🔄 多次收码演示...');
    const codes = await smsService.getMultipleCodes('1001', 2);
    console.log('🎯 获取到的验证码:', codes);
    */

  } catch (error) {
    console.error('💥 演示过程中发生错误:', error);
  }
}

// 导出服务类和演示函数
export { FirefoxSmsService, demonstrateUsage };

// 如果直接运行
if (require.main === module) {
  demonstrateUsage();
} 