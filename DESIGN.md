# UniDb - 数据库管理工具设计文档

## 项目概述

UniDb 是一个现代化的跨平台数据库管理工具，类似于 DBeaver，支持多种数据库的连接、查询和管理。

### 核心特性
- 🎨 现代化的用户界面设计
- 🌍 多语言支持（中文、英文）
- 💾 支持多种数据库（MySQL, PostgreSQL, Oracle, SQL Server, SQLite 等）
- 🖥️ 跨平台桌面应用（Windows, macOS）
- 🔌 基于 JDBC 驱动的数据库连接
- 📊 SQL 编辑器与查询执行
- 🗂️ 数据库结构浏览与管理
- 💿 完全本地化存储（无需登录，所有数据保存在本地）

---

## 技术栈

### 前端技术
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 框架**: Element Plus / Ant Design Vue / Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **代码编辑器**: Monaco Editor (VS Code 编辑器核心)
- **图标**: @iconify/vue (支持多种图标集)
- **样式**: 
  - TailwindCSS (实用优先的 CSS 框架)
  - SCSS (预处理器)
- **国际化**: Vue I18n
- **HTTP 客户端**: Axios
- **数据可视化**: ECharts (用于查询结果可视化)

### 后端技术
- **运行时**: Node.js 18+
- **框架**: Express.js / Fastify
- **JDBC 桥接**: node-java / node-jdbc
- **数据库驱动管理**: 动态加载 JDBC 驱动
- **进程通信**: IPC (Electron)
- **本地存储**: Better-SQLite3 (用户数据、配置、SQL 脚本)
- **文件系统**: fs-extra (SQL 文件管理)
- **日志**: Winston / Pino

### 桌面应用打包
- **框架**: Electron
- **打包工具**: 
  - electron-builder (Windows .exe, macOS .dmg/.app)
  - electron-vite (开发构建优化)
- **自动更新**: electron-updater

### 开发工具
- **包管理器**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **Git Hooks**: Husky + lint-staged
- **版本控制**: Git

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Electron 主进程                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  窗口管理     │  │  菜单管理     │  │  自动更新     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────────┐   │
│  │           IPC 通信层 (主进程端)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕ IPC
┌─────────────────────────────────────────────────────────┐
│                   Electron 渲染进程                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Vue 3 前端应用                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ 连接管理  │  │ SQL编辑器 │  │ 数据浏览  │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ 表结构    │  │ 查询结果  │  │ 设置面板  │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           IPC 通信层 (渲染进程端)                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/IPC
┌─────────────────────────────────────────────────────────┐
│                   Node.js 后端服务                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Express/Fastify API                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ 连接池    │  │ 查询执行  │  │ 元数据    │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              JDBC 桥接层                          │   │
│  │         (node-java / node-jdbc)                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕ JDBC
┌─────────────────────────────────────────────────────────┐
│                    JDBC 驱动层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  MySQL   │  │PostgreSQL│  │  Oracle  │  ...        │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                      数据库                              │
└─────────────────────────────────────────────────────────┘
```

### 进程架构

#### Electron 主进程职责
- 创建和管理应用窗口
- 处理系统级事件（菜单、快捷键、托盘）
- 管理应用生命周期
- 处理自动更新
- 启动和管理 Node.js 后端服务
- IPC 消息路由

#### Electron 渲染进程职责
- 渲染 Vue 3 前端界面
- 处理用户交互
- 通过 IPC 与主进程通信
- 通过 HTTP/IPC 与后端服务通信
- 管理前端状态（Pinia）

#### Node.js 后端服务职责
- 管理数据库连接池
- 执行 SQL 查询
- 获取数据库元数据（表、列、索引等）
- JDBC 驱动加载和管理
- 连接配置的加密存储
- 查询历史记录

---

## 核心功能模块

### 1. 连接管理模块

#### 功能特性
- 创建、编辑、删除数据库连接
- 支持连接分组/文件夹
- 连接测试
- 连接配置导入/导出
- 密码加密存储
- SSH 隧道支持
- SSL/TLS 连接支持

#### 数据结构
```typescript
interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | 'sqlite' | 'mariadb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // 加密存储
  jdbcUrl?: string; // 自定义 JDBC URL
  driverPath?: string; // 自定义驱动路径
  properties?: Record<string, string>; // 额外连接属性
  sshTunnel?: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
  };
  ssl?: {
    enabled: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  groupId?: string; // 所属分组
  createdAt: Date;
  updatedAt: Date;
}

interface ConnectionGroup {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
}
```

### 2. SQL 编辑器模块

#### 功能特性
- 语法高亮（多种数据库方言）
- 智能代码补全（表名、列名、关键字）
- SQL 格式化
- 多标签页支持
- 查询历史
- 查询书签/收藏
- 执行计划查看
- 快捷键支持
- 代码片段（Snippets）

#### 技术实现
```typescript
// Monaco Editor 配置
interface EditorConfig {
  language: 'sql' | 'mysql' | 'pgsql' | 'plsql';
  theme: 'vs-dark' | 'vs-light' | 'custom-dark';
  fontSize: number;
  tabSize: number;
  autoComplete: boolean;
  formatOnSave: boolean;
}

interface QueryTab {
  id: string;
  title: string;
  connectionId: string;
  content: string;
  cursorPosition: { line: number; column: number };
  isDirty: boolean;
  results?: QueryResult[];
}
```

### 3. 数据浏览器模块

#### 功能特性
- 树形结构浏览（数据库 → Schema → 表 → 列）
- 表数据查看和编辑
- 数据过滤和排序
- 分页加载
- 数据导出（CSV, JSON, SQL, Excel）
- 数据导入
- 表结构查看
- 索引管理
- 外键关系可视化

#### 数据结构
```typescript
interface DatabaseObject {
  type: 'database' | 'schema' | 'table' | 'view' | 'procedure' | 'function';
  name: string;
  children?: DatabaseObject[];
  metadata?: TableMetadata | ViewMetadata;
}

interface TableMetadata {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  primaryKeys: string[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
  rowCount?: number;
  dataSize?: string;
  createTime?: Date;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  comment?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  autoIncrement: boolean;
}
```

### 4. 查询结果模块

#### 功能特性
- 表格视图（虚拟滚动支持大数据集）
- JSON 视图
- 文本视图
- 结果导出
- 结果过滤
- 列排序
- 列隐藏/显示
- 单元格编辑（可选）
- 执行统计（时间、行数）

### 5. 数据库管理模块

#### 功能特性
- 创建/删除数据库
- 创建/修改/删除表
- 创建/删除索引
- 用户权限管理
- 备份/恢复
- SQL 脚本执行

### 6. 设置与配置模块

#### 功能特性
- 主题切换（亮色/暗色/自定义）
- 语言切换
- 编辑器配置
- 快捷键自定义
- 驱动管理（下载、更新 JDBC 驱动）
- 应用更新检查

---

## 数据库支持

### Phase 1 支持的数据库（首期实现）

| 数据库 | 类型 | 驱动方案 | 默认端口 | 说明 |
|--------|------|----------|----------|------|
| **MySQL** | 关系型 | mysql-connector-java (JDBC) | 3306 | 最常用的关系型数据库 |
| **ClickHouse** | 列式存储 | clickhouse-jdbc | 8123/9000 | 高性能分析型数据库 |
| **MongoDB** | NoSQL 文档 | mongodb-driver-sync | 27017 | 文档型数据库，需特殊处理 |
| **Redis** | NoSQL 键值 | jedis / lettuce | 6379 | 内存数据库，需特殊处理 |

### Phase 2+ 扩展支持

| 数据库 | 类型 | 驱动方案 | 默认端口 |
|--------|------|----------|----------|
| PostgreSQL | 关系型 | postgresql (JDBC) | 5432 |
| SQLite | 关系型 | sqlite-jdbc | - |
| MariaDB | 关系型 | mariadb-java-client | 3306 |
| SQL Server | 关系型 | mssql-jdbc | 1433 |
| Oracle | 关系型 | ojdbc | 1521 |

### 连接模式支持

每种数据库都支持**单机模式**和**集群模式**，连接配置需要区分：

| 数据库 | 单机模式 | 集群模式 |
|--------|---------|----------|
| MySQL | 单节点连接 | 主从复制、MGR、Galera Cluster |
| ClickHouse | 单节点连接 | 分布式集群（多个 shard + replica） |
| MongoDB | 单节点连接 | Replica Set、Sharded Cluster |
| Redis | 单节点连接 | Cluster 模式、Sentinel 哨兵模式 |

### 技术实现方案

#### 1. MySQL（关系型数据库）

**驱动**: `mysql-connector-java`

##### 连接模式

```typescript
interface MySQLConnectionConfig {
  type: 'mysql';
  mode: 'standalone' | 'replication' | 'group-replication' | 'galera';
  
