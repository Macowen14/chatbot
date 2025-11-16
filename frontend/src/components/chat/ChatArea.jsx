import React, { useState } from "react";
import { MessageCircle, Send, Menu ,Download, Share2} from "lucide-react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import Message from "./Message";
import ChatHeader from "./ChatHeader";
import Input from "./Input";

const messages = [
	{
		content:
			"Quantum mechanics is a fundamental theory in physics that describes nature at atomic and subatomic scales.",
		isUser: false,
	},
	{
		content: "Can you explain quantum mechanics in simple terms?",
		isUser: true,
	},
	{
		content:
			"Of course! Think of quantum mechanics as the rulebook for how tiny particles behave. Unlike everyday objects, particles can exist in multiple states at once until observed.",
		isUser: false,
	},
];

function ChatArea({ sidebarOpen, setSidebarOpen }) {
	const [message, setMessage] = useState("");
	const themeStyles = useThemeStyles();

	const handleSendMessage = () => {
		if (message.trim()) {
			// Handle message send
			setMessage("");
		}
	};

	return (
		<div className="flex-1 flex flex-col">
			{/* Chat Header */}
			<ChatHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen}/>

			{/* Messages Area */}
			<div
				className="flex-1 overflow-y-auto p-4 md:p-6"
				style={{ backgroundColor: themeStyles.mainChatAreaBackground }}
			>
				<div className="max-w-4xl mx-auto">
					{messages.map((msg, idx) => (
						<Message
							key={idx}
							content={msg.content}
							isUser={msg.isUser}
							theme={themeStyles}
						/>
					))}
				</div>
			</div>

			{/* Input Area */}
			<Input message={message} setMessage={setMessage} handleSendMessage={handleSendMessage}/>
		</div>
	);
}

export default ChatArea;
