# 快速启动指南（跳过 Electron）

## 问题说明

Electron 安装很慢，我们可以先测试前端和后端功能，不需要 Electron 也能开发。

## 方案 1：纯 Web 模式（推荐）

```bash
# 只启动前端（在浏览器中测试）
pnpm dev

# 浏览器访问: http://localhost:5173
```

## 方案 2：使用更新的 Electron 版本

```bash
# 删除旧版本
rm -rf node_modules/electron

# 安装最新稳定版（更快）
pnpm add -D electron@latest

# 或者使用淘宝镜像加速
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ pnpm add -D electron@latest
```

## 方案 3：使用 Yarn 或 NPM

```bash
# 使用 yarn（通常更快）
yarn add -D electron

# 或使用 npm 配置镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install electron --save-dev
```

## 当前可用的功能

即使没有 Electron，你也可以：

1. ✅ 在浏览器中测试所有 UI 界面
2. ✅ 测试数据库连接功能
3. ✅ 开发和调试前端组件
4. ✅ 测试后端 API

## Electron 相关链接

- 官网: https://www.electronjs.org/
- 下载: https://github.com/electron/electron/releases
- NPM: https://www.npmjs.com/package/electron
- 中国镜像: https://npmmirror.com/mirrors/electron/

## 推荐：先用浏览器开发

```bash
# 启动开发服务器
pnpm dev

# 在浏览器打开 http://localhost:5173
# 所有功能都可以正常使用！
```

等 Electron 安装好后再打包成桌面应用也不迟。
