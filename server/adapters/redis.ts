import Redis from 'ioredis'
import { DatabaseAdapter } from './types'

export class RedisAdapter implements DatabaseAdapter {
  private client: Redis | null = null
  private mode: string
  private config: any

  constructor(mode: string, config: any) {
    this.mode = mode
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.mode === 'standalone') {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.database || 0
      })
    } else if (this.mode === 'cluster') {
      this.client = new Redis.Cluster(this.config.nodes)
    } else {
      throw new Error(`Redis mode ${this.mode} not implemented yet`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
  }

  async query(command: string): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database')
    }

    const parts = command.trim().split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    const result = await this.client.call(cmd, ...args)
    return { command, result }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.client?.ping()
      await this.disconnect()
      return true
    } catch (error) {
      console.error('Redis connection test failed:', error)
      return false
    }
  }
}
