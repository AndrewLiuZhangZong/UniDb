import { MongoClient, Db } from 'mongodb'
import { DatabaseAdapter } from './types'

export class MongoDBAdapter implements DatabaseAdapter {
  private client: MongoClient | null = null
  private db: Db | null = null
  private mode: string
  private config: any

  constructor(mode: string, config: any) {
    this.mode = mode
    this.config = config
  }

  async connect(): Promise<void> {
    const connectionString = this.config.connectionString || 
      `mongodb://${this.config.host}:${this.config.port}/${this.config.database}`
    
    this.client = new MongoClient(connectionString)
    await this.client.connect()
    this.db = this.client.db(this.config.database)
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  async query(queryStr: string): Promise<any> {
    if (!this.db) {
      throw new Error('Not connected to database')
    }

    try {
      const parsed = this.parseMongoQuery(queryStr)
      const collection = this.db.collection(parsed.collection)
      
      if (parsed.operation === 'find') {
        return await collection.find(parsed.query).limit(1000).toArray()
      } else if (parsed.operation === 'aggregate') {
        return await collection.aggregate(parsed.pipeline).toArray()
      }
      
      throw new Error(`Unsupported operation: ${parsed.operation}`)
    } catch (error) {
      throw new Error(`Query execution failed: ${(error as Error).message}`)
    }
  }

  private parseMongoQuery(queryStr: string): any {
    const findMatch = queryStr.match(/db\.(\w+)\.find\((.*)\)/)
    if (findMatch) {
      return {
        collection: findMatch[1],
        operation: 'find',
        query: findMatch[2] ? JSON.parse(findMatch[2]) : {}
      }
    }

    const aggregateMatch = queryStr.match(/db\.(\w+)\.aggregate\((.*)\)/)
    if (aggregateMatch) {
      return {
        collection: aggregateMatch[1],
        operation: 'aggregate',
        pipeline: JSON.parse(aggregateMatch[2])
      }
    }

    throw new Error('Invalid MongoDB query syntax')
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      await this.db?.admin().ping()
      await this.disconnect()
      return true
    } catch (error) {
      console.error('MongoDB connection test failed:', error)
      return false
    }
  }
}