  // 单机模式
  standalone?: {
    host: string;
    port: number;
    database: string;
  };
  
  // 主从复制模式
  replication?: {
    master: { host: string; port: number };
    slaves: { host: string; port: number; readonly?: boolean }[];
    loadBalancing: 'round-robin' | 'random' | 'master-only';
  };
  
  // MGR (MySQL Group Replication)
  groupReplication?: {
    seeds: { host: string; port: number }[];
    mode: 'single-primary' | 'multi-primary';
  };
  
  // Galera Cluster
  galera?: {
    nodes: { host: string; port: number }[];
  };
}
```

##### MySQL 特性功能

**1. 表设计器（Table Designer）**
```typescript
interface TableDesigner {
  // 可视化表设计
  createTable: {
    name: string;
    engine: 'InnoDB' | 'MyISAM' | 'Memory';
    charset: 'utf8mb4' | 'utf8' | 'latin1';
    collation: string;
    comment: string;
    
    columns: {
      name: string;
      type: string; // INT, VARCHAR, TEXT, etc.
      length?: number;
      nullable: boolean;
      default?: string;
      autoIncrement: boolean;
      unsigned: boolean;
      zerofill: boolean;
      comment: string;
    }[];
    
    indexes: {
      name: string;
      type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT' | 'SPATIAL';
      columns: string[];
      method: 'BTREE' | 'HASH';
    }[];
    
    foreignKeys: {
      name: string;
      columns: string[];
      referencedTable: string;
      referencedColumns: string[];
      onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
      onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    }[];
    
    partitioning?: {
      type: 'RANGE' | 'LIST' | 'HASH' | 'KEY';
      expression: string;
      partitions: { name: string; value: string }[];
    };
  };
  
  // ER 图生成
  generateERDiagram: (database: string) => ERDiagram;
  
  // 表结构对比
  compareTableStructure: (table1: string, table2: string) => Diff[];
}
```

**2. 复制监控（Replication Monitoring）**
```typescript
interface ReplicationMonitor {
  // 主从状态
  getReplicationStatus: () => {
    role: 'master' | 'slave';
    
    // 主库信息
    master?: {
      binlogFile: string;
      binlogPosition: number;
      binlogDoDB: string[];
      binlogIgnoreDB: string[];
    };
    
    // 从库信息
    slave?: {
      slaveIORunning: boolean;
      slaveSQLRunning: boolean;
      masterHost: string;
      masterPort: number;
      masterLogFile: string;
      readMasterLogPos: number;
      relayLogFile: string;
      relayLogPos: number;
      secondsBehindMaster: number | null;
      lastError: string;
      lastIOError: string;
      lastSQLError: string;
    };
  };
  
  // 复制延迟监控
  getReplicationLag: () => number; // 秒
  
  // 复制拓扑图
  getReplicationTopology: () => {
    nodes: {
      id: string;
      role: 'master' | 'slave';
      host: string;
      port: number;
      lag?: number;
    }[];
    connections: {
      from: string;
      to: string;
    }[];
  };
}
```

**3. 性能监控**
```typescript
interface MySQLPerformanceMonitor {
  // 慢查询分析
  getSlowQueries: (limit: number) => {
    query: string;
    queryTime: number;
    lockTime: number;
    rowsSent: number;
    rowsExamined: number;
    timestamp: Date;
  }[];
  
  // 连接数监控
  getConnectionStats: () => {
    maxConnections: number;
    currentConnections: number;
    activeConnections: number;
    abortedConnections: number;
    connectionErrors: number;
  };
  
  // InnoDB 状态
  getInnoDBStatus: () => {
    bufferPoolSize: number;
    bufferPoolUsed: number;
    bufferPoolHitRate: number;
    logWrites: number;
    checkpointAge: number;
    transactions: {
      active: number;
      locked: number;
    };
  };
  
  // 表空间使用情况
  getTablespaceUsage: () => {
    database: string;
    table: string;
    dataSize: number;
    indexSize: number;
    totalSize: number;
    rows: number;
  }[];
}
```

**4. MySQL 专属工具**
- 表分区管理
- 存储过程/函数调试器
- 触发器管理
- 事件调度器
- 用户权限管理（可视化）
- 备份/恢复工具（mysqldump）
- Binlog 查看器

#### 2. ClickHouse（列式存储数据库）

**驱动**: `clickhouse-jdbc`

##### 连接模式

```typescript
interface ClickHouseConnectionConfig {
  type: 'clickhouse';
  mode: 'standalone' | 'cluster';
  
  // 单机模式
  standalone?: {
    host: string;
    httpPort: number; // 8123
    nativePort: number; // 9000
    database: string;
  };
  
  // 集群模式
  cluster?: {
    clusterName: string;
    nodes: {
      shard: number;
      replica: number;
      host: string;
      httpPort: number;
      nativePort: number;
    }[];
    // 连接到任意节点即可查询整个集群
    entryPoint: { host: string; port: number };
  };
}
```

##### ClickHouse 特性功能

**1. 集群管理（Cluster Management）**
```typescript
interface ClickHouseClusterManager {
  // 集群信息
  getClusterInfo: () => {
    clusterName: string;
    shards: {
      shardNum: number;
      shardWeight: number;
      replicas: {
        replicaNum: number;
        hostName: string;
        hostAddress: string;
        port: number;
        isLocal: boolean;
      }[];
    }[];
  };
  
  // 分布式表管理
  getDistributedTables: () => {
    name: string;
    cluster: string;
    database: string;
    table: string; // 本地表名
    shardingKey: string;
    engine: string;
  }[];
  
  // Shard 数据分布
  getShardDistribution: (table: string) => {
    shard: number;
    rows: number;
    bytes: number;
    percentage: number;
  }[];
  
  // 副本同步状态
  getReplicationStatus: () => {
    database: string;
    table: string;
    replica: string;
    isLeader: boolean;
    canBecomLeader: boolean;
    isReadonly: boolean;
    absoluteDelay: number;
    queueSize: number;
    insertsInQueue: number;
    mergesInQueue: number;
  }[];
}
```

**2. 物化视图管理**
```typescript
interface MaterializedViewManager {
  // 创建物化视图
  createMaterializedView: {
    name: string;
    targetTable?: string; // 目标表
    engine: 'MergeTree' | 'AggregatingMergeTree' | 'SummingMergeTree';
    populateData: boolean; // 是否填充历史数据
    query: string; // SELECT 查询
  };
  
  // 物化视图刷新状态
  getRefreshStatus: (viewName: string) => {
    lastRefresh: Date;
    rowsProcessed: number;
    status: 'running' | 'completed' | 'failed';
  };
}
```

**3. 查询性能分析**
```typescript
interface ClickHousePerformanceAnalyzer {
  // 查询日志分析
  getQueryLog: (limit: number) => {
    queryId: string;
    query: string;
    user: string;
    queryDuration: number; // 毫秒
    readRows: number;
    readBytes: number;
    writtenRows: number;
    writtenBytes: number;
    memoryUsage: number;
    resultRows: number;
    resultBytes: number;
    exception: string;
  }[];
  
  // 表引擎统计
  getTableEngineStats: (table: string) => {
    engine: string;
    partitions: number;
    parts: number;
    rows: number;
    bytes: number;
    compression: number; // 压缩比
  };
  
  // Merge 操作监控
  getMergeStatus: () => {
    database: string;
    table: string;
    elapsedTime: number;
    progress: number; // 0-100
    numParts: number;
    totalSizeBytes: number;
    bytesReadUncompressed: number;
    rowsRead: number;
  }[];
}
```

**4. 节点负载监控**
```typescript
interface ClickHouseNodeMonitor {
  // 系统指标
  getSystemMetrics: () => {
    node: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: { in: number; out: number };
    queries: {
      running: number;
      queued: number;
    };
  }[];
  
  // 磁盘使用情况
  getDiskUsage: () => {
    disk: string;
    path: string;
    freeSpace: number;
    totalSpace: number;
    keepFreeSpace: number;
  }[];
  
