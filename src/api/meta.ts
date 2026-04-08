import axios from 'axios'

// Resolve base URL dynamically (matches connection store logic)
let _base = ''
async function base(): Promise<string> {
  if (_base) return _base
  const isDev = import.meta.env.DEV
  if (isDev && (window as any).electronAPI?.getServerPort) {
    const port = await (window as any).electronAPI.getServerPort()
    _base = `http://localhost:${port}/api`
  } else {
    _base = 'http://localhost:3000/api'
  }
  return _base
}

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const b = await base()
  const res = await axios.get<T>(`${b}${path}`, { params })
  return res.data
}

async function post<T>(path: string, data?: any): Promise<T> {
  const b = await base()
  const res = await axios.post<T>(`${b}${path}`, data)
  return res.data
}

async function del<T>(path: string, params?: Record<string, any>): Promise<T> {
  const b = await base()
  const res = await axios.delete<T>(`${b}${path}`, { params })
  return res.data
}

// ── MySQL ────────────────────────────────────────────────────────────────
export const mysqlMeta = {
  databases: (id: string) => get<{ databases: string[] }>(`/meta/mysql/${id}/databases`),
  tables: (id: string, database?: string) => get<{ tables: any[] }>(`/meta/mysql/${id}/tables`, { database }),
  views: (id: string, database?: string) => get<{ views: any[] }>(`/meta/mysql/${id}/views`, { database }),
  columns: (id: string, table: string, database?: string) => get<{ columns: any[] }>(`/meta/mysql/${id}/columns`, { table, database }),
  indexes: (id: string, table: string, database?: string) => get<{ indexes: any[] }>(`/meta/mysql/${id}/indexes`, { table, database }),
  tableInfo: (id: string, table: string, database: string) =>
    get<{
      table: {
        name: string
        engine: string | null
        tableRows: number | null
        dataLength: number | null
        indexLength: number | null
        collation: string | null
        createTime: string | null
        updateTime: string | null
        comment: string | null
        autoIncrement: number | null
      }
    }>(`/meta/mysql/${id}/tableinfo`, { table, database }),
  tableData: (id: string, table: string, database?: string, page = 1, pageSize = 50) =>
    get<{ rows: any[]; fields: any[]; total: number }>(`/meta/mysql/${id}/tabledata`, { table, database, page, pageSize }),
  execute: (connectionId: string, query: string, database?: string) =>
    post<{ success: boolean; data: any; executionTime: number; rowCount: number; error?: string }>('/query/execute', { connectionId, query, database })
}

// ── ClickHouse ────────────────────────────────────────────────────────────
export const clickhouseMeta = {
  databases: (id: string) => get<{ databases: string[] }>(`/meta/clickhouse/${id}/databases`),
  tables: (id: string, database?: string) => get<{ tables: any[] }>(`/meta/clickhouse/${id}/tables`, { database }),
  columns: (id: string, table: string, database?: string) => get<{ columns: any[] }>(`/meta/clickhouse/${id}/columns`, { table, database }),
  execute: (connectionId: string, query: string, database?: string) =>
    post<{ success: boolean; data: any; executionTime: number; rowCount: number; error?: string }>('/query/execute', { connectionId, query, database })
}

// ── MongoDB ────────────────────────────────────────────────────────────────
export const mongodbMeta = {
  databases: (id: string) => get<{ databases: any[] }>(`/meta/mongodb/${id}/databases`),
  collections: (id: string, database?: string) => get<{ collections: any[] }>(`/meta/mongodb/${id}/collections`, { database }),
  indexes: (id: string, collection: string, database?: string) => get<{ indexes: any[] }>(`/meta/mongodb/${id}/indexes`, { collection, database }),
  execute: (connectionId: string, query: string) =>
    post<{ success: boolean; data: any; executionTime: number; rowCount: number; error?: string }>('/query/execute', { connectionId, query })
}

// ── Redis ──────────────────────────────────────────────────────────────────
export const redisMeta = {
  info: (id: string) => get<{ info: Record<string, string> }>(`/meta/redis/${id}/info`),
  keys: (id: string, pattern = '*', count = 200) => get<{ keys: any[]; total: number }>(`/meta/redis/${id}/keys`, { pattern, count }),
  value: (id: string, key: string) => get<{ key: string; type: string; ttl: number; value: any }>(`/meta/redis/${id}/value`, { key }),
  set: (id: string, data: { key: string; type: string; value: any; ttl?: number }) => post(`/meta/redis/${id}/set`, data),
  deleteKey: (id: string, key: string) => del(`/meta/redis/${id}/key`, { key }),
  execute: (connectionId: string, query: string) =>
    post<{ success: boolean; data: any; executionTime: number; error?: string }>('/query/execute', { connectionId, query })
}
