import React, { useState } from "react";
import SidebarHeader from "./SidebarHeader";
import ChatHistory from "./ChatHistory";
import SidebarFooter from "./SidebarFooter";
import { useThemeStyles } from "../../hooks/useThemeStyles";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
	const themeStyles = useThemeStyles();
	const [activeChat, setActiveChat] = useState(0);

	const chatHistory = [
		{ title: "Explain quantum mechanics...", timestamp: "23:18:23", id: 0 },
		{ title: "Write a cover letter", timestamp: "20:51:13", id: 1 },
		{ title: "Summarize last quarter", timestamp: "19:24:11", id: 2 },
		{ title: "Summarize alpine summit...", timestamp: "18:33:27", id: 3 },
	];

	return (
		<div
			className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-80 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
			style={{ backgroundColor: themeStyles.sidebarBackground }}
		>
			<SidebarHeader />

			<ChatHistory
				chatHistory={chatHistory}
				activeChat={activeChat}
				setActiveChat={setActiveChat}
			/>

			{/* Sidebar Footer */}
			<SidebarFooter setSidebarOpen={setSidebarOpen} />
		</div>
	);
}

export default Sidebar;
