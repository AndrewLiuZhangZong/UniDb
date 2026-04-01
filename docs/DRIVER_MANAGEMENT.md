# JDBC 驱动管理方案

## 概述

UniDb 采用分层架构来管理数据库连接驱动，实现可扩展、易维护的驱动体系。

## 架构设计

### 1. 驱动类型

UniDb 支持两种类型的驱动：

#### 原生驱动 (Native Drivers)
直接使用各数据库官方提供的 Node.js 驱动，无需额外配置：
- **MySQL**: `mysql2`
- **ClickHouse**: `@clickhouse/client`
- **MongoDB**: `mongodb`
- **Redis**: `ioredis`

这些驱动已内置于应用中，开箱即用。

#### JDBC 驱动 (JDBC Drivers)
通过 JayDeBeApi 中间层支持 Java JDBC 驱动：
- **PostgreSQL**: postgresql-42.x.jar
- **Oracle**: ojdbc*.jar
- **SQL Server**: mssql-jdbc*.jar
- **DB2**: jcc.jar
- **SAP HANA**: ngdbc.jar

### 2. 驱动存储结构

```
userData/
├── drivers/                 # 用户安装的 JDBC 驱动
│   ├── postgresql/
│   │   ├── postgresql-42.6.0.jar
│   │   └── metadata.json    # 驱动元信息
│   ├── oracle/
│   │   ├── ojdbc11.jar
│   │   └── metadata.json
│   └── custom/             # 用户自定义驱动
│       └── ...
└── settings.json            # 驱动配置
```

### 3. 元信息文件格式

```json
{
  "id": "postgresql-42.6.0",
  "name": "PostgreSQL JDBC Driver",
  "version": "42.6.0",
  "className": "org.postgresql.Driver",
  "urlPattern": "jdbc:postgresql://{host}:{port}/{database}",
  "downloadUrl": "https://jdbc.postgresql.org/download/postgresql-42.6.0.jar",
  "homepage": "https://jdbc.postgresql.org/",
  "license": "BSD-2-Clause",
  "installedAt": "2024-01-15T10:30:00Z",
  "fileSize": 986563,
  "checksum": "sha256:abc123..."
}
```

## 驱动管理功能

### 1. 内置驱动市场

预置常用驱动列表，用户可直接下载安装：
- PostgreSQL
- Oracle
- SQL Server
- MySQL (JDBC 版本)
- MariaDB
- DB2
- SAP HANA
- Apache Derby
- Firebird
- Tibero

### 2. 自动更新

- 定期检查驱动更新
- 显示当前版本和最新版本
- 一键更新到最新稳定版

### 3. 驱动验证

安装时自动验证：
- JAR 文件完整性
- 驱动类可加载
- 基本连接测试

### 4. 多版本共存

支持同一驱动的多个版本共存：
- 可选择使用特定版本
- 版本切换不影响连接配置

## 技术实现

### 驱动加载器

```typescript
// server/drivers/DriverManager.ts
interface DriverManager {
  // 加载 JDBC 驱动
  loadDriver(jarPath: string): Promise<string>

  // 创建连接
  createConnection(config: JDBCConfig): Promise<Connection>

  // 测试连接
  testConnection(config: JDBCConfig): Promise<boolean>

  // 获取驱动元信息
  getDriverInfo(jarPath: string): Promise<DriverMetadata>
}
```

### 驱动下载器

```typescript
interface DriverDownloader {
  // 下载驱动
  download(url: string, destPath: string): Promise<string>

  // 验证下载
  verify(jarPath: string, checksum: string): Promise<boolean>

  // 取消下载
  cancel(downloadId: string): void

  // 获取下载进度
  getProgress(downloadId: string): DownloadProgress
}
```

## 安全考虑

1. **驱动签名验证**: 对重要驱动进行签名验证
2. **沙箱隔离**: JDBC 驱动在受限环境中执行
3. **网络隔离**: 下载使用 HTTPS 并验证证书
4. **恶意检测**: 扫描可疑 JAR 文件

## 维护计划

### 短期 (v0.2)
- 实现基础 JDBC 驱动加载
- 支持 PostgreSQL、MySQL JDBC

### 中期 (v0.3)
- 添加 Oracle、SQL Server 支持
- 实现驱动自动更新
- 驱动市场界面

### 长期 (v1.0)
- ODBC 驱动支持
- 驱动性能分析
- 云端驱动同步
