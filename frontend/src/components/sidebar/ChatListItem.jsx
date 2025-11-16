import { MoreVertical } from "lucide-react";

const ChatListItem = ({ title, timestamp, isActive, theme, onClick }) => (
	<div
		onClick={onClick}
		className="px-4 py-3 cursor-pointer transition-all duration-200 hover:scale-[0.98] group"
		style={{
			backgroundColor: isActive
				? `${theme.primaryActionColor}20`
				: "transparent",
			borderLeft: isActive
				? `3px solid ${theme.primaryActionColor}`
				: "3px solid transparent",
		}}
	>
		<div className="flex items-start justify-between">
			<div className="flex-1 min-w-0">
				<p
					className="text-sm font-medium truncate"
					style={{ color: theme.textIcons }}
				>
					{title}
				</p>
				<p
					className="text-xs mt-1 opacity-60"
					style={{ color: theme.textIcons }}
				>
					{timestamp}
				</p>
			</div>
			<button
				className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
				style={{ color: theme.textIcons }}
			>
				<MoreVertical size={16} />
			</button>
		</div>
	</div>
);

export default ChatListItem