import { Router } from "express";
import { pool } from "../src/db.js"; // adjust path to your DB connection
import { hashPassword, comparePassword } from "../utils/password.js";
import { signJwt , authRequired} from "../middleware/auth.js";
import { body, validationResult } from "express-validator";
import { ok, created, bad, serverError, unauthorized } from "../utils/respond.js";

const router = Router();

/** Register employee */
router.post(
  "/register",
  body("full_name").isLength({ min: 2 }),
  body("username").isLength({ min: 3 }),
  body("password").isLength({ min: 6 }),
  body("role").optional().isIn(["manager", "staff"]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return bad(res, errors.array());

      const { full_name, username, password, role = "staff" } = req.body;

      const [exists] = await pool.query(
        "SELECT employee_id FROM employees WHERE username = ?",
        [username]
      );
      if (exists.length) return bad(res, "Username already taken");

      const hashed = await hashPassword(password);
      const [result] = await pool.query(
        "INSERT INTO employees (full_name, username, password, role) VALUES (?, ?, ?, ?)",
        [full_name, username, hashed, role]
      );

      return created(res, { employee_id: result.insertId, username, role });
    } catch (e) {
      return serverError(res, e);
    }
  }
);

/** Login */
router.post(
  "/login",
  body("username").notEmpty(),
  body("password").notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return bad(res, errors.array());

      const { username, password } = req.body;

      const [rows] = await pool.query(
        "SELECT * FROM employees WHERE username=? AND active=1",
        [username]
      );

      if (!rows.length) return bad(res, "Invalid credentials");

      const user = rows[0];
      const match = await comparePassword(password, user.password);
      if (!match) return bad(res, "Invalid credentials");

      // ✅ JWT with employee_id
      const token = signJwt({
        employee_id: user.employee_id,
        username: user.username,
        role: user.role,
      });
return ok(res, {
  success: true,
  token, // <-- add this
  data: {
    employee_id: user.employee_id,
    full_name: user.full_name,
    role: user.role,
  },
});

    } catch (e) {
      return serverError(res, e);
    }
  }
);

/** Auth middleware */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return unauthorized(res, "Missing token");

  try {
    const decoded = signJwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { employee_id, username, role }
    next();
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }
} 

router.get("/me", authRequired, async (req, res) => {
  try {
    if (!req.user || !req.user.employee_id) {
      return bad(res, "Unauthorized");
    }

    const [rows] = await pool.query(
      "SELECT employee_id, full_name, role FROM employees WHERE employee_id = ?",
      [req.user.employee_id]
    );

    if (rows.length === 0) {
      return bad(res, "User not found");
    }

    const user = rows[0];
    return ok(res, user); // cleaner
  } catch (e) {
    return serverError(res, e);
  }
});

export default router;




// import { Router } from 'express';
// import { pool } from '../src/db.js';
// import { hashPassword, comparePassword } from '../utils/password.js';
// import { ok, created, bad, serverError } from '../utils/respond.js';
// import { signJwt, authRequired } from '../middleware/auth.js';
// import { body, validationResult } from 'express-validator';

// const router = Router();

// /** Register employee */
// router.post(
//   '/register',
//   body('full_name').isLength({ min: 2 }),
//   body('username').isLength({ min: 3 }),
//   body('password').isLength({ min: 6 }),
//   body('role').optional().isIn(['manager','staff']),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) return bad(res, errors.array());

//       const { full_name, username, password, role = 'staff' } = req.body;
//       const [exists] = await pool.query(
//         'SELECT employee_id FROM employees WHERE username=?',
//         [username]
//       );
//       if (exists.length) return bad(res, 'Username already taken');

//       const hashed = await hashPassword(password);
//       const [result] = await pool.query(
//         'INSERT INTO employees (full_name, username, password, role) VALUES (?,?,?,?)',
//         [full_name, username, hashed, role]
//       );

//       return created(res, {
//         employee_id: result.insertId,
//         username,
//         role,
//       });
//     } catch (e) {
//       return serverError(res, e);
//     }
//   }
// );

// /** Login */
// router.post(
//   '/login',
//   body('username').notEmpty(),
//   body('password').notEmpty(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) return bad(res, errors.array());

//       const { username, password } = req.body;
//       const [rows] = await pool.query(
//         'SELECT * FROM employees WHERE username=? AND active=1',
//         [username]
//       );
//       if (!rows.length) return bad(res, 'Invalid credentials');
//       const user = rows[0];

//       const match = await comparePassword(password, user.password);
//       if (!match) return bad(res, 'Invalid credentials');

//       const token = signJwt({
//         employee_id: user.employee_id,
//         username: user.username,
//         role: user.role,
//       });

//       return ok(res, {
//         token,
//         user: {
//           employee_id: user.employee_id,
//           full_name: user.full_name,
//           role: user.role,
//         },
//       });
//     } catch (e) {
//       return serverError(res, e);
//     }
//   }
// );

// /** ✅ Get current user */
// router.get('/me', authRequired, async (req, res) => {
//   try {
//     const { employee_id } = req.user; // comes from JWT
//     const [rows] = await pool.query(
//       'SELECT employee_id, full_name, username, role FROM employees WHERE employee_id=? AND active=1',
//       [employee_id]
//     );
//     if (!rows.length) return bad(res, 'User not found');
//     return ok(res, rows[0]);
//   } catch (e) {
//     return serverError(res, e);
//   }
// });

// export default router;
