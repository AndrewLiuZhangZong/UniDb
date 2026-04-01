export interface DatabaseAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  query(sql: string, params?: any[]): Promise<any>
  testConnection(): Promise<boolean>
  getMetadata?(): Promise<DatabaseMetadata>
}

export interface DatabaseMetadata {
  databases?: string[]
  tables?: TableMetadata[]
  version?: string
}

export interface TableMetadata {
  name: string
  schema?: string
  columns: ColumnMetadata[]
  rowCount?: number
}

export interface ColumnMetadata {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
}

export interface QueryResult {
  rows: any[]
  fields?: any[]
  rowCount: number
}
