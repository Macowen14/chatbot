import React from "react";
import ChatListItem from "./ChatListItem";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import PropTypes from "prop-types";

function ChatHistory({ chatHistory, activeChat, setActiveChat }) {
	const themeStyles = useThemeStyles();

	// Ensure chatHistory is an array
	const historyArray = Array.isArray(chatHistory) ? chatHistory : [];

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="p-4">
				<h3
					className="text-xs font-semibold mb-3 opacity-60 uppercase tracking-wider"
					style={{ color: themeStyles.textIcons }}
				>
					Chat History
				</h3>
			</div>
			{historyArray.map((chat) => (
				<ChatListItem
					key={chat.id}
					title={chat.title}
					timestamp={chat.timestamp}
					isActive={activeChat === chat.id}
					theme={themeStyles}
					onClick={() => setActiveChat(chat.id)}
				/>
			))}
		</div>
	);
}

export default ChatHistory;

ChatHistory.propTypes = {
	chatHistory: PropTypes.array.isRequired,
	activeChat: PropTypes.number.isRequired,
	setActiveChat: PropTypes.func.isRequired,
};

ChatHistory.defaultProps = {
	chatHistory: [],
};
