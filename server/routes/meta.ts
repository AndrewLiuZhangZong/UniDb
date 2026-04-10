import { Router } from 'express'
import { DatabaseAdapterFactory } from '../adapters/factory'
import { getDatabase } from '../database/init'

const router = Router()

// Helper: get connection config
function getConnection(connectionId: string) {
  const db = getDatabase()
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId) as any
  if (!conn) throw new Error(`Connection not found: ${connectionId}`)
  conn.config = JSON.parse(conn.config)
  return conn
}

// ── MySQL ─────────────────────────────────────────────────────────────────

// GET /api/meta/mysql/:connectionId/databases
router.get('/mysql/:connectionId/databases', async (req, res) => {
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query('SHOW DATABASES')
    await adapter.disconnect()
    const dbs = (result.rows || []).map((r: any) => Object.values(r)[0] as string)
    res.json({ databases: dbs })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/tables?database=xxx
router.get('/mysql/:connectionId/tables', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const db = database ? `\`${database}\`` : 'DATABASE()'
    const result = await adapter.query(
      `SELECT TABLE_NAME, ENGINE, TABLE_ROWS, TABLE_COMMENT
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ${database ? `'${database}'` : 'DATABASE()'}
       AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`
    )
    await adapter.disconnect()
    const tables = (result.rows || []).map((r: any) => ({
      name: r.TABLE_NAME,
      engine: r.ENGINE,
      rows: r.TABLE_ROWS,
      comment: r.TABLE_COMMENT
    }))
    res.json({ tables })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/views?database=xxx
router.get('/mysql/:connectionId/views', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query(
      `SELECT TABLE_NAME FROM information_schema.VIEWS
       WHERE TABLE_SCHEMA = ${database ? `'${database}'` : 'DATABASE()'}
       ORDER BY TABLE_NAME`
    )
    await adapter.disconnect()
    const views = (result.rows || []).map((r: any) => ({ name: r.TABLE_NAME }))
    res.json({ views })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/functions?database=xxx
router.get('/mysql/:connectionId/functions', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const dbName = database || adapter.connection?.config?.database
    const result = await adapter.query(
      `SELECT ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE, DTD_IDENTIFIER, SECURITY_TYPE, DEFINER, CREATED, LAST_ALTERED
       FROM information_schema.ROUTINES
       WHERE ROUTINE_SCHEMA = ${dbName ? `'${dbName}'` : 'DATABASE()'}
       AND ROUTINE_TYPE IN ('FUNCTION', 'PROCEDURE')
       ORDER BY ROUTINE_NAME`
    )
    await adapter.disconnect()
    const functions = (result.rows || []).map((r: any) => ({
      name: r.ROUTINE_NAME,
      type: r.ROUTINE_TYPE,
      dataType: r.DATA_TYPE,
      dtdIdentifier: r.DTD_IDENTIFIER,
      securityType: r.SECURITY_TYPE,
      definer: r.DEFINER,
      created: r.CREATED,
      lastAltered: r.LAST_ALTERED
    }))
    res.json({ functions })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/events?database=xxx
router.get('/mysql/:connectionId/events', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const dbName = database || adapter.connection?.config?.database
    const result = await adapter.query(
      `SELECT EVENT_NAME, DEFINER, TIME_ZONE, EVENT_TYPE, execute_at, INTERVAL_VALUE, INTERVAL_FIELD,
       STARTS, ENDS, STATUS, ORIGINATOR, SQL_MODE, BODY
       FROM information_schema.EVENTS
       WHERE EVENT_SCHEMA = ${dbName ? `'${dbName}'` : 'DATABASE()'}
       ORDER BY EVENT_NAME`
    )
    await adapter.disconnect()
    const events = (result.rows || []).map((r: any) => ({
      name: r.EVENT_NAME,
      definer: r.DEFINER,
      timeZone: r.TIME_ZONE,
      eventType: r.EVENT_TYPE,
      executeAt: r.execute_at,
      intervalValue: r.INTERVAL_VALUE,
      intervalField: r.INTERVAL_FIELD,
      starts: r.STARTS,
      ends: r.ENDS,
      status: r.STATUS,
      originator: r.ORIGINATOR
    }))
    res.json({ events })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/tableinfo?database=xxx&table=yyy
router.get('/mysql/:connectionId/tableinfo', async (req, res) => {
  const { database, table } = req.query as { database?: string; table: string }
  if (!database || !table) {
    res.status(400).json({ error: 'database and table are required' })
    return
  }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query(
      `SELECT TABLE_NAME, ENGINE, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH,
              TABLE_COLLATION, CREATE_TIME, UPDATE_TIME, TABLE_COMMENT, AUTO_INCREMENT
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [database, table]
    )
    await adapter.disconnect()
    const row = (result.rows || [])[0] as any
    if (!row) {
      res.status(404).json({ error: 'Table not found' })
      return
    }
    res.json({
      table: {
        name: row.TABLE_NAME,
        engine: row.ENGINE,
        tableRows: row.TABLE_ROWS,
        dataLength: row.DATA_LENGTH,
        indexLength: row.INDEX_LENGTH,
        collation: row.TABLE_COLLATION,
        createTime: row.CREATE_TIME,
        updateTime: row.UPDATE_TIME,
        comment: row.TABLE_COMMENT,
        autoIncrement: row.AUTO_INCREMENT
      }
    })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/columns?database=xxx&table=yyy
router.get('/mysql/:connectionId/columns', async (req, res) => {
  const { database, table } = req.query as { database?: string; table: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ${database ? `'${database}'` : 'DATABASE()'}
       AND TABLE_NAME = '${table}'
       ORDER BY ORDINAL_POSITION`
    )
    await adapter.disconnect()
    const columns = (result.rows || []).map((r: any) => ({
      name: r.COLUMN_NAME,
      type: r.COLUMN_TYPE,
      notNull: r.IS_NULLABLE === 'NO',
      isPrimary: r.COLUMN_KEY === 'PRI',
      autoIncrement: r.EXTRA?.includes('auto_increment'),
      comment: r.COLUMN_COMMENT
    }))
    res.json({ columns })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/indexes?database=xxx&table=yyy
router.get('/mysql/:connectionId/indexes', async (req, res) => {
  const { database, table } = req.query as { database?: string; table: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query(
      `SELECT INDEX_NAME, INDEX_TYPE, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLS
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ${database ? `'${database}'` : 'DATABASE()'}
       AND TABLE_NAME = '${table}'
       GROUP BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE
       ORDER BY INDEX_NAME`
    )
    await adapter.disconnect()
    const indexes = (result.rows || []).map((r: any) => ({
      name: r.INDEX_NAME,
      type: r.INDEX_TYPE,
      unique: r.NON_UNIQUE === 0,
      columns: r.COLS.split(',')
    }))
    res.json({ indexes })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mysql/:connectionId/tabledata?database=xxx&table=yyy&page=1&pageSize=50
router.get('/mysql/:connectionId/tabledata', async (req, res) => {
  const { database, table, page = '1', pageSize = '50' } = req.query as any
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const dbPrefix = database ? `\`${database}\`.` : ''
    console.log(`[tabledata] Query: SELECT * FROM ${dbPrefix}\`${table}\` LIMIT ${pageSize} OFFSET ${offset}`)
    const result = await adapter.query(`SELECT * FROM ${dbPrefix}\`${table}\` LIMIT ${pageSize} OFFSET ${offset}`)
    console.log(`[tabledata] Result rows: ${result.rows?.length}, fields: ${result.fields?.length}`)
    const countResult = await adapter.query(`SELECT COUNT(*) as total FROM ${dbPrefix}\`${table}\``)
    console.log(`[tabledata] Count result:`, countResult.rows)
    await adapter.disconnect()
    res.json({
      rows: result.rows || [],
      fields: result.fields?.map((f: any) => ({ name: f.name, type: f.type })) || [],
      total: (countResult.rows?.[0] as any)?.total || 0
    })
  } catch (e) {
    console.error('[tabledata] Error:', e)
    res.status(500).json({ error: (e as Error).message })
  }
})

// ── ClickHouse ────────────────────────────────────────────────────────────

// GET /api/meta/clickhouse/:connectionId/databases
router.get('/clickhouse/:connectionId/databases', async (req, res) => {
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query('SHOW DATABASES')
    await adapter.disconnect()
    const dbs = (result.data || []).map((r: any) => r.name || r.database)
    res.json({ databases: dbs })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/clickhouse/:connectionId/tables?database=xxx
router.get('/clickhouse/:connectionId/tables', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const db = database || 'default'
    const result = await adapter.query(
      `SELECT name, engine, total_rows, partition_key, sorting_key
       FROM system.tables WHERE database = '${db}' ORDER BY name`
    )
    await adapter.disconnect()
    const tables = (result.data || []).map((r: any) => ({
      name: r.name,
      engine: r.engine,
      rows: r.total_rows,
      partitionBy: r.partition_key,
      orderBy: r.sorting_key
    }))
    res.json({ tables })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/clickhouse/:connectionId/columns?database=xxx&table=yyy
router.get('/clickhouse/:connectionId/columns', async (req, res) => {
  const { database, table } = req.query as any
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const db = database || 'default'
    const result = await adapter.query(
      `SELECT name, type, is_in_sorting_key
       FROM system.columns WHERE database = '${db}' AND table = '${table}'
       ORDER BY position`
    )
    await adapter.disconnect()
    const columns = (result.data || []).map((r: any) => ({
      name: r.name,
      type: r.type,
      isSortKey: r.is_in_sorting_key === 1
    }))
    res.json({ columns })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// ── MongoDB ────────────────────────────────────────────────────────────────

// GET /api/meta/mongodb/:connectionId/databases
router.get('/mongodb/:connectionId/databases', async (req, res) => {
  try {
    const conn = getConnection(req.params.connectionId)
    const { MongoClient } = await import('mongodb')
    const uri = conn.config.connectionString ||
      `mongodb://${conn.config.host}:${conn.config.port}`
    const client = new MongoClient(uri)
    await client.connect()
    const result = await client.db().admin().listDatabases()
    await client.close()
    res.json({ databases: result.databases.map((d: any) => ({ name: d.name, sizeOnDisk: d.sizeOnDisk })) })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mongodb/:connectionId/collections?database=xxx
router.get('/mongodb/:connectionId/collections', async (req, res) => {
  const { database } = req.query as { database?: string }
  try {
    const conn = getConnection(req.params.connectionId)
    const { MongoClient } = await import('mongodb')
    const uri = conn.config.connectionString ||
      `mongodb://${conn.config.host}:${conn.config.port}`
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(database || conn.config.database)
    const colls = await db.listCollections().toArray()
    const stats = await Promise.all(colls.map(async (c: any) => {
      const s = await db.command({ collStats: c.name })
      return { name: c.name, count: s.count, size: s.size }
    }))
    await client.close()
    res.json({ collections: stats })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/mongodb/:connectionId/indexes?database=xxx&collection=yyy
router.get('/mongodb/:connectionId/indexes', async (req, res) => {
  const { database, collection } = req.query as any
  try {
    const conn = getConnection(req.params.connectionId)
    const { MongoClient } = await import('mongodb')
    const uri = conn.config.connectionString ||
      `mongodb://${conn.config.host}:${conn.config.port}`
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(database || conn.config.database)
    const indexes = await db.collection(collection).listIndexes().toArray()
    await client.close()
    res.json({
      indexes: indexes.map((idx: any) => ({
        name: idx.name,
        keys: idx.key,
        unique: !!idx.unique
      }))
    })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// ── Redis ──────────────────────────────────────────────────────────────────

// GET /api/meta/redis/:connectionId/info
router.get('/redis/:connectionId/info', async (req, res) => {
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const result = await adapter.query('INFO ALL')
    await adapter.disconnect()
    const raw: string = result.result || ''
    const info: Record<string, string> = {}
    raw.split('\n').forEach((line: string) => {
      const [k, v] = line.split(':')
      if (k && v) info[k.trim()] = v.trim()
    })
    res.json({ info })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/redis/:connectionId/keys?pattern=*&count=200
router.get('/redis/:connectionId/keys', async (req, res) => {
  const { pattern = '*', count = '200' } = req.query as { pattern?: string; count?: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    // Use SCAN for safe key iteration
    const scanResult = await adapter.query(`SCAN 0 MATCH ${pattern} COUNT ${count}`)
    const keys: string[] = scanResult.result?.[1] || []
    // Get type and TTL for each key (batch up to 100)
    const sample = keys.slice(0, 100)
    const keyDetails = await Promise.all(sample.map(async (key: string) => {
      const typeR = await adapter.query(`TYPE ${key}`)
      const ttlR = await adapter.query(`TTL ${key}`)
      return { key, type: typeR.result, ttl: parseInt(ttlR.result) }
    }))
    await adapter.disconnect()
    res.json({ keys: keyDetails, total: keys.length })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// GET /api/meta/redis/:connectionId/value?key=xxx
router.get('/redis/:connectionId/value', async (req, res) => {
  const { key } = req.query as { key: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    const typeR = await adapter.query(`TYPE ${key}`)
    const ttlR = await adapter.query(`TTL ${key}`)
    const type: string = typeR.result
    let value: any = null

    if (type === 'string') {
      const r = await adapter.query(`GET ${key}`)
      value = r.result
    } else if (type === 'hash') {
      const r = await adapter.query(`HGETALL ${key}`)
      const arr: string[] = r.result || []
      value = []
      for (let i = 0; i < arr.length; i += 2) {
        value.push({ field: arr[i], value: arr[i + 1] })
      }
    } else if (type === 'list') {
      const r = await adapter.query(`LRANGE ${key} 0 99`)
      value = r.result || []
    } else if (type === 'set') {
      const r = await adapter.query(`SMEMBERS ${key}`)
      value = r.result || []
    } else if (type === 'zset') {
      const r = await adapter.query(`ZRANGE ${key} 0 99 WITHSCORES`)
      const arr: string[] = r.result || []
      value = []
      for (let i = 0; i < arr.length; i += 2) {
        value.push({ member: arr[i], score: parseFloat(arr[i + 1]) })
      }
    }

    await adapter.disconnect()
    res.json({ key, type, ttl: parseInt(ttlR.result), value })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// POST /api/meta/redis/:connectionId/set  { key, type, value, ttl? }
router.post('/redis/:connectionId/set', async (req, res) => {
  const { key, type, value, ttl } = req.body
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    if (type === 'string') {
      await adapter.query(`SET ${key} ${value}`)
    } else if (type === 'hash' && Array.isArray(value)) {
      for (const f of value) {
        await adapter.query(`HSET ${key} ${f.field} ${f.value}`)
      }
    }
    if (ttl && ttl > 0) await adapter.query(`EXPIRE ${key} ${ttl}`)
    await adapter.disconnect()
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// DELETE /api/meta/redis/:connectionId/key?key=xxx
router.delete('/redis/:connectionId/key', async (req, res) => {
  const { key } = req.query as { key: string }
  try {
    const adapter = await DatabaseAdapterFactory.createAdapter(req.params.connectionId) as any
    await adapter.connect()
    await adapter.query(`DEL ${key}`)
    await adapter.disconnect()
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

export default router
