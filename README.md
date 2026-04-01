# UniDb - 数据库管理工具

现代化的跨平台数据库管理工具，支持 MySQL、ClickHouse、MongoDB、Redis。

## 特性

- 🎨 现代化的用户界面（基于 Naive UI）
- 🌍 多语言支持（中文、英文）
- 💾 支持多种数据库
  - MySQL
  - ClickHouse
  - MongoDB
  - Redis
- 🖥️ 跨平台桌面应用（Windows, macOS）
- 💿 完全本地化存储（无需登录）

## 技术栈

- **前端**: Vue 3 + TypeScript + Naive UI
- **后端**: Node.js + Express
- **桌面**: Electron
- **数据库驱动**: 
  - mysql2 (MySQL)
  - @clickhouse/client (ClickHouse)
  - mongodb (MongoDB)
  - ioredis (Redis)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm electron:dev

# 构建
pnpm electron:build
```

## 项目结构

```
unidb/
├── electron/          # Electron 主进程
├── server/            # Node.js 后端服务
├── src/               # Vue 前端应用
├── package.json
└── vite.config.ts
```

## License

MIT
