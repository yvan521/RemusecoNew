import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const sslEnabled = String(process.env.DB_SSL || "").toLowerCase() === "true";

function poolConfigFromUrl(urlString) {
  const u = new URL(urlString);

  const database = (u.pathname || "").replace(/^\//, "");
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username || ""),
    password: decodeURIComponent(u.password || ""),
    database,
  };
}

const baseConfig = connectionUrl
  ? poolConfigFromUrl(connectionUrl)
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    };

export const pool = mysql
  .createPool({
    ...baseConfig,
    ...(sslEnabled ? { ssl: {} } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// Test connection
(async () => {
  try {
    await pool.query('SELECT 1'); // ✅ simple safe test
    console.log('✅ Connected to MySQL database successfully!');
  } catch (err) {
    console.error('❌ Unable to connect to MySQL:', err.message);
    process.exit(1);
  }
})();
