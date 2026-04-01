import mysql from 'mysql2/promise'
import { DatabaseAdapter, QueryResult } from './types'

export class MySQLAdapter implements DatabaseAdapter {
  private connection: mysql.Connection | null = null
  private mode: string
  private config: any

  constructor(mode: string, config: any) {
    this.mode = mode
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.mode === 'standalone') {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database
      })
    } else {
      throw new Error(`MySQL mode ${this.mode} not implemented yet`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connection) {
      throw new Error('Not connected to database')
    }

    const [rows, fields] = await this.connection.execute(sql, params || [])
    return { rows, fields }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.query('SELECT 1')
      await this.disconnect()
      return true
    } catch (error) {
      console.error('MySQL connection test failed:', error)
      return false
    }
  }
}
