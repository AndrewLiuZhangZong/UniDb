import { getDatabase } from '../database/init'
import { MySQLAdapter } from './mysql'
import { ClickHouseAdapter } from './clickhouse'
import { MongoDBAdapter } from './mongodb'
import { RedisAdapter } from './redis'
import { DatabaseAdapter } from './types'

export class DatabaseAdapterFactory {
  static async createAdapter(connectionId: string): Promise<DatabaseAdapter> {
    const db = getDatabase()
    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId) as any
    
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`)
    }
    
    const config = JSON.parse(connection.config)
    return this.createAdapterFromConfig(connection.type, connection.mode, config)
  }
  
  static createAdapterFromConfig(type: string, mode: string, config: any): DatabaseAdapter {
    switch (type) {
      case 'mysql':
        return new MySQLAdapter(mode, config)
      case 'clickhouse':
        return new ClickHouseAdapter(mode, config)
      case 'mongodb':
        return new MongoDBAdapter(mode, config)
      case 'redis':
        return new RedisAdapter(mode, config)
      default:
        throw new Error(`Unsupported database type: ${type}`)
    }
  }
}
