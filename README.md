# Firefox 接码平台 SDK

一个用于 Firefox 接码平台的 TypeScript/JavaScript SDK，提供完整的 API 接口封装。

## 特性

- 🚀 完整的 TypeScript 类型支持
- 📝 详细的 JSDoc 文档
- 🔄 自动重试机制
- 🛡️ 错误处理和验证
- 📱 支持多次收码
- 🎯 智能验证码提取
- 🌐 URL 编码处理

## 安装

使用 bun 安装：

```bash
bun add @pddo/firefox-api
```

使用 npm 安装：

```bash
npm install @pddo/firefox-api
```

## 快速开始

### 基础使用

```typescript
import FirefoxApi from '@pddo/firefox-api';

const client = new FirefoxApi({
  timeout: 30000,  // 请求超时时间
  retries: 3       // 重试次数
});

// 登录获取 Token
const loginResult = await client.login({
  ApiName: 'your_api_name',  // 您的 API 用户名
  PassWord: 'your_password'  // 您的登录密码
});

if (loginResult.success) {
  console.log('登录成功，Token:', loginResult.token);
}
```

### 获取手机号和验证码

```typescript
// 获取手机号
const phoneResult = await client.getPhone({
  token: loginResult.token!,
  iid: '1001',     // 项目ID
  country: 'CN'    // 可选：指定国家代码
});

if (phoneResult.success) {
  console.log('手机号:', phoneResult.mobile);
  console.log('Pkey:', phoneResult.pkey);

  // 等待并获取验证码
  const messageResult = await client.getMessage({
    token: loginResult.token!,
    pkey: phoneResult.pkey!
  });

  if (messageResult.success) {
    console.log('短信内容:', messageResult.sms);
    console.log('验证码:', messageResult.code);
  }
}
```

### 循环等待验证码

```typescript
async function waitForCode(client: FirefoxApi, token: string, pkey: string) {
  const maxRetries = 10;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    const messageResult = await client.getMessage({ token, pkey });

    if (messageResult.success && messageResult.sms) {
      console.log('收到验证码:', messageResult.code);
      return messageResult;
    }

    console.log(`第${retryCount + 1}次尝试，暂未收到验证码...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    retryCount++;
  }

  console.log('等待验证码超时');
  return null;
}
```

### 释放手机号

```typescript
// 如果没有收到验证码，应该释放手机号
const releaseResult = await client.releasePhone({
  token: loginResult.token!,
  pkey: phoneResult.pkey!
});

if (releaseResult.success) {
  console.log('手机号释放成功');
}
```

## API 文档

### 构造函数

```typescript
new FirefoxApi(config?: FirefoxApiConfig)
```

配置选项：
- `baseUrl?: string` - API 基础 URL（默认：'http://www.firefox.fun'）
- `timeout?: number` - 请求超时时间，单位毫秒（默认：30000）
- `retries?: number` - 重试次数（默认：0）

### 主要方法

#### 1. 登录

```typescript
login(params: LoginParams): Promise<LoginResponse>
```

参数：
- `ApiName: string` - API 用户名
- `PassWord: string` - 登录密码

#### 2. 获取账户信息

```typescript
getAccountInfo(): Promise<AccountInfoResponse>
```

返回用户余额、等级和积分信息。

#### 3. 获取手机号

```typescript
getPhone(params: GetPhoneParams): Promise<GetPhoneResponse>
```

参数：
- `token: string` - 登录 Token
- `iid: string` - 项目 ID
- `country?: string` - 国家代码（可选）
- `did?: string` - 开发者 ID（可选）
- `dock?: '0' | '1'` - 是否返回对接码（可选）
- `maxPrice?: number` - 最大单价（可选）
- `mobile?: string` - 指定号段或手机号（可选）
- `pushUrl?: string` - 推送链接（可选）

#### 4. 获取验证码

```typescript
getMessage(params: GetMessageParams): Promise<GetMessageResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识

#### 5. 释放手机号

```typescript
releasePhone(params: ReleasePhoneParams): Promise<BaseResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识

#### 6. 加黑手机号

```typescript
blacklistPhone(params: BlacklistPhoneParams): Promise<BaseResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识
- `reason: string` - 加黑原因

#### 7. 发送短信

