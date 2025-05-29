# 🚀 自动发布配置指南

本项目已配置了自动发布功能。当您推送代码到main分支时，系统会自动：

1. ✅ 自动更新版本号（patch）
2. ✅ 创建GitHub Release
3. ✅ 发布到npm

## 📋 配置步骤

### 1. 设置NPM Token

1. 登录到 [npmjs.com](https://www.npmjs.com)
2. 进入 Account Settings → Access Tokens
3. 点击 "Generate New Token"
4. 选择 "Automation" 类型
5. 复制生成的token

### 2. 配置GitHub Secrets

在您的GitHub仓库中：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加：

```
Name: NPM_TOKEN
Value: 您的npm token
```

## 🎯 使用方法

### 正常提交代码（自动发布）

```bash
# 修改代码
git add .
git commit -m "修复了一个bug"
git push origin main
```

推送后，系统会自动：
- 版本号 1.0.0 → 1.0.1 → 1.0.2 ...
- 创建GitHub Release
- 发布到npm

### 跳过自动发布

如果不想发布，在commit消息中添加 `[skip release]`：

```bash
git commit -m "更新文档 [skip release]"
```

## 📦 发布流程

1. **构建检查** → 安装依赖、编译TypeScript
2. **版本更新** → 自动patch版本号
3. **创建标签** → 在GitHub创建版本标签
4. **GitHub Release** → 自动创建发布说明
5. **NPM发布** → 推送到npm registry

## ✅ 验证发布

发布成功后：

1. **检查GitHub Actions**: 进入Actions页面查看执行状态
2. **检查NPM包**: https://www.npmjs.com/package/@pddo/firefox-api
3. **安装测试**:
   ```bash
   npm install @pddo/firefox-api@latest
   ```

## 🐛 故障排除

### NPM发布失败
- 检查NPM_TOKEN是否正确设置
- 查看Actions日志获取详细错误信息

### 构建失败
- 检查代码是否通过编译
- 查看CI工作流日志

---

配置完成后，您只需要正常提交代码到main分支，系统就会自动处理版本管理和发布！🎉 