  // 后台任务监控
  getBackgroundTasks: () => {
    type: 'merge' | 'mutation' | 'fetch';
    database: string;
    table: string;
    progress: number;
    numParts: number;
  }[];
}
```

**5. ClickHouse 专属工具**
- 分区管理（Partition Management）
- 数据字典管理（Dictionaries）
- TTL 策略配置
- 数据采样分析
- Kafka/RabbitMQ 集成配置
- 数据压缩算法选择器

#### 3. MongoDB（文档型数据库）

**驱动**: `mongodb-driver-sync`（原生 Java 驱动，非 JDBC）

##### 连接模式

```typescript
interface MongoDBConnectionConfig {
  type: 'mongodb';
  mode: 'standalone' | 'replica-set' | 'sharded-cluster';
  
  // 单机模式
  standalone?: {
    host: string;
    port: number;
    database: string;
    authSource?: string;
  };
  
  // 副本集模式
  replicaSet?: {
    name: string; // 副本集名称
    members: {
      host: string;
      port: number;
      priority?: number;
    }[];
    readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  };
  
  // 分片集群模式
  shardedCluster?: {
    mongosServers: { host: string; port: number }[]; // mongos 路由节点
    readPreference: 'primary' | 'secondary' | 'nearest';
  };
  
  // 连接字符串（支持所有模式）
  connectionString?: string; // mongodb://[user:pass@]host1[:port1][,host2[:port2],...]/database?options
}
```

##### MongoDB 特性功能

**1. 副本集管理（Replica Set Management）**
```typescript
interface MongoDBReplicaSetManager {
  // 副本集状态
  getReplicaSetStatus: () => {
    set: string;
    date: Date;
    myState: number; // 1=PRIMARY, 2=SECONDARY, 7=ARBITER
    members: {
      id: number;
      name: string;
      health: number; // 0=down, 1=up
      state: number;
      stateStr: 'PRIMARY' | 'SECONDARY' | 'ARBITER' | 'RECOVERING' | 'STARTUP';
      uptime: number;
      optime: Date;
      optimeDate: Date;
      lastHeartbeat: Date;
      lastHeartbeatRecv: Date;
      pingMs: number;
      syncSourceHost: string;
      syncSourceId: number;
      configVersion: number;
    }[];
  };
  
  // 副本集配置
  getReplicaSetConfig: () => {
    _id: string;
    version: number;
    members: {
      _id: number;
      host: string;
      priority: number;
      votes: number;
      arbiterOnly: boolean;
      hidden: boolean;
      slaveDelay: number;
    }[];
    settings: {
      heartbeatIntervalMillis: number;
      electionTimeoutMillis: number;
    };
  };
  
  // 复制延迟监控
  getReplicationLag: () => {
    member: string;
    lag: number; // 秒
    oplogWindow: number; // 小时
  }[];
  
  // Oplog 分析
  getOplogStats: () => {
    size: number;
    usedMB: number;
    timeDiff: number; // 秒
    tFirst: Date;
    tLast: Date;
    now: Date;
  };
}
```

**2. 分片集群管理（Sharding Management）**
```typescript
interface MongoDBShardingManager {
  // 分片集群状态
  getShardingStatus: () => {
    shards: {
      _id: string;
      host: string;
      state: number;
      tags: string[];
    }[];
    
    databases: {
      _id: string;
      primary: string; // 主分片
      partitioned: boolean;
    }[];
    
    collections: {
      _id: string; // db.collection
      shardKey: object;
      unique: boolean;
      balancing: boolean;
      chunks: number;
      distribution: {
        shard: string;
        chunks: number;
        docs: number;
        size: number;
      }[];
    }[];
  };
  
  // 分片键分析
  analyzeShardKey: (collection: string, key: object) => {
    cardinality: number;
    frequency: number;
    monotonicity: 'increasing' | 'decreasing' | 'random';
    recommendation: string;
  };
  
  // Chunk 分布
  getChunkDistribution: (collection: string) => {
    shard: string;
    chunks: number;
    jumbo: number; // 超大 chunk 数量
    size: number;
    docs: number;
  }[];
  
  // 均衡器状态
  getBalancerStatus: () => {
    mode: 'full' | 'off';
    inBalancerRound: boolean;
    numBalancerRounds: number;
    ok: number;
  };
}
```

**3. Collection 设计器**
```typescript
interface MongoDBCollectionDesigner {
  // 创建 Collection
  createCollection: {
    name: string;
    capped: boolean;
    size?: number; // capped collection size
    max?: number; // max documents
    
    // Schema 验证
    validator?: {
      $jsonSchema: {
        bsonType: 'object';
        required: string[];
        properties: {
          [field: string]: {
            bsonType: string;
            description?: string;
            minimum?: number;
            maximum?: number;
            pattern?: string;
            enum?: any[];
          };
        };
      };
    };
    validationLevel: 'off' | 'strict' | 'moderate';
    validationAction: 'error' | 'warn';
    
    // 时间序列集合
    timeseries?: {
      timeField: string;
      metaField?: string;
      granularity: 'seconds' | 'minutes' | 'hours';
    };
  };
  
  // 索引设计
  designIndex: {
    keys: { [field: string]: 1 | -1 | 'text' | '2dsphere' };
    options: {
      unique?: boolean;
      sparse?: boolean;
      expireAfterSeconds?: number; // TTL
      partialFilterExpression?: object;
      collation?: object;
    };
  };
}
```

**4. Aggregation Pipeline 可视化**
```typescript
interface AggregationPipelineBuilder {
  // 可视化构建 Pipeline
  stages: [
    { $match: object },
    { $group: object },
    { $sort: object },
    { $project: object },
    { $limit: number },
    { $lookup: object }, // JOIN
    { $unwind: object },
    { $facet: object }
  ];
  
  // 每个阶段的预览
  previewStage: (stageIndex: number) => Document[];
  
  // 性能分析
  explainPipeline: () => {
    stages: {
      stage: string;
      nReturned: number;
      executionTimeMillis: number;
      indexesUsed: string[];
    }[];
  };
}
```

**5. 性能监控**
```typescript
interface MongoDBPerformanceMonitor {
  // 慢查询分析
  getSlowQueries: () => {
    op: string;
    ns: string;
    query: object;
    millis: number;
    planSummary: string;
    numYields: number;
    locks: object;
    timestamp: Date;
  }[];
  
  // 数据库统计
  getDBStats: () => {
    db: string;
    collections: number;
    views: number;
    objects: number;
    avgObjSize: number;
    dataSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  };
  
  // Collection 统计
  getCollectionStats: (collection: string) => {
    ns: string;
    size: number;
    count: number;
    avgObjSize: number;
    storageSize: number;
    nindexes: number;
    totalIndexSize: number;
    indexSizes: { [indexName: string]: number };
  };
  
  // 连接池监控
  getConnectionPoolStats: () => {
    totalCreated: number;
    totalInUse: number;
    totalAvailable: number;
    totalRefreshing: number;
  };
}
```

**6. MongoDB 专属工具**
- Schema 分析器（分析 Collection 结构）
- 数据导入/导出（mongoimport/mongoexport）
- 备份/恢复（mongodump/mongorestore）
- Change Streams 监控
- GridFS 文件管理
- 地理空间查询构建器

#### 4. Redis（键值存储数据库）

**驱动**: `jedis` 或 `lettuce`（原生 Java 客户端，非 JDBC）

##### 连接模式

```typescript
interface RedisConnectionConfig {
  type: 'redis';
  mode: 'standalone' | 'sentinel' | 'cluster';
  
  // 单机模式
  standalone?: {
    host: string;
    port: number;
    password?: string;
    database: number; // 0-15
    ssl?: boolean;
  };
  
  // 哨兵模式（高可用）
  sentinel?: {
    masterName: string;
    sentinels: { host: string; port: number }[];
    password?: string;
    database: number;
    sentinelPassword?: string;
  };
  
  // 集群模式
  cluster?: {
    nodes: { host: string; port: number }[];
    password?: string;
    maxRedirects: number;
    readFrom: 'master' | 'slave' | 'any';
  };
}
```

##### Redis 特性功能

**1. 集群管理（Cluster Management）**
```typescript
interface RedisClusterManager {
  // 集群节点信息
  getClusterNodes: () => {
    nodeId: string;
    ip: string;
    port: number;
    flags: string[]; // master, slave, myself, fail, etc.
    master?: string; // master node id (if slave)
    pingSent: number;
    pingRecv: number;
    configEpoch: number;
    linkState: 'connected' | 'disconnected';
    slots: number[]; // slot ranges
  }[];
  
