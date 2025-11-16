
import express from 'express'
import { sendChat } from "../controller/assistant.controller.js";

const router = express.Router()

router.post("/send", sendChat);


export default router
