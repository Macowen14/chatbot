import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./src/config/db.js";
import chatRoutes from "./src/routes/chat.routes.js";
import assistantRoutes from "./src/routes/assistant.routes.js";

dotenv.config();

const app = express();

var corsOptions = {
	origin: ["http://localhost:6000", "http://localhost:5173"],
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	Credential:true
};

// Essential middlewares
app.use(helmet()); // basic security headers
app.use(cors(corsOptions)); // enable CORS
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse urlencoded bodies
app.use(morgan("dev")); // request logging in dev

// Simple health route
app.get("/", (_req, res) => {
	res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

app.use("/api/chats", chatRoutes);
app.use("/api/bot", assistantRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Start sequence: connect to DB, then start HTTP server
async function startServer() {
	try {
		console.log("Connecting to Postgres...");
		await connectDB();
		console.log("Database connection established.");
	} catch (err) {
		console.error("Database connection failed. Aborting server start.", err);
		process.exit(1);
	}

	const server = app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});

	server.on("error", (err) => {
		console.error("HTTP server error:", err);
	});

	// Graceful shutdown helper
	const shutdown = (signal) => {
		console.log(`Received ${signal}. Shutting down gracefully...`);
		// stop accepting new connections
		server.close((err) => {
			if (err) {
				console.error("Error while closing HTTP server:", err);
				process.exit(1);
			}
			console.log("HTTP server closed.");
			// allow db pool handlers (in db.js) to run on SIGTERM/SIGINT
			process.exit(0);
		});
		// force exit if shutdown takes too long
		setTimeout(() => {
			console.error("Forcefully terminating process.");
			process.exit(1);
		}, 10000).unref();
	};

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));

	process.on("unhandledRejection", (reason) => {
		console.error("Unhandled Rejection:", reason);
		shutdown("unhandledRejection");
	});

	process.on("uncaughtException", (err) => {
		console.error("Uncaught Exception:", err);
		// fatal - try to shutdown gracefully
		shutdown("uncaughtException");
	});
}

startServer();

export default app;
