import React from 'react'
import { MessageCircle,  Menu ,Download, Share2} from "lucide-react";
import { useThemeStyles } from '../../hooks/useThemeStyles'

function ChatHeader({sidebarOpen,setSidebarOpen}) {
    const themeStyles = useThemeStyles()
  return (
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
  )
}

export default ChatHeader