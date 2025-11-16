import pool from "../config/db.js";

export const searchChat = async (req, res) => {
	try {
		const { query } = req.query; // ?query=keyword

		if (!query || query.trim() === "") {
			return res.status(400).json({ error: "Query parameter is required." });
		}

		const searchTerm = `%${query}%`;

		const result = await db.query(
			`
            SELECT DISTINCT c.id, c.title, c.created_at
            FROM chats c
            LEFT JOIN messages m ON m.chat_id = c.id
            WHERE 
                  c.title ILIKE $1
               OR m.content ILIKE $1
               OR m.code ILIKE $1
            ORDER BY c.created_at DESC;
            `,
			[searchTerm]
		);

		res.json(result.rows);
	} catch (error) {
		console.error("Search error:", error);
		res.status(500).json({ error: "Server error while searching chats." });
	}
};

/**
 * GET /api/chats
 * - Optional query params:
 *    - q: search term to match chat title (ILIKE)
 *    - limit, offset: pagination
 */
export const getChats = async (req, res) => {
	try {
		const { q, limit = 50, offset = 0 } = req.query;

		let query = `SELECT id, title, created_at FROM chats`;
		const params = [];

		if (q) {
			params.push(`%${q}%`);
			query += ` WHERE title ILIKE $${params.length}`;
		}

		params.push(Number(limit));
		params.push(Number(offset));
		query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${
			params.length
		}`;

		console.info("DB: getChats", { q, limit, offset });
		const { rows } = await pool.query(query, params);
		return res.status(200).json(rows);
	} catch (err) {
		console.error("getChats error:", err);
		return res.status(500).json({ error: "Failed to fetch chats" });
	}
};

/**
 * POST /api/chats
 * - body: { title? }
 * Creates a new chat with provided title or default.
 */
export const saveChat = async (req, res) => {
	const { title = "New Chat" } = req.body;
	try {
		console.info("DB: saveChat", { title });
		const { rows } = await pool.query(
			`INSERT INTO chats (title) VALUES ($1) RETURNING id, title, created_at`,
			[title]
		);
		return res.status(201).json(rows[0]);
	} catch (err) {
		console.error("saveChat error:", err);
		return res.status(500).json({ error: "Failed to create chat" });
	}
};

/**
 * PUT /api/chats/:chatId
 * - params: chatId
 * - body: { title }
 * Updates chat title.
 */
export const updateChat = async (req, res) => {
	try {
		const { chatId } = req.params;
		const { title } = req.body;

		if (!title || title.trim() === "") {
			return res.status(400).json({ error: "Title is required" });
		}

		console.info("DB: updateChat", { chatId, title });
		const { rows } = await pool.query(
			`UPDATE chats SET title = $1 WHERE id = $2 RETURNING id, title, created_at`,
			[title, chatId]
		);

		if (!rows.length) {
			return res.status(404).json({ error: "Chat not found" });
		}

		return res.status(200).json(rows[0]);
	} catch (err) {
		console.error("updateChat error:", err);
		return res.status(500).json({ error: "Failed to update chat" });
	}
};

/**
 * DELETE /api/chats/:chatId
 * - params: chatId
 * Deletes a chat and its messages in a transaction.
 */
export const delChat = async (req, res) => {
	const client = await pool.connect();
	try {
		const { chatId } = req.params;
		console.info("DB: delChat start", { chatId });

		await client.query("BEGIN");

		// delete messages for chat (if messages table exists)
		await client.query(`DELETE FROM messages WHERE chat_id = $1`, [chatId]);

		// delete chat
		const { rows } = await client.query(
			`DELETE FROM chats WHERE id = $1 RETURNING id, title`,
			[chatId]
		);

		if (!rows.length) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Chat not found" });
		}

		await client.query("COMMIT");
		console.info("DB: delChat committed", { chatId });
		return res.status(200).json({ message: "Chat deleted", chat: rows[0] });
	} catch (err) {
		await client
			.query("ROLLBACK")
			.catch((e) => console.error("Rollback error:", e));
		console.error("delChat error:", err);
		return res.status(500).json({ error: "Failed to delete chat" });
	} finally {
		client.release();
	}
};

/**
 * GET /api/chats/messages/:chatId
 * - params: chatId
 * Returns all messages for a chat ordered by creation time (ascending).
 */
export const getMessages = async (req, res) => {
	try {
		const { chatId } = req.params;
		console.info("DB: getMessages", { chatId });

		const { rows } = await pool.query(
			`SELECT id, chat_id, role, content, created_at
             FROM messages
             WHERE chat_id = $1
             ORDER BY created_at ASC`,
			[chatId]
		);

		return res.status(200).json(rows);
	} catch (err) {
		console.error("getMessages error:", err);
		return res.status(500).json({ error: "Failed to fetch messages" });
	}
};

/**
 * POST /api/chats/messages/send
 * - body: { chatId, role, content }
 * Saves a message for a chat.
 */
export const saveMessage = async (req, res) => {
	try {
		const { chatId, role = "user", content, code } = req.body;

		if (!chatId || !content || content.trim() === "") {
			return res.status(400).json({ error: "chatId and content are required" });
		}

		console.info("DB: saveMessage", { chatId, role });

		let query;
		let params;

		// If assistant sent the message → include code
		if (role === "assistant") {
			query = `
				INSERT INTO messages (chat_id, role, content, code)
				VALUES ($1, $2, $3, $4)
				RETURNING id, chat_id, role, content, code, created_at
			`;
			params = [chatId, role, content, code || null];
		}
		// If normal user message → no code
		else {
			query = `
				INSERT INTO messages (chat_id, role, content)
				VALUES ($1, $2, $3)
				RETURNING id, chat_id, role, content, created_at
			`;
			params = [chatId, role, content];
		}

		const { rows } = await pool.query(query, params);
		return res.status(201).json(rows[0]);
	} catch (err) {
		console.error("saveMessage error:", err);
		return res.status(500).json({ error: "Failed to save message" });
	}
};