  // Slot 分布
  getSlotDistribution: () => {
    node: string;
    slots: number[];
    slotCount: number;
    keys: number;
    memoryUsed: number;
  }[];
  
  // 集群状态
  getClusterInfo: () => {
    state: 'ok' | 'fail';
    slotsAssigned: number;
    slotsOk: number;
    slotsFail: number;
    knownNodes: number;
    size: number;
    currentEpoch: number;
  };
  
  // 重新分片
  reshardSlots: (sourceNode: string, targetNode: string, slots: number[]) => void;
}
```

**2. 哨兵监控（Sentinel Monitoring）**
```typescript
interface RedisSentinelMonitor {
  // 哨兵状态
  getSentinelStatus: () => {
    sentinels: {
      name: string;
      ip: string;
      port: number;
      runId: string;
      flags: string;
      pendingCommands: number;
      lastOkPingReply: number;
      lastPingReply: number;
    }[];
  };
  
  // Master 信息
  getMasterInfo: (masterName: string) => {
    name: string;
    ip: string;
    port: number;
    runId: string;
    flags: string;
    numSlaves: number;
    numOtherSentinels: number;
    quorum: number;
    failoverTimeout: number;
    parallelSyncs: number;
  };
  
  // Failover 历史
  getFailoverHistory: () => {
    timestamp: Date;
    masterName: string;
    oldMaster: string;
    newMaster: string;
    reason: string;
  }[];
}
```

**3. 数据类型可视化**
```typescript
interface RedisDataTypeVisualizer {
  // String 类型
  viewString: (key: string) => {
    value: string;
    encoding: 'raw' | 'int' | 'embstr';
    size: number;
    ttl: number;
  };
  
  // Hash 类型（表格展示）
  viewHash: (key: string) => {
    fields: {
      field: string;
      value: string;
      size: number;
    }[];
    totalFields: number;
    encoding: 'ziplist' | 'hashtable';
  };
  
  // List 类型（列表展示）
  viewList: (key: string, start: number, end: number) => {
    values: string[];
    totalLength: number;
    encoding: 'ziplist' | 'linkedlist' | 'quicklist';
  };
  
  // Set 类型
  viewSet: (key: string) => {
    members: string[];
    cardinality: number;
    encoding: 'intset' | 'hashtable';
  };
  
  // Sorted Set 类型（带分数）
  viewZSet: (key: string, start: number, end: number) => {
    members: {
      value: string;
      score: number;
    }[];
    totalMembers: number;
    encoding: 'ziplist' | 'skiplist';
  };
  
  // Stream 类型
  viewStream: (key: string) => {
    entries: {
      id: string;
      fields: { [key: string]: string };
    }[];
    length: number;
    groups: {
      name: string;
      consumers: number;
      pending: number;
    }[];
  };
}
```

**4. 节点性能监控**
```typescript
interface RedisNodeMonitor {
  // 实时监控
  getNodeStats: () => {
    node: string;
    role: 'master' | 'slave';
    
    // 内存
    memory: {
      used: number;
      peak: number;
      rss: number;
      fragmentation: number;
      evictedKeys: number;
    };
    
    // CPU
    cpu: {
      usedCpuSys: number;
      usedCpuUser: number;
      usedCpuSysChildren: number;
      usedCpuUserChildren: number;
    };
    
    // 网络
    network: {
      totalConnectionsReceived: number;
      totalCommandsProcessed: number;
      instantaneousOpsPerSec: number;
      totalNetInputBytes: number;
      totalNetOutputBytes: number;
      instantaneousInputKbps: number;
      instantaneousOutputKbps: number;
    };
    
    // 持久化
    persistence: {
      rdbLastSaveTime: Date;
      rdbChangesSinceLastSave: number;
      aofEnabled: boolean;
      aofCurrentSize: number;
      aofBaseSize: number;
    };
    
    // 复制
    replication: {
      role: 'master' | 'slave';
      connectedSlaves: number;
      masterHost?: string;
      masterPort?: number;
      masterLinkStatus?: 'up' | 'down';
      masterLastIoSecondsAgo?: number;
      masterSyncInProgress?: boolean;
    };
  }[];
  
  // 慢日志
  getSlowLog: (count: number) => {
    id: number;
    timestamp: Date;
    duration: number; // 微秒
    command: string[];
    clientAddr: string;
    clientName: string;
  }[];
  
  // 命令统计
  getCommandStats: () => {
    command: string;
    calls: number;
    usec: number;
    usecPerCall: number;
  }[];
  
  // 客户端连接
  getClientList: () => {
    id: number;
    addr: string;
    name: string;
    age: number;
    idle: number;
    flags: string;
    db: number;
    sub: number;
    psub: number;
    multi: number;
    qbuf: number;
    cmd: string;
  }[];
}
```

**5. Key 分析器**
```typescript
interface RedisKeyAnalyzer {
  // 大 Key 分析
  findBigKeys: (pattern: string) => {
    key: string;
    type: string;
    size: number;
    length?: number; // for list/set/zset/hash
    encoding: string;
  }[];
  
  // Key 分布统计
  analyzeKeyDistribution: (pattern: string) => {
    type: string;
    count: number;
    avgSize: number;
    totalSize: number;
    percentage: number;
  }[];
  
  // TTL 分析
  analyzeTTL: (pattern: string) => {
    range: string; // '0-1h', '1h-1d', '1d-7d', '7d+', 'no-expire'
    count: number;
    percentage: number;
  }[];
  
  // 内存占用分析
  analyzeMemoryUsage: (key: string) => {
    key: string;
    memoryUsage: number;
    serializedLength: number;
    encoding: string;
    refcount: number;
    lru: number;
    lruSecondsIdle: number;
  };
}
```

**6. Redis 专属工具**
- Pub/Sub 监控器
- Lua 脚本编辑器和调试器
- Pipeline 批量操作工具
- 数据迁移工具（MIGRATE 命令）
- RDB/AOF 文件分析器
- 内存碎片整理
- Key 过期策略配置

### 架构调整说明

由于 MongoDB 和 Redis **不支持 JDBC**，需要调整后端架构：

```typescript
// 统一的数据库连接接口
interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  executeQuery(query: string): Promise<QueryResult>;
  getMetadata(): Promise<DatabaseMetadata>;
  testConnection(): Promise<boolean>;
}

// 不同数据库的适配器实现
class MySQLAdapter implements DatabaseAdapter {
  // 使用 JDBC
}

class ClickHouseAdapter implements DatabaseAdapter {
  // 使用 JDBC
}

class MongoDBAdapter implements DatabaseAdapter {
  // 使用 MongoDB 原生驱动
  // query 参数接收 JSON 格式的 MongoDB 查询
}

class RedisAdapter implements DatabaseAdapter {
  // 使用 Jedis/Lettuce
  // query 参数接收 Redis 命令
}
```

### UI 适配方案

#### SQL 编辑器（MySQL, ClickHouse）
- 标准 SQL 语法高亮
- SQL 关键字补全
- 表名、列名补全

#### MongoDB 查询编辑器
```javascript
// 支持 MongoDB 查询语法
db.users.find({ age: { $gt: 18 } })

