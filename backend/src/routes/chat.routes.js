import express from "express";
// Controller functions that implement the route behavior:
// - saveChat:   create a new chat
// - getChats:   list chats (optionally with filters/pagination in controller)
// - updateChat: update metadata for a chat (title, etc.)
// - delChat:    delete a chat by id
// - getMessages: return messages for a given chat
// - saveMessage: persist/send a new message for a chat
import {
	delChat,
	getChats,
	getMessages,
	saveChat,
	saveMessage,
	updateChat,
} from "../controller/chat.controller.js";

const router = express.Router();

// POST /api/chats/
// Create and save a new chat. Expects chat data in req.body.
router.post("/", saveChat);

// GET /api/chats/
// Retrieve a list of chats. Query params (if used) are handled in controller.
router.get("/", getChats);

// PUT /api/chats/:chatId
// Update an existing chat identified by chatId (from req.params).
// Expects update fields in req.body.
router.put("/:chatId", updateChat);

// DELETE /api/chats/:chatId
// Delete a chat by ID. chatId comes from req.params.
router.delete("/:chatId", delChat);

// GET /api/chats/messages/:chatId
// Get all messages for the specified chatId.
router.get("/messages/:chatId", getMessages);

// POST /api/chats/messages/send
// Save/send a message. Expects message payload in req.body (chatId, content, sender, etc.).
router.post("/messages/send", saveMessage);

export default router;
