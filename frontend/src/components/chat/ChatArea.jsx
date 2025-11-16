import React, { useState } from "react";
import { MessageCircle, Send, Menu ,Download, Share2} from "lucide-react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import Message from "./Message";

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
			<div
				className="px-4 py-4 flex items-center justify-between border-b shadow-sm"
				style={{
					backgroundColor: themeStyles.mainChatAreaBackground,
					borderColor: `${themeStyles.textIcons}20`,
				}}
			>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="lg:hidden p-2 rounded-lg hover:scale-95 transition-all"
						style={{
							color: themeStyles.textIcons,
							backgroundColor: `${themeStyles.textIcons}10`,
						}}
					>
						<Menu size={20} />
					</button>
					<div className="flex items-center gap-2">
						<MessageCircle
							size={20}
							style={{ color: themeStyles.primaryActionColor }}
						/>
						<h1
							className="text-lg font-semibold"
							style={{ color: themeStyles.textIcons }}
						>
							Quantum Mechanics Basics
						</h1>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						className="p-2 rounded-lg hover:scale-95 transition-all hidden md:block"
						style={{
							color: themeStyles.textIcons,
							backgroundColor: `${themeStyles.textIcons}10`,
						}}
					>
						<Download size={18} />
					</button>
					<button
						className="p-2 rounded-lg hover:scale-95 transition-all hidden md:block"
						style={{
							color: themeStyles.textIcons,
							backgroundColor: `${themeStyles.textIcons}10`,
						}}
					>
						<Share2 size={18} />
					</button>
				</div>
			</div>

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
			<div
				className="p-4 border-t"
				style={{
					backgroundColor: themeStyles.mainChatAreaBackground,
					borderColor: `${themeStyles.textIcons}20`,
				}}
			>
				<div className="max-w-4xl mx-auto">
					<div className="flex gap-2 items-end">
						<div
							className="flex-1 rounded-2xl px-4 py-3 flex items-center gap-2"
							style={{ backgroundColor: `${themeStyles.textIcons}10` }}
						>
							<input
								type="text"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
								placeholder="Type your message..."
								className="flex-1 bg-transparent outline-none text-sm"
								style={{ color: themeStyles.textIcons }}
							/>
						</div>
						<button
							onClick={handleSendMessage}
							disabled={!message.trim()}
							className="p-3 rounded-xl transition-all hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
							style={{
								backgroundColor: themeStyles.primaryActionColor,
								color: "#FFFFFF",
							}}
						>
							<Send size={20} />
						</button>
					</div>
					<p
						className="text-xs mt-2 text-center opacity-60"
						style={{ color: themeStyles.textIcons }}
					>
						Model: Gemini 2.5 Pro | Tokens: 125
					</p>
				</div>
			</div>
		</div>
	);
}

export default ChatArea;