// 支持 Aggregation Pipeline
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }
])
```

#### Redis 命令编辑器
```bash
# 支持 Redis 命令
GET user:1001
HGETALL user:1001:profile
LRANGE recent:orders 0 10
ZRANGE leaderboard 0 10 WITHSCORES
```

### 驱动管理策略
1. **内置驱动**（Phase 1）：
   - `mysql-connector-java-8.0.33.jar`
   - `clickhouse-jdbc-0.4.6.jar`
   - `mongodb-driver-sync-4.11.0.jar`
   - `jedis-5.0.0.jar`

2. **驱动加载**：
   - 关系型数据库：通过 node-java 加载 JDBC 驱动
   - MongoDB/Redis：通过原生 Java 客户端库

3. **驱动更新**：
   - 支持用户自定义驱动路径
   - 提供驱动下载和更新功能
   - 驱动版本管理

---

## UI/UX 设计

### 设计原则
- **现代化**: 使用流行的设计语言（类似 VS Code、Notion）
- **简洁**: 减少视觉噪音，突出核心功能
- **高效**: 快捷键优先，减少鼠标操作
- **响应式**: 支持不同窗口大小
- **可定制**: 主题、布局可自定义

### 布局设计

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] UniDb    [File] [Edit] [View] [Tools]    [⚙️] [👤]  │ 顶部菜单栏
├────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│ │ 连接     │ │ 查询     │ │ 浏览     │  ...               │ 工具栏
│ └──────────┘ └──────────┘ └──────────┘                    │
├──────────┬─────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────┐   │
│  连接列表 │  │  Tab: query.sql  [x]  Tab2  [x]         │   │
│          │  ├─────────────────────────────────────────┤   │
│  📁 生产  │  │                                         │   │
│   └ 🗄️ DB1│  │   SELECT * FROM users                   │   │
│   └ 🗄️ DB2│  │   WHERE id = 1;                         │   │ 主工作区
│          │  │                                         │   │
│  📁 开发  │  │   ▶️ 执行  💾 保存  📋 格式化            │   │
│   └ 🗄️ DB3│  │                                         │   │
│          │  ├─────────────────────────────────────────┤   │
│  [+ 新建] │  │  结果  消息  执行计划                    │   │
│          │  │  ┌───┬────────┬─────────┬──────────┐   │   │
│          │  │  │id │ name   │ email   │ created  │   │   │
│          │  │  ├───┼────────┼─────────┼──────────┤   │   │
│          │  │  │ 1 │ Alice  │ a@e.com │ 2024-01  │   │   │
│          │  │  └───┴────────┴─────────┴──────────┘   │   │
│          │  └─────────────────────────────────────────┘   │
├──────────┴─────────────────────────────────────────────────┤
│  就绪 | 已连接: MySQL 8.0 | 行数: 1 | 执行时间: 0.05s      │ 状态栏
└────────────────────────────────────────────────────────────┘
```

### 配色方案

#### 暗色主题（默认）
- 背景: `#1e1e1e` (主背景), `#252526` (侧边栏)
- 前景: `#cccccc` (主文本), `#ffffff` (高亮文本)
- 强调色: `#007acc` (主色), `#0e639c` (悬停)
- 成功: `#4ec9b0`
- 警告: `#dcdcaa`
- 错误: `#f48771`

#### 亮色主题
- 背景: `#ffffff` (主背景), `#f3f3f3` (侧边栏)
- 前景: `#333333` (主文本), `#000000` (高亮文本)
- 强调色: `#0078d4` (主色), `#106ebe` (悬停)

### 组件设计

#### 推荐 UI 库
**Naive UI** (推荐)
- 优点: TypeScript 原生支持，组件丰富，性能好，文档完善
- 主题: 内置暗色主题，符合现代设计
- 适合桌面应用

**备选: Element Plus**
- 优点: 生态成熟，组件全面
- 缺点: 需要额外配置暗色主题

#### 关键组件
- **Split Pane**: 可调整大小的分割面板
- **Virtual Scroll**: 大数据集虚拟滚动
- **Context Menu**: 右键菜单
- **Tree**: 数据库对象树
- **Table**: 查询结果表格
- **Modal**: 对话框
- **Notification**: 通知提示

---

## 国际化方案

### 技术实现
使用 **Vue I18n** 实现多语言支持

### 语言文件结构
```
src/
  locales/
    zh-CN/
      common.json
      connection.json
      editor.json
      database.json
    en-US/
      common.json
      connection.json
      editor.json
      database.json
    index.ts
```

### 示例配置
```typescript
// locales/zh-CN/common.json
{
  "app": {
    "name": "UniDb",
    "title": "数据库管理工具"
  },
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "execute": "执行"
  }
}

// locales/en-US/common.json
{
  "app": {
    "name": "UniDb",
    "title": "Database Management Tool"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "execute": "Execute"
  }
}
```

### 语言切换
- 默认语言: 根据系统语言自动检测
- 用户可在设置中手动切换
- 语言配置持久化存储

---

## 本地数据存储方案

### 设计原则
- ✅ **完全本地化**: 所有数据存储在用户本地，无需登录
- ✅ **隐私保护**: 敏感数据加密存储
- ✅ **易于备份**: 支持导出/导入配置和 SQL 脚本
- ✅ **跨设备迁移**: 用户可手动复制数据目录到其他设备
- ✅ **版本控制友好**: SQL 脚本以文件形式存储，可使用 Git 管理

### 存储架构

采用 **SQLite + 文件系统** 混合存储方案：

| 数据类型 | 存储方式 | 原因 |
|---------|---------|------|
| 连接配置 | SQLite | 结构化数据，便于查询和管理 |
| 应用设置 | SQLite | 键值对存储，快速读写 |
| 查询历史 | SQLite | 需要按时间、连接等条件查询 |
| 操作日志 | SQLite | 结构化记录，支持审计和回溯 |
| SQL 脚本文件 | 文件系统 | 支持版本控制、外部编辑器打开 |
| 查询书签 | SQLite + 文件系统 | 元数据存 SQLite，内容存文件 |
| JDBC 驱动 | 文件系统 | JAR 文件 |
| 导出数据 | 文件系统 | CSV、JSON、Excel 等 |

### 本地存储目录结构

```
用户数据目录/
├── unidb.db                    # 主数据库（SQLite）
├── scripts/                    # SQL 脚本文件
│   ├── my-project/            # 按项目组织
│   │   ├── init.sql
│   │   ├── migration-001.sql
│   │   └── queries.sql
│   ├── temp/                  # 临时脚本
│   │   └── untitled-1.sql
│   └── bookmarks/             # 书签脚本
│       ├── user-queries.sql
│       └── reports.sql
├── exports/                    # 导出数据
│   ├── 2024-03-31/
│   │   ├── users.csv
│   │   └── orders.json
├── drivers/                    # JDBC 驱动
│   ├── mysql/
│   │   └── mysql-connector-java-8.0.33.jar
│   ├── postgresql/
│   │   └── postgresql-42.6.0.jar
│   └── sqlite/
│       └── sqlite-jdbc-3.43.0.0.jar
├── logs/                       # 应用日志
│   ├── app-2024-03-31.log
│   └── error.log
├── backups/                    # 自动备份
│   ├── unidb-2024-03-31.db.bak
│   └── connections-export.json
└── temp/                       # 临时文件
    └── query-results-cache/
```

**不同操作系统的默认路径**:
- **Windows**: `C:\Users\<用户名>\AppData\Roaming\UniDb`
- **macOS**: `~/Library/Application Support/UniDb`
- **Linux**: `~/.config/UniDb`

### SQLite 数据库表设计

#### 1. 连接配置表
```sql
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- mysql, postgresql, oracle, sqlserver, sqlite, mariadb
  host TEXT,
  port INTEGER,
  database TEXT,
  username TEXT,
  password TEXT, -- AES-256 加密存储
  jdbc_url TEXT, -- 自定义 JDBC URL
  driver_path TEXT, -- 自定义驱动路径
  properties TEXT, -- JSON 格式的额外连接属性
  group_id TEXT,
  color TEXT, -- 连接标识颜色
  
  -- SSH 隧道配置
  ssh_enabled BOOLEAN DEFAULT 0,
  ssh_host TEXT,
  ssh_port INTEGER,
  ssh_username TEXT,
  ssh_password TEXT, -- 加密存储
  ssh_private_key_path TEXT,
  
  -- SSL 配置
  ssl_enabled BOOLEAN DEFAULT 0,
  ssl_ca_path TEXT,
  ssl_cert_path TEXT,
  ssl_key_path TEXT,
  
  -- 元数据
  is_active BOOLEAN DEFAULT 1,
  last_connected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (group_id) REFERENCES connection_groups(id) ON DELETE SET NULL
);

CREATE INDEX idx_connections_group ON connections(group_id);
CREATE INDEX idx_connections_type ON connections(type);
```

#### 2. 连接分组表
```sql
CREATE TABLE connection_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES connection_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_groups_parent ON connection_groups(parent_id);
```

#### 3. 查询历史表
```sql
CREATE TABLE query_history (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL,
  query TEXT NOT NULL,
  
  -- 执行信息
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms REAL, -- 执行时间（毫秒）
  row_count INTEGER,
  affected_rows INTEGER,
  success BOOLEAN,
  error_message TEXT,
  
  -- 上下文信息
  database_name TEXT, -- 执行时所在的数据库
  script_file_path TEXT, -- 如果来自脚本文件
  
  FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE
);

CREATE INDEX idx_history_connection ON query_history(connection_id);
CREATE INDEX idx_history_executed_at ON query_history(executed_at DESC);
CREATE INDEX idx_history_success ON query_history(success);

-- 自动清理策略：保留最近 10000 条记录
CREATE TRIGGER cleanup_old_history 
AFTER INSERT ON query_history
BEGIN
  DELETE FROM query_history 
  WHERE id IN (
    SELECT id FROM query_history 
    ORDER BY executed_at DESC 
    LIMIT -1 OFFSET 10000
  );
END;
```

