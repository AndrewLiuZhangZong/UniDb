import { Router } from 'express'
import { getDatabase } from '../database/init'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const connections = db.prepare('SELECT * FROM connections ORDER BY created_at DESC').all()
    res.json(connections)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.post('/', (req, res) => {
  try {
    const db = getDatabase()
    const { name, type, mode, config, group_id, color } = req.body
    
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO connections (id, name, type, mode, config, group_id, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, name, type, mode, JSON.stringify(config), group_id, color)
    
    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id)
    res.json(connection)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.put('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params
    const { name, type, mode, config, group_id, color } = req.body
    
    const stmt = db.prepare(`
      UPDATE connections 
      SET name = ?, type = ?, mode = ?, config = ?, group_id = ?, color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    stmt.run(name, type, mode, JSON.stringify(config), group_id, color, id)
    
    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id)
    res.json(connection)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params
    
    db.prepare('DELETE FROM connections WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
