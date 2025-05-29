# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### 🎉 Initial Release

#### ✨ Added
- 完整的 Firefox 接码平台 API SDK
- TypeScript 类型支持和类型定义
- 智能验证码提取功能
- 自动重试机制
- 错误代码映射和处理
- 多次收码支持
- URL 编码处理
- 完整的中文文档和使用示例

#### 📦 Core Features
- **登录认证** - 获取和管理 API Token
- **手机号管理** - 获取、释放、加黑手机号
- **验证码接收** - 智能提取多种格式的验证码
- **短信发送** - 支持文本和语音短信
- **账户管理** - 查看余额、等级、积分
- **价目表查询** - 获取项目价格信息
- **状态反馈** - 向平台反馈使用状态

#### 🛠️ Technical Features
- **TypeScript 支持** - 完整的类型定义和 IntelliSense
- **现代化构建** - 使用 Bun 和 TypeScript
- **自动化发布** - GitHub Actions 自动版本管理和 npm 发布
- **错误处理** - 完善的错误代码映射
- **重试机制** - 自动重试失败的请求
- **多格式支持** - 支持 ESM 和 CommonJS

#### 📚 Documentation
- 详细的中文 README 文档
- 完整的 API 文档
- JavaScript 和 TypeScript 使用示例
- 错误处理指南
- 自动发布配置指南

---

## 版本规则

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **MAJOR** 版本：不兼容的 API 修改
- **MINOR** 版本：向下兼容的功能性新增
- **PATCH** 版本：向下兼容的问题修正

### Commit 消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` - 新功能 (minor)
- `fix:` - 修复 (patch)
- `docs:` - 文档更新 (patch)
- `refactor:` - 重构 (patch)
- `test:` - 测试 (patch)
- `chore:` - 构建/工具链 (patch)
- `feat!:` 或 `BREAKING CHANGE:` - 破坏性变更 (major) 