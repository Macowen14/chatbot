
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
	host: process.env.PGHOST || "localhost",
	port: Number(process.env.PGPORT) || 5432,
	user: process.env.PGUSER || "postgres",
	password: process.env.PGPASSWORD || "chatPASS101",
	database: process.env.PGDATABASE || "chatbot",
	max: Number(process.env.PGPOOLMAX) || 10,
	idleTimeoutMillis: Number(process.env.PGIDLE) || 30000,
	connectionTimeoutMillis: Number(process.env.PGCONN_TIMEOUT) || 2000,
});

// Log pool errors
pool.on("error", (err) => {
	console.error("Unexpected error on idle PostgreSQL client", err);
});

// Optional: log when a new client is connected
pool.on("connect", () => {
	console.log("PostgreSQL client connected (pool)");
});

/**
 * Test DB connection once at startup.
 */
export async function connectDB() {
	try {
		const client = await pool.connect();
		try {
			const res = await client.query("SELECT NOW()");
			console.log("Postgres connected:", res.rows[0].now);
		} finally {
			client.release();
		}
	} catch (err) {
		console.error("Failed to connect to Postgres", err);
		// Exit so process manager can restart or fail-fast during development
		process.exit(1);
	}
}

// Graceful shutdown: close pool on process termination
async function closePool() {
	try {
		await pool.end();
		console.log("PostgreSQL pool has ended");
	} catch (err) {
		console.error("Error while ending PostgreSQL pool", err);
	}
}

process.on("SIGINT", closePool);
process.on("SIGTERM", closePool);

export default pool;

