import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  FirefoxApiConfig,
  LoginParams,
  LoginResponse,
  AccountInfoResponse,
  GetPhoneParams,
  GetPhoneResponse,
  GetMessageParams,
  GetMessageResponse,
  SendSmsParams,
  SendSmsResponse,
  GetSmsStatusParams,
  GetSmsStatusResponse,
  ReleasePhoneParams,
  BlacklistPhoneParams,
  ApiReturnParams,
  SetAgainParams,
  GetItemParams,
  GetItemResponse,
  BaseResponse,
  ERROR_CODES
} from './types';

/**
 * Firefox 接码平台 SDK
 * 提供完整的 API 接口封装
 */
export class FirefoxApi {
  private client: AxiosInstance;
  private baseUrl: string;
  private token?: string;

  constructor(config: FirefoxApiConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://www.firefox.fun';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Firefox-API-SDK/1.0.0'
      }
    });

    // 请求重试配置
    if (config.retries && config.retries > 0) {
      this.setupRetryInterceptor(config.retries);
    }
  }

  /**
   * 设置请求重试拦截器
   */
  private setupRetryInterceptor(retries: number): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || config.retryCount >= retries) {
          return Promise.reject(error);
        }

        config.retryCount = config.retryCount || 0;
        config.retryCount++;

        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
        
        return this.client(config);
      }
    );
  }

  /**
   * 解析 API 响应
   */
  private parseApiResponse(response: string): BaseResponse {
    // 确保 response 是字符串
    const responseStr = String(response || '');
    const parts = responseStr.split('|');
    const success = parts[0] === '1';
    
    if (success) {
      return {
        success: true,
        data: parts.slice(1).join('|')
      };
    } else {
      const errorCode = parseInt(parts[1] || '0') || 0;
      return {
        success: false,
        error: parts[1] || 'Unknown error',
        errorCode
      };
    }
  }

  /**
   * 发送 API 请求
   */
  private async request(params: Record<string, any>): Promise<string> {
    try {
      // URL 编码中文字符
      const encodedParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          encodedParams[key] = encodeURIComponent(String(value));
        }
      }

      const response: AxiosResponse<string> = await this.client.get('/yhapi.ashx', {
        params: encodedParams
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`请求失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 登录获取 Token
   * @param params 登录参数
   * @returns 登录响应
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    const response = await this.request({
      act: 'login',
      ApiName: params.ApiName,
      PassWord: params.PassWord
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      this.token = parsed.data;
      return {
        success: true,
        token: parsed.data
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 获取账户信息
   * @returns 账户信息响应
   */
  async getAccountInfo(): Promise<AccountInfoResponse> {
    if (!this.token) {
      throw new Error('请先调用 login() 方法获取 token');
    }

    const response = await this.request({
      act: 'myInfo',
      token: this.token
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      const parts = parsed.data.split('|');
      return {
        success: true,
        balance: parseFloat(parts[0] || '0') || 0,
        level: parseInt(parts[1] || '0') || 0,
        points: parseInt(parts[2] || '0') || 0
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 获取手机号
   * @param params 获取手机号参数
   * @returns 获取手机号响应
   */
  async getPhone(params: GetPhoneParams): Promise<GetPhoneResponse> {
    const response = await this.request({
      act: 'getPhone',
      token: params.token,
      iid: params.iid,
      country: params.country || '',
      did: params.did || '',
      dock: params.dock || '',
      maxPrice: params.maxPrice || 0,
      mobile: params.mobile || '',
      pushUrl: params.pushUrl || ''
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      const parts = parsed.data.split('|');
      return {
        success: true,
        pkey: parts[0],
        getTime: parts[1],
        countryCode: parts[2],
        countryNum: parts[3],
        location: parts[4],
        port: parts[5],
        mobile: parts[6],
        dockCode: parts[7]
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 获取验证码
   * @param params 获取验证码参数
   * @returns 获取验证码响应
   */
  async getMessage(params: GetMessageParams): Promise<GetMessageResponse> {
    const response = await this.request({
      act: 'getMessage',
      token: params.token,
      pkey: params.pkey
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      const parts = parsed.data.split('|');
      return {
        success: true,
        sms: parts[0],
        code: this.extractVerificationCode(parts[0] || ''),
        time: parts[1]
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 从短信内容中提取验证码
   */
  private extractVerificationCode(sms: string): string | undefined {
    // 匹配常见的验证码格式
    const patterns = [
      /(\d{4,8})/g,           // 4-8位数字
      /验证码[：:]\s*(\d+)/g,    // 验证码：123456
      /code[：:]\s*(\d+)/gi,   // code: 123456
      /[码码][：:]\s*(\d+)/g,   // 验证码：123456
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(sms);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * 发送短信
   * @param params 发送短信参数
   * @returns 发送短信响应
   */
  async sendSms(params: SendSmsParams): Promise<SendSmsResponse> {
    const response = await this.request({
      act: 'sendSms',
      token: params.token,
      pkey: params.pkey,
      msg: params.msg,
      voice: params.voice || '0'
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      return {
        success: true,
        sendId: parsed.data
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 获取发短信回执
   * @param params 获取发短信回执参数
   * @returns 获取发短信回执响应
   */
  async getSmsStatus(params: GetSmsStatusParams): Promise<GetSmsStatusResponse> {
    const response = await this.request({
      act: 'getSmsStatus',
      token: params.token,
      sendId: params.sendId
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      return {
        success: true,
        status: parsed.data
      };
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 释放手机号
   * @param params 释放手机号参数
   * @returns 基础响应
   */
  async releasePhone(params: ReleasePhoneParams): Promise<BaseResponse> {
    const response = await this.request({
      act: 'setRel',
      token: params.token,
      pkey: params.pkey
    });

    return this.parseApiResponse(response);
  }

  /**
   * 加黑手机号
   * @param params 加黑手机号参数
   * @returns 基础响应
   */
  async blacklistPhone(params: BlacklistPhoneParams): Promise<BaseResponse> {
    const response = await this.request({
      act: 'addBlack',
      token: params.token,
      pkey: params.pkey,
      reason: params.reason
    });

    return this.parseApiResponse(response);
  }

  /**
   * 状态反馈
   * @param params 状态反馈参数
   * @returns 基础响应
   */
  async apiReturn(params: ApiReturnParams): Promise<BaseResponse> {
    const response = await this.request({
      act: 'apiReturn',
      token: params.token,
      pkey: params.pkey,
      remark: params.remark
    });

    return this.parseApiResponse(response);
  }

  /**
   * 再次使用手机号
   * @param params 再次使用参数
   * @returns 基础响应
   */
  async setAgain(params: SetAgainParams): Promise<BaseResponse> {
    const response = await this.request({
      act: 'setAgain',
      token: params.token,
      pkey: params.pkey,
      min: params.min || 5
    });

    return this.parseApiResponse(response);
  }

  /**
   * 获取价目表
   * @param params 获取价目表参数
   * @returns 获取价目表响应
   */
  async getItemList(params: GetItemParams = {}): Promise<GetItemResponse> {
    const response = await this.request({
      act: 'getItem',
      key: params.key || ''
    });

    const parsed = this.parseApiResponse(response);
    
    if (parsed.success && parsed.data) {
      try {
        const items = JSON.parse(parsed.data);
        return {
          success: true,
          items: Array.isArray(items) ? items : [items]
        };
      } catch (error) {
        return {
          success: false,
          error: '解析价目表数据失败'
        };
      }
    }

    return {
      success: false,
      error: parsed.error,
      errorCode: parsed.errorCode
    };
  }

  /**
   * 设置 Token
   * @param token Token 值
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 获取当前 Token
   * @returns 当前 Token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * 清除 Token
   */
  clearToken(): void {
    this.token = undefined;
  }
}

// 导出类型和常量
export * from './types';
export { ERROR_CODES };

// 默认导出
export default FirefoxApi;
