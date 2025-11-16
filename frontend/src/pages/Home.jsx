import React, { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import { useThemeStyles } from "../hooks/useThemeStyles";

export default function ChatbotUI() {
	const themeStyles = useThemeStyles();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div
			className="flex h-screen overflow-hidden"
			style={{ backgroundColor: themeStyles.primaryBackground }}
		>
			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-transparent bg-opacity-50 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}

			{/* Sidebar */}
			<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			{/* Main Chat Area */}
			<ChatArea sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
		</div>
	);
}