#### 4. 操作日志表（审计用）
```sql
CREATE TABLE operation_logs (
  id TEXT PRIMARY KEY,
  connection_id TEXT,
  operation_type TEXT NOT NULL, -- CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE
  object_type TEXT, -- TABLE, VIEW, INDEX, PROCEDURE, FUNCTION
  object_name TEXT,
  sql_statement TEXT,
  
  -- 执行信息
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN,
  error_message TEXT,
  
  -- 影响范围
  affected_rows INTEGER,
  
  FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_logs_connection ON operation_logs(connection_id);
CREATE INDEX idx_logs_executed_at ON operation_logs(executed_at DESC);
CREATE INDEX idx_logs_operation_type ON operation_logs(operation_type);
```

#### 5. SQL 脚本元数据表
```sql
CREATE TABLE sql_scripts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE, -- 相对于 scripts/ 目录的路径
  
  -- 分类
  category TEXT, -- project, temp, bookmark
  project_name TEXT, -- 所属项目
  tags TEXT, -- JSON 数组: ["migration", "report"]
  
  -- 关联
  connection_id TEXT, -- 关联的默认连接
  
  -- 元数据
  description TEXT,
  file_size INTEGER, -- 字节
  line_count INTEGER,
  
  -- 时间戳
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_executed_at DATETIME,
  
  FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_scripts_category ON sql_scripts(category);
CREATE INDEX idx_scripts_project ON sql_scripts(project_name);
CREATE INDEX idx_scripts_connection ON sql_scripts(connection_id);
```

#### 6. 查询书签表
```sql
CREATE TABLE query_bookmarks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- 查询内容（两种方式二选一）
  query_text TEXT, -- 直接存储 SQL
  script_file_id TEXT, -- 或引用脚本文件
  
  -- 分类
  folder TEXT, -- 文件夹路径，如 "Reports/Monthly"
  tags TEXT, -- JSON 数组
  
  -- 关联
  connection_id TEXT, -- 建议使用的连接
  
  -- 快捷键
  shortcut_key TEXT, -- 如 "Ctrl+Shift+1"
  
  -- 元数据
  use_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL,
  FOREIGN KEY (script_file_id) REFERENCES sql_scripts(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_folder ON query_bookmarks(folder);
CREATE INDEX idx_bookmarks_connection ON query_bookmarks(connection_id);
```

#### 7. 应用设置表
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  value_type TEXT DEFAULT 'string', -- string, number, boolean, json
  category TEXT, -- editor, ui, database, security
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 预设默认配置
INSERT INTO settings (key, value, value_type, category) VALUES
  ('app.language', 'zh-CN', 'string', 'ui'),
  ('app.theme', 'dark', 'string', 'ui'),
  ('editor.fontSize', '14', 'number', 'editor'),
  ('editor.tabSize', '2', 'number', 'editor'),
  ('editor.autoSave', 'true', 'boolean', 'editor'),
  ('query.maxRows', '1000', 'number', 'database'),
  ('query.timeout', '30', 'number', 'database'),
  ('history.maxRecords', '10000', 'number', 'database'),
  ('security.encryptPasswords', 'true', 'boolean', 'security');
```

#### 8. 最近打开的脚本表
```sql
CREATE TABLE recent_scripts (
  id TEXT PRIMARY KEY,
  script_file_id TEXT NOT NULL,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cursor_position TEXT, -- JSON: {"line": 10, "column": 5}
  scroll_position INTEGER,
  
  FOREIGN KEY (script_file_id) REFERENCES sql_scripts(id) ON DELETE CASCADE
);

CREATE INDEX idx_recent_scripts_opened_at ON recent_scripts(opened_at DESC);

-- 只保留最近 20 个
CREATE TRIGGER cleanup_recent_scripts 
AFTER INSERT ON recent_scripts
BEGIN
  DELETE FROM recent_scripts 
  WHERE id IN (
    SELECT id FROM recent_scripts 
    ORDER BY opened_at DESC 
    LIMIT -1 OFFSET 20
  );
END;
```

### SQL 脚本文件管理

#### 文件组织策略

**方案一：项目化管理（推荐）**
```
scripts/
├── projects/
│   ├── ecommerce/              # 电商项目
│   │   ├── schema/
│   │   │   ├── 001-init.sql
│   │   │   └── 002-add-orders.sql
│   │   ├── queries/
│   │   │   ├── daily-report.sql
│   │   │   └── user-stats.sql
│   │   └── migrations/
│   │       └── 2024-03-31-add-index.sql
│   └── analytics/              # 分析项目
│       └── queries/
├── bookmarks/                  # 收藏的查询
│   ├── common-queries.sql
│   └── performance-checks.sql
└── temp/                       # 临时文件
    ├── untitled-1.sql
    └── scratch.sql
```

**方案二：按连接管理**
```
scripts/
├── mysql-prod/
│   ├── backup-2024-03-31.sql
│   └── queries.sql
├── postgres-dev/
│   └── test-queries.sql
└── temp/
```

#### 脚本文件元数据

在每个 SQL 文件头部添加元数据注释：

```sql
-- UniDb Script Metadata
-- @name: Daily Sales Report
-- @description: Generate daily sales summary
-- @connection: mysql-prod
-- @tags: report, sales, daily
-- @created: 2024-03-31
-- @author: User
-- @version: 1.0

SELECT 
  DATE(order_date) as date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_sales
FROM orders
WHERE order_date >= CURDATE() - INTERVAL 1 DAY
GROUP BY DATE(order_date);
```

#### 文件操作 API

```typescript
interface ScriptFileManager {
  // 创建脚本
  createScript(name: string, category: string, content?: string): Promise<ScriptFile>;
  
  // 保存脚本
  saveScript(id: string, content: string): Promise<void>;
  
  // 读取脚本
  readScript(id: string): Promise<string>;
  
  // 删除脚本
  deleteScript(id: string): Promise<void>;
  
  // 重命名脚本
  renameScript(id: string, newName: string): Promise<void>;
  
  // 移动脚本到其他项目/文件夹
  moveScript(id: string, targetPath: string): Promise<void>;
  
  // 导出脚本
  exportScript(id: string, targetPath: string): Promise<void>;
  
  // 导入脚本
  importScript(sourcePath: string, category: string): Promise<ScriptFile>;
  
  // 搜索脚本（全文搜索）
  searchScripts(keyword: string): Promise<ScriptFile[]>;
  
  // 获取最近打开的脚本
  getRecentScripts(limit: number): Promise<ScriptFile[]>;
}
```

### 数据备份与恢复

#### 自动备份策略

```typescript
interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  maxBackups: number; // 保留最近 N 个备份
  includeScripts: boolean; // 是否包含 SQL 脚本
  includeHistory: boolean; // 是否包含查询历史
}

// 备份内容
interface BackupData {
  version: string; // 应用版本
  timestamp: Date;
  database: Buffer; // unidb.db 的副本
  scripts?: { // 可选：脚本文件
    path: string;
    content: string;
  }[];
  metadata: {
    connectionCount: number;
    scriptCount: number;
    historyCount: number;
  };
}
```

#### 导出/导入功能

**导出连接配置**（不含密码）
```json
{
  "version": "1.0",
  "exportedAt": "2024-03-31T12:00:00Z",
  "connections": [
    {
      "name": "Production MySQL",
      "type": "mysql",
      "host": "db.example.com",
      "port": 3306,
      "database": "myapp",
      "username": "admin",
      "group": "Production"
    }
  ],
  "groups": [
    {
      "name": "Production",
      "color": "#ff0000"
    }
  ]
}
```

**导出查询书签**
```json
{
  "version": "1.0",
  "bookmarks": [
    {
      "name": "Active Users",
      "query": "SELECT * FROM users WHERE status = 'active'",
      "tags": ["user", "report"],
      "connection": "Production MySQL"
    }
  ]
}
```

### 数据迁移与同步

虽然不支持云同步，但支持手动迁移：

#### 迁移到新设备

**方法一：完整迁移**
1. 复制整个数据目录到新设备
2. 保持相同的目录结构
3. 首次启动时自动检测并加载

**方法二：选择性迁移**
1. 导出连接配置（JSON）
2. 导出查询书签（JSON）
3. 复制需要的 SQL 脚本文件
4. 在新设备上导入

#### 团队共享（可选）

用户可以将 `scripts/` 目录放入 Git 仓库：

```bash
# 初始化 Git
cd ~/Library/Application\ Support/UniDb/scripts
git init
git add .
git commit -m "Initial SQL scripts"

