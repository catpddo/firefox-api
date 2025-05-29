/**
 * Firefox 接码平台 API 类型定义
 */

// 基础响应类型
export interface BaseResponse {
  success: boolean;
  data?: string;
  error?: string;
  errorCode?: number;
}

// 登录请求参数
export interface LoginParams {
  ApiName: string;  // API用户名
  PassWord: string; // 登录密码
}

// 登录响应
export interface LoginResponse extends BaseResponse {
  token?: string;
}

// 账户信息响应
export interface AccountInfoResponse extends BaseResponse {
  balance?: number;    // 用户余额
  level?: number;      // 用户等级
  points?: number;     // 用户积分
}

// 获取手机号请求参数
export interface GetPhoneParams {
  token: string;       // 登录token
  iid: string;         // 项目ID
  country?: string;    // 国家代码
  did?: string;        // 开发者ID
  dock?: '0' | '1';    // 是否返回对接码
  maxPrice?: number;   // 最大单价
  mobile?: string;     // 指定号段或手机号
  pushUrl?: string;    // 推送链接
}

// 获取手机号响应
export interface GetPhoneResponse extends BaseResponse {
  pkey?: string;       // 手机号唯一标识
  getTime?: string;    // 提取时间
  countryCode?: string; // 国家代码
  countryNum?: string; // 国家区号
  location?: string;   // 归属地
  port?: string;       // 端口号
  mobile?: string;     // 手机号
  dockCode?: string;   // 对接码
}

// 获取验证码请求参数
export interface GetMessageParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
}

// 获取验证码响应
export interface GetMessageResponse extends BaseResponse {
  sms?: string;        // 短信内容
  code?: string;       // 验证码
  time?: string;       // 接收时间
}

// 发送短信请求参数
export interface SendSmsParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
  msg: string;         // 短信内容
  voice?: '0' | '1';   // 是否语音
}

// 发送短信响应
export interface SendSmsResponse extends BaseResponse {
  sendId?: string;     // 发送ID
}

// 获取发短信回执请求参数
export interface GetSmsStatusParams {
  token: string;       // 登录token
  sendId: string;      // 发送ID
}

// 获取发短信回执响应
export interface GetSmsStatusResponse extends BaseResponse {
  status?: string;     // 发送状态
}

// 释放手机号请求参数
export interface ReleasePhoneParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
}

// 加黑手机号请求参数
export interface BlacklistPhoneParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
  reason: string;      // 加黑原因
}

// 状态反馈请求参数
export interface ApiReturnParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
  remark: '0' | '-1' | '-2' | '-3' | string; // 反馈信息
}

// 再次使用请求参数
export interface SetAgainParams {
  token: string;       // 登录token
  pkey: string;        // 手机号唯一标识
  min?: number;        // 多少分钟后再次使用(2-300)
}

// 获取价目表请求参数
export interface GetItemParams {
  key?: string;        // 项目名称关键字
}

// 价目表项目信息
export interface ItemInfo {
  Item_ID: string;     // 项目ID
  Item_Name: string;   // 项目名称
  Item_UPrice: number; // 项目单价
  Country_ID: string;  // 国家代码
  Country_Title: string; // 国家名称
}

// 获取价目表响应
export interface GetItemResponse extends BaseResponse {
  items?: ItemInfo[];
}

// Firefox API 客户端配置
export interface FirefoxApiConfig {
  baseUrl?: string;    // API基础URL
  timeout?: number;    // 请求超时时间(毫秒)
  retries?: number;    // 重试次数
}

// 错误代码映射
export const ERROR_CODES = {
  // 登录错误
  LOGIN_EMPTY_USERNAME: -1,
  LOGIN_USERNAME_LENGTH: -2,
  LOGIN_USERNAME_INVALID_CHAR: -3,
  LOGIN_USERNAME_NO_CHINESE: -4,
  LOGIN_EMPTY_PASSWORD: -5,
  LOGIN_PASSWORD_LENGTH: -6,
  LOGIN_IP_WAIT: -7,
  LOGIN_ACCOUNT_DISABLED: -8,
  LOGIN_WRONG_CREDENTIALS: -9,

  // 账户信息错误
  ACCOUNT_TOKEN_NOT_EXIST: -1,
  ACCOUNT_TOKEN_EXPIRED: -2,
  ACCOUNT_REQUEST_TOO_FREQUENT: -3,

  // 获取手机号错误
  PHONE_NO_AVAILABLE: -1,
  PHONE_TOKEN_NOT_EXIST: -2,
  PHONE_INVALID_PROJECT: -3,
  PHONE_INVALID_COUNTRY: -4,
  PHONE_PROJECT_NOT_APPROVED: -5,
  PHONE_PROJECT_DISABLED: -6,
  PHONE_USER_DISABLED: -7,
  PHONE_INSUFFICIENT_BALANCE: -8,
  PHONE_TOO_MANY_OCCUPIED: -9,
  PHONE_NO_SPECIFY_ALLOWED: -10,

  // 获取验证码错误
  MESSAGE_TOKEN_NOT_EXIST: -1,
  MESSAGE_INVALID_PKEY: -2,
  MESSAGE_NO_MESSAGE: -3,

  // 释放手机号错误
  RELEASE_TOKEN_NOT_EXIST: -1,
  RELEASE_INVALID_PKEY: -2,
  RELEASE_PHONE_NOT_EXIST: -3,
  RELEASE_ALREADY_CODED: -4,
  RELEASE_SMS_SUBMITTED: -5,
  RELEASE_EXCEED_LIMIT: -6,

  // 加黑手机号错误
  BLACKLIST_TOKEN_NOT_EXIST: -1,
  BLACKLIST_INVALID_PKEY: -2,
  BLACKLIST_EMPTY_REASON: -3,
  BLACKLIST_PHONE_NOT_EXIST: -4,
  BLACKLIST_NOT_CODED: -5,
  BLACKLIST_PERMISSION_DENIED: -6,

  // 状态反馈错误
  RETURN_TOKEN_NOT_EXIST: -1,
  RETURN_INVALID_PKEY: -2,
  RETURN_EMPTY_REMARK: -3,
  RETURN_NO_PERMISSION: -4,
  RETURN_NO_API_PERMISSION: -5,

  // 再次使用错误
  AGAIN_TOKEN_NOT_EXIST: -1,
  AGAIN_INVALID_PKEY: -2,
  AGAIN_INVALID_MIN: -3,
  AGAIN_PHONE_NOT_EXIST: -4,
  AGAIN_NOT_CODED: -5,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]; 