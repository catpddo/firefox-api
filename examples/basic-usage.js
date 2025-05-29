const FirefoxApi = require('../dist/index.js');

/**
 * Firefox 接码平台 SDK 基础使用示例
 */
async function basicExample() {
  // 初始化客户端
  const client = new FirefoxApi.default({
    timeout: 30000,  // 30秒超时
    retries: 3       // 重试3次
  });

  try {
    console.log('🚀 开始 Firefox 接码流程...');

    // 1. 登录获取 Token
    console.log('📝 正在登录...');
    const loginResult = await client.login({
      ApiName: 'your_api_name',    // 替换为您的 API 用户名  
      PassWord: 'your_password'    // 替换为您的登录密码
    });

    if (!loginResult.success) {
      console.error('❌ 登录失败:', loginResult.error);
      return;
    }

    console.log('✅ 登录成功！Token:', loginResult.token);

    // 2. 获取账户信息
    console.log('💰 获取账户信息...');
    const accountInfo = await client.getAccountInfo();
    if (accountInfo.success) {
      console.log(`💰 账户余额: ${accountInfo.balance}`);
      console.log(`⭐ 用户等级: ${accountInfo.level}`);
      console.log(`🏆 用户积分: ${accountInfo.points}`);
    }

    // 3. 获取手机号
    console.log('📱 获取手机号...');
    const phoneResult = await client.getPhone({
      token: loginResult.token,
      iid: '1001',          // 项目ID，根据实际项目修改
      country: 'CN'         // 可选：指定国家代码
    });

    if (!phoneResult.success) {
      console.error('❌ 获取手机号失败:', phoneResult.error);
      return;
    }

    console.log('✅ 获取手机号成功！');
    console.log(`📱 手机号: ${phoneResult.mobile}`);
    console.log(`🔑 Pkey: ${phoneResult.pkey}`);

    // 4. 等待并获取验证码
    console.log('⏳ 等待接收验证码...');
    const maxRetries = 10;
    let retryCount = 0;
    let messageResult = null;

    while (retryCount < maxRetries) {
      messageResult = await client.getMessage({
        token: loginResult.token,
        pkey: phoneResult.pkey
      });

      if (messageResult.success && messageResult.sms) {
        console.log('✅ 收到短信:', messageResult.sms);
        console.log('🔢 验证码:', messageResult.code);
        break;
      } else {
        console.log(`⏳ 第${retryCount + 1}次尝试，暂未收到验证码...`);
        // 等待5秒后重试
        await new Promise(resolve => setTimeout(resolve, 5000));
        retryCount++;
      }
    }

    // 5. 如果没有收到验证码，释放手机号
    if (!messageResult || !messageResult.success || !messageResult.sms) {
      console.log('⚠️  未收到验证码，释放手机号...');
      const releaseResult = await client.releasePhone({
        token: loginResult.token,
        pkey: phoneResult.pkey
      });

      if (releaseResult.success) {
        console.log('✅ 手机号释放成功');
      } else {
        console.error('❌ 手机号释放失败:', releaseResult.error);
      }
    } else {
      console.log('🎉 流程完成！验证码已获取:', messageResult.code);
    }

  } catch (error) {
    console.error('💥 操作失败:', error.message);
  }
}

/**
 * 获取价目表示例
 */
async function getPriceListExample() {
  const client = new FirefoxApi.default();

  try {
    console.log('📋 获取价目表...');
    
    // 获取所有项目
    const allItems = await client.getItemList();
    if (allItems.success && allItems.items) {
      console.log('📋 所有可用项目:');
      allItems.items.slice(0, 5).forEach(item => {
        console.log(`  • ${item.Item_Name} (${item.Country_Title}) - ¥${item.Item_UPrice}`);
      });
    }

    // 搜索特定项目
    const wechatItems = await client.getItemList({ key: '微信' });
    if (wechatItems.success && wechatItems.items) {
      console.log('\n🔍 微信相关项目:');
      wechatItems.items.forEach(item => {
        console.log(`  • ${item.Item_Name} (${item.Country_Title}) - ¥${item.Item_UPrice}`);
      });
    }

  } catch (error) {
    console.error('💥 获取价目表失败:', error.message);
  }
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  console.log('🎯 Firefox 接码平台 SDK 演示\n');
  
  // 运行基础示例
  basicExample()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      // 运行价目表示例
      return getPriceListExample();
    })
    .catch(error => {
      console.error('演示失败:', error);
    });
}

module.exports = {
  basicExample,
  getPriceListExample
}; 