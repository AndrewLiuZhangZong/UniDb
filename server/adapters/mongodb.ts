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
    if (!this.db) throw new Error('Not connected to database')

    try {
      // Command format: op:dbName.colName:arg1:arg2...
      const colonIdx = queryStr.indexOf(':')
      if (colonIdx !== -1) {
        const op = queryStr.substring(0, colonIdx)
        const rest = queryStr.substring(colonIdx + 1)
        return await this.executeCommand(op, rest)
      }

      // Legacy: db.collection.find(...) / db.collection.aggregate(...)
      const findMatch = queryStr.match(/db\.(\w+)\.find\((.*)\)/s)
      if (findMatch) {
        const col = this.resolveCollection(findMatch[1])
        const filter = findMatch[2]?.trim() ? JSON.parse(findMatch[2]) : {}
        return await col.find(filter).limit(200).toArray()
      }
      const aggMatch = queryStr.match(/db\.(\w+)\.aggregate\((.*)\)/s)
      if (aggMatch) {
        const col = this.resolveCollection(aggMatch[1])
        return await col.aggregate(JSON.parse(aggMatch[2])).toArray()
      }

      throw new Error('Invalid MongoDB query syntax')
    } catch (error) {
      throw new Error(`Query execution failed: ${(error as Error).message}`)
    }
  }

  private resolveCollection(colName: string) {
    return this.db!.collection(colName)
  }

  private resolveDbAndCol(target: string): { db: import('mongodb').Db; col: string } {
    const dot = target.indexOf('.')
    if (dot !== -1) {
      const dbName = target.substring(0, dot)
      const colName = target.substring(dot + 1)
      return { db: this.client!.db(dbName), col: colName }
    }
    return { db: this.db!, col: target }
  }

  private async executeCommand(op: string, rest: string): Promise<any> {
    // split rest by first colon to get target (db.col) and remaining args
    const parts = rest.split(':')
    const target = parts[0]
    const { db, col } = this.resolveDbAndCol(target)
    const collection = db.collection(col)

    if (op === 'find') {
      const filter = parts[1]?.trim() ? JSON.parse(parts[1]) : {}
      const skip = parseInt(parts[2] || '0') || 0
      const limit = parseInt(parts[3] || '50') || 50
      return await collection.find(filter).skip(skip).limit(limit).toArray()
    }

    if (op === 'aggregate') {
      const pipeline = JSON.parse(parts[1] || '[]')
      return await collection.aggregate(pipeline).toArray()
    }

    if (op === 'insertOne') {
      const doc = JSON.parse(parts[1])
      const result = await collection.insertOne(doc)
      return { insertedId: result.insertedId }
    }

    if (op === 'updateOne') {
      const filter = JSON.parse(parts[1])
      const update = JSON.parse(parts[2])
      const result = await collection.updateOne(filter, update)
      return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
    }

    if (op === 'deleteOne') {
      const filter = JSON.parse(parts[1])
      const result = await collection.deleteOne(filter)
      return { deletedCount: result.deletedCount }
    }

    if (op === 'createCollection') {
      await db.createCollection(col)
      return { ok: 1 }
    }

    if (op === 'dropCollection') {
      await db.dropCollection(col)
      return { ok: 1 }
    }

    throw new Error(`Unsupported MongoDB operation: ${op}`)
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
