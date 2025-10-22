  import { Router } from 'express';
  import { pool } from '../src/db.js';
  import { ok, created, notFound, bad, serverError } from '../utils/respond.js';
  import { authRequired } from '../middleware/auth.js';
  import { logAction } from '../middleware/logger.js';

  const router = Router();

  // Get all products
  router.get('/', authRequired, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, u.unit_name, u.unit_type 
        FROM products p JOIN units u ON p.unit_id=u.unit_id
        ORDER BY p.product_name
      `);
      return ok(res, rows);
    } catch (e) { return serverError(res, e); }
  });

  // Create product with duplicate check
  router.post('/', authRequired, async (req, res) => {
    try {
      const { product_name, description, unit_id } = req.body;
      if (!product_name || !unit_id) return bad(res, 'product_name and unit_id required');

      // Check if product already exists
      const [exists] = await pool.query(
        'SELECT product_id FROM products WHERE LOWER(product_name)=LOWER(?)',
        [product_name]
      );
      if (exists.length) return bad(res, 'Product with this name already exists');

      const [result] = await pool.query(
        'INSERT INTO products (product_name, description, unit_id) VALUES (?,?,?)',
        [product_name, description || null, unit_id]
      );
      await logAction(req, 'CREATE_PRODUCT', 'product', result.insertId, { product_name, unit_id });
      return created(res, { product_id: result.insertId, product_name, description, unit_id });
    } catch (e) { return serverError(res, e); }
  });

  // Update product with duplicate check (ignores same record)
  router.put('/:id', authRequired, async (req, res) => {
    try {
      const { product_name, description, unit_id } = req.body;

      // Check if another product has the same name
      const [exists] = await pool.query(
        'SELECT product_id FROM products WHERE LOWER(product_name)=LOWER(?) AND product_id<>?',
        [product_name, req.params.id]
      );
      if (exists.length) return bad(res, 'Another product with this name already exists');

      const [r] = await pool.query(
        'UPDATE products SET product_name=?, description=?, unit_id=? WHERE product_id=?',
        [product_name, description || null, unit_id, req.params.id]
      );
      if (!r.affectedRows) return notFound(res, 'Product not found');

      await logAction(req, 'UPDATE_PRODUCT', 'product', req.params.id, { product_name, unit_id });
      return ok(res, { product_id: req.params.id, product_name, description, unit_id });
    } catch (e) { return serverError(res, e); }
  });

  // Delete product
  router.delete('/:id', authRequired, async (req, res) => {
    try {
      const [r] = await pool.query('DELETE FROM products WHERE product_id=?', [req.params.id]);
      if (!r.affectedRows) return notFound(res, 'Product not found');
      await logAction(req, 'DELETE_PRODUCT', 'product', req.params.id);
      return ok(res, { deleted: true });
    } catch (e) { return serverError(res, e); }
  });

  export default router;