# 推送到团队仓库
git remote add origin https://github.com/team/sql-scripts.git
git push -u origin main
```

### 性能优化

#### SQLite 优化配置

```sql
-- 启用 WAL 模式（提高并发性能）
PRAGMA journal_mode = WAL;

-- 设置缓存大小（10MB）
PRAGMA cache_size = -10000;

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 同步模式（平衡性能和安全性）
PRAGMA synchronous = NORMAL;

-- 自动清理
PRAGMA auto_vacuum = INCREMENTAL;
```

#### 查询历史清理策略

```typescript
interface HistoryCleanupPolicy {
  maxRecords: number; // 最大记录数（默认 10000）
  maxAge: number; // 最大保留天数（默认 90 天）
  autoCleanup: boolean; // 自动清理
  cleanupInterval: 'daily' | 'weekly'; // 清理频率
}

// 清理逻辑
async function cleanupHistory(policy: HistoryCleanupPolicy) {
  // 按数量清理
  await db.run(`
    DELETE FROM query_history 
    WHERE id IN (
      SELECT id FROM query_history 
      ORDER BY executed_at DESC 
      LIMIT -1 OFFSET ?
    )
  `, [policy.maxRecords]);
  
  // 按时间清理
  await db.run(`
    DELETE FROM query_history 
    WHERE executed_at < datetime('now', '-' || ? || ' days')
  `, [policy.maxAge]);
}
```

### 数据安全

#### 密码加密

```typescript
import crypto from 'crypto';
import { safeStorage } from 'electron';

class PasswordManager {
  // 使用 Electron 的 safeStorage（系统级加密）
  encryptPassword(password: string): string {
    if (safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(password);
      return buffer.toString('base64');
    }
    // 降级方案：AES-256
    return this.aesEncrypt(password);
  }
  
  decryptPassword(encrypted: string): string {
    if (safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(encrypted, 'base64');
      return safeStorage.decryptString(buffer);
    }
    return this.aesDecrypt(encrypted);
  }
  
  private aesEncrypt(text: string): string {
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }
  
  private getEncryptionKey(): Buffer {
    // 从系统获取或生成机器唯一密钥
    // 存储在系统 Keychain/Credential Manager
    return crypto.scryptSync('unidb-secret', 'salt', 32);
  }
}
```

#### 数据库文件加密（可选）

使用 SQLCipher 对整个数据库文件加密：

```typescript
import SQLite from 'better-sqlite3';

const db = new SQLite('unidb.db');

// 设置加密密钥
db.pragma('key = "user-master-password"');

// 或使用自动生成的密钥
const machineKey = getMachineUniqueKey();
db.pragma(`key = "${machineKey}"`);
```

---

## 安全性设计

### 密码加密
- 使用 **AES-256** 加密存储数据库密码
- 密钥存储在系统 Keychain（macOS）或 Credential Manager（Windows）
- 支持主密码保护

### 连接安全
- 支持 SSL/TLS 加密连接
- SSH 隧道支持
- 证书验证

### 权限控制
- 只读模式（防止误操作）
- 危险操作二次确认（DROP, TRUNCATE 等）

---

## 性能优化

### 前端优化
- 虚拟滚动（大数据集）
- 懒加载（数据库对象树）
- 防抖和节流（搜索、自动补全）
- Web Worker（数据处理）
- 组件懒加载

### 后端优化
- 连接池管理
- 查询结果流式传输
- 查询超时控制
- 缓存元数据（表结构等）
- 分页查询

### 打包优化
- Tree Shaking
- 代码分割
- 资源压缩
- ASAR 打包

---

## 开发计划

### Phase 1: MVP (6-8 周)
- [x] 项目初始化和架构搭建
- [ ] 基础 UI 框架（布局、主题、Naive UI）
- [ ] 数据库适配器架构（支持 JDBC 和原生驱动）
- [ ] 连接管理（MySQL, ClickHouse, MongoDB, Redis）
  - [ ] MySQL 连接配置和测试
  - [ ] ClickHouse 连接配置和测试
  - [ ] MongoDB 连接配置和测试
  - [ ] Redis 连接配置和测试
- [ ] 多类型编辑器
  - [ ] SQL 编辑器（MySQL, ClickHouse）
  - [ ] MongoDB 查询编辑器（JSON 语法）
  - [ ] Redis 命令编辑器
- [ ] 查询执行和结果显示
  - [ ] SQL 查询结果（表格视图）
  - [ ] MongoDB 查询结果（JSON 视图）
  - [ ] Redis 命令结果（按类型展示）
- [ ] 数据库对象浏览
  - [ ] MySQL: 数据库 → 表 → 列
  - [ ] ClickHouse: 数据库 → 表 → 列
  - [ ] MongoDB: 数据库 → Collection → Document
  - [ ] Redis: 数据库(0-15) → Keys（按模式）
- [ ] 国际化支持（中文、英文）
- [ ] 本地数据存储（SQLite + 文件系统）
- [ ] Electron 打包（Windows, macOS）

### Phase 2: 功能增强 (4-6 周)
- [ ] Phase 1 数据库功能完善
  - [ ] MySQL: 存储过程、触发器、视图管理
  - [ ] ClickHouse: 物化视图、分布式表
  - [ ] MongoDB: Aggregation Pipeline 可视化
  - [ ] Redis: 数据类型可视化（Hash/List/Set/ZSet）
- [ ] 代码补全和语法检查
  - [ ] SQL 智能补全
  - [ ] MongoDB 查询补全
  - [ ] Redis 命令补全
- [ ] 查询历史和书签
- [ ] 数据编辑功能
  - [ ] MySQL/ClickHouse: 表格编辑
  - [ ] MongoDB: Document 编辑
  - [ ] Redis: Key-Value 编辑
- [ ] 数据导出
  - [ ] SQL 结果导出（CSV, JSON, Excel）
  - [ ] MongoDB 导出（JSON, BSON）
  - [ ] Redis 导出（RDB, JSON）
- [ ] 表结构管理（MySQL, ClickHouse）
- [ ] SSH 隧道支持
- [ ] 设置面板完善

### Phase 3: 高级功能 (4-6 周)
- [ ] 更多数据库支持（PostgreSQL, SQLite, MariaDB）
- [ ] 执行计划可视化（MySQL, ClickHouse）
- [ ] 数据导入功能
  - [ ] SQL 数据导入（CSV, Excel）
  - [ ] MongoDB 数据导入（JSON, CSV）
  - [ ] Redis 批量导入
- [ ] 存储过程和函数管理（MySQL）
- [ ] ER 图生成（MySQL）
- [ ] 数据库比较和同步（MySQL）
- [ ] 备份和恢复
  - [ ] MySQL: mysqldump
  - [ ] MongoDB: mongodump
  - [ ] Redis: RDB/AOF
- [ ] 插件系统
- [ ] 自动更新

### Phase 4: 优化和发布 (2-4 周)
- [ ] 性能优化
- [ ] Bug 修复
- [ ] 文档编写
- [ ] 测试（单元测试、E2E 测试）
- [ ] 发布准备

---

## 项目结构

```
unidb/
├── electron/                 # Electron 主进程
│   ├── main.ts              # 主进程入口
│   ├── preload.ts           # 预加载脚本
│   ├── ipc/                 # IPC 处理
│   └── menu.ts              # 菜单配置
├── server/                   # Node.js 后端服务
│   ├── index.ts             # 服务入口
│   ├── routes/              # API 路由
│   ├── services/            # 业务逻辑
│   │   ├── connection.ts    # 连接管理
│   │   ├── query.ts         # 查询执行
│   │   └── metadata.ts      # 元数据获取
│   ├── jdbc/                # JDBC 桥接
│   └── utils/               # 工具函数
├── src/                      # Vue 前端应用
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件
│   ├── views/               # 页面组件
│   │   ├── Home.vue
│   │   ├── Editor.vue
│   │   └── Settings.vue
│   ├── components/          # 通用组件
│   │   ├── ConnectionTree.vue
│   │   ├── SqlEditor.vue
│   │   ├── ResultTable.vue
│   │   └── DatabaseTree.vue
│   ├── stores/              # Pinia 状态管理
│   │   ├── connection.ts
│   │   ├── editor.ts
│   │   └── settings.ts
│   ├── composables/         # 组合式函数
│   ├── api/                 # API 调用
│   ├── locales/             # 国际化
│   ├── styles/              # 全局样式
│   └── types/               # TypeScript 类型
├── resources/               # 资源文件
│   ├── icons/               # 应用图标
│   └── drivers/             # JDBC 驱动
├── build/                   # 构建配置
│   └── electron-builder.json
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 技术难点与解决方案