```typescript
sendSms(params: SendSmsParams): Promise<SendSmsResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识
- `msg: string` - 短信内容
- `voice?: '0' | '1'` - 是否语音（可选）

#### 8. 获取价目表

```typescript
getItemList(params?: GetItemParams): Promise<GetItemResponse>
```

参数：
- `key?: string` - 项目名称关键字（可选）

#### 9. 状态反馈

```typescript
apiReturn(params: ApiReturnParams): Promise<BaseResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识
- `remark: '0' | '-1' | '-2' | '-3' | string` - 反馈信息

#### 10. 再次使用

```typescript
setAgain(params: SetAgainParams): Promise<BaseResponse>
```

参数：
- `token: string` - 登录 Token
- `pkey: string` - 手机号唯一标识
- `min?: number` - 多少分钟后再次使用（2-300，默认5）

### 工具方法

```typescript
setToken(token: string): void      // 设置 Token
getToken(): string | undefined     // 获取当前 Token
clearToken(): void                 // 清除 Token
```

## 多次收码

对于需要多次接收验证码的场景，可以使用指定手机号再次获取：

```typescript
// 第一次获取手机号
const phoneResult = await client.getPhone({
  token: token,
  iid: '1001'
});

// 第一次收码
const firstMessage = await client.getMessage({
  token: token,
  pkey: phoneResult.pkey!
});

// 第二次收码 - 指定使用相同手机号
const secondPhoneResult = await client.getPhone({
  token: token,
  iid: '1001',
  mobile: phoneResult.mobile  // 指定手机号
});

const secondMessage = await client.getMessage({
  token: token,
  pkey: secondPhoneResult.pkey!
});
```

## 错误处理

SDK 提供了完整的错误代码映射：

```typescript
import { ERROR_CODES } from '@pddo/firefox-api';

const result = await client.login(params);
if (!result.success) {
  switch (result.errorCode) {
    case ERROR_CODES.LOGIN_WRONG_CREDENTIALS:
      console.log('用户名或密码错误');
      break;
    case ERROR_CODES.LOGIN_ACCOUNT_DISABLED:
      console.log('账号已被禁用');
      break;
    default:
      console.log('未知错误:', result.error);
  }
}
```

## 验证码提取

SDK 内置智能验证码提取功能，支持多种常见格式：

- 纯数字验证码（4-8位）
- "验证码：123456" 格式
- "code: 123456" 格式
- 其他常见中文格式

提取的验证码通过 `GetMessageResponse.code` 字段返回。

## 重要提醒

1. **及时释放手机号**：如果没有收到验证码，请务必调用 `releasePhone()` 方法释放手机号，避免余额扣费。

2. **控制请求频率**：建议在循环获取验证码时添加适当的延迟（如5秒），避免过于频繁的请求。

3. **错误处理**：建议对所有 API 调用进行适当的错误处理。

4. **Token 管理**：Token 在未修改账户密码前保持不变，建议缓存使用。

## 开发

```bash
# 安装依赖
bun install

# 构建
bun run build

# 开发模式
bun run dev

# 格式化代码
bun run format

# 代码检查
bun run lint
```

## 🚀 自动发布

本项目配置了自动版本管理和npm发布功能。

### 使用方法

```bash
# 正常提交代码
git add .
git commit -m "修复了一个bug"
git push origin main
```

推送到main分支后，系统会自动：
1. ✅ 更新版本号（patch：1.0.0 → 1.0.1）
2. ✅ 创建GitHub Release
3. ✅ 发布到npm

### 跳过发布

如果不想触发发布，在commit消息中添加 `[skip release]`：

```bash
git commit -m "更新文档 [skip release]"
```

### 发布配置

**GitHub设置（必需）：**
1. 获取npm token：登录npmjs.com → Account Settings → Access Tokens → Generate New Token (Automation)
2. 在GitHub仓库设置中添加Secret：`NPM_TOKEN` = 您的npm token

详细配置说明请参考：[scripts/setup-release.md](scripts/setup-release.md)

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码规范

- 使用TypeScript
- 遵循ESLint配置
- 添加适当的注释和文档
- 确保构建通过

## 许可证

MIT

## 支持

如有问题请提交 Issue 或联系技术支持。

---

**注意**：使用本 SDK 前请确保您已注册 Firefox 接码平台账户并获得相应的 API 权限。 