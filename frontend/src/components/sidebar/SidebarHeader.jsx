import React from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { Plus, Search } from "lucide-react";

function SidebarHeader() {
	const themeStyles = useThemeStyles();

	return (
		<div
			className="p-4 border-b"
			style={{ borderColor: `${themeStyles.textIcons}20` }}
		>
			<button
				className="w-full px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[0.98] shadow-lg"
				style={{
					backgroundColor: themeStyles.primaryActionColor,
					color: "#FFFFFF",
				}}
			>
				<Plus size={18} />
				New Chat
			</button>

			{/* Search Bar */}
			<div className="mt-4 relative">
				<Search
					size={18}
					className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
					style={{ color: themeStyles.textIcons }}
				/>
				<input
					type="text"
					placeholder="Search chats..."
					className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
					style={{
						backgroundColor: `${themeStyles.textIcons}10`,
						color: themeStyles.textIcons,
						border: `1px solid ${themeStyles.textIcons}20`,
					}}
				/>
			</div>
		</div>
	);
}

export default SidebarHeader;
