import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database

export function getDatabase(): Database.Database {
  if (!db) {
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'unidb.db')
    
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true })
    }
    
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  
  return db
}

export async function initDatabase() {
  const database = getDatabase()
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      mode TEXT NOT NULL,
      config TEXT NOT NULL,
      group_id TEXT,
      color TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_connected_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS connection_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      color TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS query_history (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      query TEXT NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms REAL,
      row_count INTEGER,
      success BOOLEAN,
      error_message TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      value_type TEXT DEFAULT 'string',
      category TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(type);
    CREATE INDEX IF NOT EXISTS idx_history_connection ON query_history(connection_id);
    CREATE INDEX IF NOT EXISTS idx_history_executed_at ON query_history(executed_at DESC);
  `)

  const settingsCount = database.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }
  
  if (settingsCount.count === 0) {
    const insertSetting = database.prepare(
      'INSERT INTO settings (key, value, value_type, category) VALUES (?, ?, ?, ?)'
    )
    
    insertSetting.run('app.language', 'zh-CN', 'string', 'ui')
    insertSetting.run('app.theme', 'dark', 'string', 'ui')
    insertSetting.run('editor.fontSize', '14', 'number', 'editor')
    insertSetting.run('editor.tabSize', '2', 'number', 'editor')
    insertSetting.run('query.maxRows', '1000', 'number', 'database')
  }

  console.log('Database initialized successfully')
}