### 1. 数据库驱动选择
**难点**: 需要支持多种不同类型的数据库

**解决方案**: **使用原生驱动（推荐）**

#### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **JDBC 桥接**<br>(node-java) | • 统一接口<br>• 理论上支持所有 JDBC 数据库 | • **需要用户安装 JRE/JDK**<br>• 性能开销大（跨进程通信）<br>• 内存占用高<br>• 打包体积大<br>• MongoDB/Redis 不支持 JDBC | ❌ 不推荐 |
| **原生驱动**<br>(npm 包) | • **性能优秀**（直接 TCP 连接）<br>• **无需额外依赖**<br>• 打包体积小<br>• 生态成熟<br>• TypeScript 支持好<br>• 特性支持全 | • 需要适配不同驱动 | ✅ **强烈推荐** |

#### 推荐的原生驱动

```typescript
// MySQL
import mysql from 'mysql2/promise';

// ClickHouse
import { ClickHouseClient, createClient } from '@clickhouse/client';

// MongoDB
import { MongoClient } from 'mongodb';

// Redis
import { createClient as createRedisClient } from 'redis';
// 或使用 ioredis（功能更强大）
import Redis from 'ioredis';
```

#### 统一适配器模式

```typescript
// 定义统一接口
interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<QueryResult>;
  getMetadata(): Promise<DatabaseMetadata>;
  testConnection(): Promise<boolean>;
}

// MySQL 适配器
class MySQLAdapter implements DatabaseAdapter {
  private connection: mysql.Connection;
  
  async connect() {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }
  
  async query(sql: string, params?: any[]) {
    const [rows, fields] = await this.connection.execute(sql, params);
    return { rows, fields };
  }
}

// ClickHouse 适配器
class ClickHouseAdapter implements DatabaseAdapter {
  private client: ClickHouseClient;
  
  async connect() {
    this.client = createClient({
      host: `http://${this.config.host}:${this.config.httpPort}`,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }
  
  async query(sql: string) {
    const resultSet = await this.client.query({ query: sql });
    return await resultSet.json();
  }
}

// MongoDB 适配器
class MongoDBAdapter implements DatabaseAdapter {
  private client: MongoClient;
  private db: Db;
  
  async connect() {
    this.client = new MongoClient(this.config.connectionString);
    await this.client.connect();
    this.db = this.client.db(this.config.database);
  }
  
  // query 参数接收 MongoDB 查询对象
  async query(queryStr: string) {
    // 解析 MongoDB 查询语法
    // 例如: db.users.find({ age: { $gt: 18 } })
    const { collection, operation, params } = parseMongoQuery(queryStr);
    const coll = this.db.collection(collection);
    return await coll[operation](params).toArray();
  }
}

// Redis 适配器
class RedisAdapter implements DatabaseAdapter {
  private client: Redis;
  
  async connect() {
    this.client = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.database
    });
  }
  
  // query 参数接收 Redis 命令
  async query(command: string) {
    // 解析 Redis 命令
    // 例如: GET user:1001
    const [cmd, ...args] = command.split(' ');
    return await this.client.call(cmd, ...args);
  }
}
```

#### 优势总结

1. **性能**: 原生驱动直接使用数据库协议，无中间层开销
2. **用户体验**: 无需安装 JRE/JDK，开箱即用
3. **打包体积**: 只需打包 npm 包，体积小（vs JRE 几百 MB）
4. **维护性**: 社区活跃，bug 修复快
5. **特性支持**: 能使用数据库的所有最新特性

### 2. 大数据集渲染
**难点**: 查询结果可能有数十万行

**解决方案**:
- 虚拟滚动（只渲染可见行）
- 分页加载
- 流式传输
- 限制默认返回行数

### 3. SQL 语法高亮和补全
**难点**: 不同数据库方言差异大

**解决方案**:
- Monaco Editor 内置 SQL 支持
- 自定义语法规则
- 动态加载元数据用于补全

### 4. 跨平台打包
**难点**: Windows 和 macOS 打包配置不同

**解决方案**:
- electron-builder 统一配置
- CI/CD 自动化构建
- 代码签名（macOS 需要开发者证书）

---

## 依赖清单

### 前端依赖
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "vue-i18n": "^9.8.0",
    "naive-ui": "^2.36.0",
    "monaco-editor": "^0.45.0",
    "axios": "^1.6.0",
    "echarts": "^5.4.0",
    "@vueuse/core": "^10.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "electron-vite": "^2.0.0"
  }
}
```

### 后端依赖
```json
{
  "dependencies": {
    "express": "^4.18.0",
    
    // 本地存储
    "better-sqlite3": "^9.2.0",
    
    // 数据库原生驱动
    "mysql2": "^3.6.0",
    "@clickhouse/client": "^0.2.0",
    "mongodb": "^6.3.0",
    "ioredis": "^5.3.0",
    
    // 工具库
    "winston": "^3.11.0",
    "dotenv": "^16.3.0",
    "fs-extra": "^11.2.0"
  }
}
```

### 驱动版本说明

| 驱动 | 版本 | 说明 |
|------|------|------|
| `mysql2` | ^3.6.0 | MySQL 官方推荐，支持 Promise，性能优于 mysql |
| `@clickhouse/client` | ^0.2.0 | ClickHouse 官方 Node.js 客户端 |
| `mongodb` | ^6.3.0 | MongoDB 官方驱动，支持最新特性 |
| `ioredis` | ^5.3.0 | 功能最强大的 Redis 客户端，支持 Cluster/Sentinel |
| `better-sqlite3` | ^9.2.0 | 用于本地数据存储，性能优秀 |

---

## 测试策略

### 单元测试
- **框架**: Vitest
- **覆盖**: 工具函数、状态管理、API 调用

### E2E 测试
- **框架**: Playwright
- **场景**: 连接创建、查询执行、数据浏览

### 手动测试
- 不同数据库连接测试
- 跨平台兼容性测试
- 性能测试（大数据集）

---

## 发布流程

### 版本管理
- 语义化版本（Semantic Versioning）
- Git Tag 标记版本
- CHANGELOG 记录

### 构建流程
1. 代码检查（ESLint）
2. 类型检查（TypeScript）
3. 单元测试
4. 构建前端（Vite）
5. 打包 Electron（electron-builder）
6. 生成安装包（.exe, .dmg）

### 分发渠道
- GitHub Releases
- 官网下载
- 自动更新（electron-updater）

---

## 后续扩展方向

### 功能扩展
- 🔌 插件系统（支持第三方扩展）
- 📊 数据可视化（图表生成）
- 🤖 AI 辅助（SQL 生成、优化建议）
- 👥 团队协作（通过 Git 共享 SQL 脚本）
- 🔄 数据库迁移工具
- 📱 Web 版本（可选）

### 数据库支持扩展
- MongoDB（NoSQL）
- Redis
- Cassandra
- ClickHouse
- Snowflake

---

## 总结

本设计文档提供了 UniDb 数据库管理工具的完整技术方案，包括：

✅ **现代化技术栈**: Vue 3 + TypeScript + Electron + Node.js  
✅ **跨平台支持**: Windows 和 macOS  
✅ **JDBC 驱动**: 支持多种主流数据库  
✅ **国际化**: 中文和英文支持  
✅ **现代化 UI**: 基于 Naive UI，暗色主题优先  
✅ **完整架构**: 清晰的模块划分和数据流  
✅ **可扩展性**: 插件系统、更多数据库支持  

该方案在技术选型、架构设计、UI/UX、安全性等方面都进行了充分考虑，可以作为项目开发的指导文档。

---

**文档版本**: v1.0  
**创建日期**: 2026-03-31  
**作者**: UniDb Team
