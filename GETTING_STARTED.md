# UniDb 开发指南

## 项目已创建完成 ✅

### 已完成的工作

1. ✅ **项目结构搭建**
   - Electron 主进程和预加载脚本
   - Vue 3 前端应用（Naive UI）
   - Node.js 后端服务
   - 四种数据库适配器（MySQL, ClickHouse, MongoDB, Redis）

2. ✅ **核心功能实现**
   - 连接管理（增删改查）
   - 连接测试
   - 查询执行
   - 本地数据存储（SQLite）

3. ✅ **依赖安装**
   - 所有前端和后端依赖已安装
   - 数据库原生驱动已配置

## 启动项目

### 开发模式

```bash
cd /Users/edy/Lemo/UniDb

# 启动开发服务器（Vite + Electron）
pnpm electron:dev
```

这将同时启动：
- Vite 开发服务器（前端热重载）
- Electron 应用
- Node.js 后端服务（端口 3000）

### 构建生产版本

```bash
# 构建应用
pnpm electron:build

# 构建产物在 dist/ 和 dist-electron/ 目录
```

## 项目结构

```
UniDb/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
│
├── server/               # Node.js 后端
│   ├── index.ts         # 服务入口
│   ├── database/        # 本地数据库
│   │   └── init.ts      # SQLite 初始化
│   ├── routes/          # API 路由
│   │   ├── connection.ts
│   │   └── query.ts
│   └── adapters/        # 数据库适配器
│       ├── factory.ts
│       ├── mysql.ts
│       ├── clickhouse.ts
│       ├── mongodb.ts
│       └── redis.ts
│
├── src/                  # Vue 3 前端
│   ├── main.ts          # 应用入口
│   ├── App.vue          # 根组件
│   ├── router/          # 路由
│   ├── stores/          # Pinia 状态管理
│   ├── views/           # 页面组件
│   ├── components/      # 通用组件
│   └── locales/         # 国际化
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── DESIGN.md            # 详细设计文档
```

## 下一步开发建议

### Phase 1 - 完善基础功能

1. **连接管理优化**
   - [ ] 添加连接分组功能
   - [ ] 实现连接配置导入/导出
   - [ ] 添加连接颜色标识

2. **SQL 编辑器**
   - [ ] 集成 Monaco Editor
   - [ ] 实现语法高亮
   - [ ] 添加代码补全

3. **查询结果展示**
   - [ ] 实现虚拟滚动表格
   - [ ] 添加结果导出功能
   - [ ] 支持多种视图（表格/JSON/文本）

4. **数据库对象浏览**
   - [ ] MySQL: 显示数据库、表、列
   - [ ] ClickHouse: 显示集群信息
   - [ ] MongoDB: 显示 Collection
   - [ ] Redis: 显示 Keys

### Phase 2 - 高级功能

1. **集群模式支持**
   - [ ] MySQL 主从复制
   - [ ] ClickHouse 分布式集群
   - [ ] MongoDB Replica Set
   - [ ] Redis Cluster

2. **监控和分析**
   - [ ] 慢查询分析
   - [ ] 连接池监控
   - [ ] 性能指标展示

3. **专属工具**
   - [ ] MySQL 表设计器
   - [ ] MongoDB Aggregation Pipeline 构建器
   - [ ] Redis 数据类型可视化

## 技术栈

### 前端
- Vue 3.5 + TypeScript
- Naive UI 2.44（暗色主题）
- Pinia 2.3（状态管理）
- Vue Router 4.6
- Vue I18n 9.14（国际化）
- ECharts 5.6（图表）

### 后端
- Node.js + Express 4.22
- Better-SQLite3 9.6（本地存储）
- MySQL2 3.20（MySQL 驱动）
- @clickhouse/client 0.2（ClickHouse 驱动）
- MongoDB 6.21（MongoDB 驱动）
- ioredis 5.10（Redis 驱动）

### 桌面
- Electron 28.3
- electron-builder 24.13

## 常见问题

### 1. TypeScript 错误

所有 TypeScript 错误都是正常的，因为依赖已安装。重启 IDE 或运行：

```bash
pnpm install
```

### 2. 数据库连接失败

确保目标数据库服务正在运行，并且连接配置正确。

### 3. 端口冲突

后端服务默认使用 3000 端口，如果冲突可以修改 `server/index.ts`。

## 开发工具

### 推荐的 VS Code 插件
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier

### 调试

开发模式下会自动打开 DevTools，可以查看：
- Console 日志
- Network 请求
- Vue DevTools

## 贡献指南

1. 遵循现有代码风格
2. 使用 TypeScript 类型
3. 添加必要的注释
4. 测试新功能

## License

MIT
