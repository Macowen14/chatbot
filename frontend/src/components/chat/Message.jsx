import React from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";

function Message({ content, isUser }) {
	const themeStyles = useThemeStyles();
	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
			<div
				className="max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm"
				style={{
					backgroundColor: isUser
						? themeStyles.userMessageBubble
						: themeStyles.aiMessageBubble,
					color: themeStyles.textIcons,
					borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
				}}
			>
				<p className="text-sm leading-relaxed">{content}</p>
			</div>
		</div>
	);
}

export default Message;
