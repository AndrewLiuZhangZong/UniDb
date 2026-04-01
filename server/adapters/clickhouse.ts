import { createClient, ClickHouseClient } from '@clickhouse/client'
import { DatabaseAdapter } from './types'

export class ClickHouseAdapter implements DatabaseAdapter {
  private client: ClickHouseClient | null = null
  private mode: string
  private config: any

  constructor(mode: string, config: any) {
    this.mode = mode
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.mode === 'standalone') {
      this.client = createClient({
        host: `http://${this.config.host}:${this.config.httpPort || 8123}`,
        username: this.config.username,
        password: this.config.password,
        database: this.config.database
      })
    } else {
      throw new Error(`ClickHouse mode ${this.mode} not implemented yet`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }
  }

  async query(sql: string): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }

    const resultSet = await this.client.query({ query: sql })
    const data = await resultSet.json()
    return data
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.query('SELECT 1')
      await this.disconnect()
      return true
    } catch (error) {
      console.error('ClickHouse connection test failed:', error)
      return false
    }
  }
}
