import { pool } from '../src/db.js'

// Usage: logAction(req, 'CREATE_PRODUCT', 'product', newId, {payload: req.body})
export async function logAction(req, action, entity, entity_id = null, details = null) {
  try {
    const employee_id = req.user?.employee_id || null;
    await pool.query(
      'INSERT INTO activity_logs (employee_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
      [employee_id, action, entity, entity_id, details ? JSON.stringify(details) : null]
    );
  } catch (e) {
    // Do not block request if logging fails; just print.
    console.error('Log error:', e.message);
  }
}
