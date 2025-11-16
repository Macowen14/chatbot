import pool from "../config/db.js";
import { Ollama } from "ollama";

const ollama = new Ollama({
	host: "http://localhost:11434",
});

export const sendChat = async (req, res) => {
	const { chat_id, message, model } = req.body;

	if (!message || !chat_id)
		return res.status(400).json({ error: "message and chat_id required" });

	// 1. Save user message
	await pool.query(
		`INSERT INTO messages (chat_id, role, content, code) VALUES ($1, $2, $3, NULL)`,
		[chat_id, "user", message]
	);

	// 2. Send to Ollama with a prompt to explain the task
	const prompt = `You are a helpful assistant. Your task is to generate a response to the user's message in a clear and concise manner. If the response includes code, ensure it is formatted correctly and saved in a 'code' column. Here is the user's message: "${message}"`;

	// Set up SSE response
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	try {
		const streamResponse = await ollama.chat({
			model: model || "gemma3:4b",
			messages: [{ role: "user", content: prompt }],
			stream: true,
		});

		// Check if the response is a readable stream
		if (streamResponse.readable) {
			streamResponse.on("data", (data) => {
				const aiReply = JSON.parse(data).message.content;
				res.write(`data: ${JSON.stringify({ content: aiReply })}\n\n`);
			});

			streamResponse.on("end", () => {
				res.end();
			});

			streamResponse.on("error", (error) => {
				console.error("Error streaming response:", error);
				res.end();
			});
		} else {
			// Handle the response if it is not a stream
			const aiReply = streamResponse.message.content;
			res.write(`data: ${JSON.stringify({ content: aiReply })}\n\n`);
			res.end();
		}
	} catch (error) {
		console.error("Error processing chat request:", error);
		res.end();
	}
};
