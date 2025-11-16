import React, { useState } from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { LogOut, Settings, Palette, CheckCircle2 } from "lucide-react";
import useThemeStore from "../../store/themeStore";
import { themes } from "../../utils/themes";

function SidebarFooter({ setSidebarOpen }) {
	const { setTheme, theme } = useThemeStore();
	const themeStyles = useThemeStyles();
	const [showSettings, setShowSettings] = useState(false);

	const handleThemeChange = (themeName) => {
		setTheme(themeName);
	};

	return (
		<div
			className="p-4 border-t"
			style={{ borderColor: `${themeStyles.textIcons}20` }}
		>
			<div className="flex items-center gap-3 mb-3">
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-md"
					style={{
						backgroundColor: themeStyles.primaryActionColor,
						color: "#FFFFFF",
					}}
				>
					JD
				</div>
				<div className="flex-1">
					<p
						className="text-sm font-medium"
						style={{ color: themeStyles.textIcons }}
					>
						John Doe
					</p>
					<p
						className="text-xs opacity-60"
						style={{ color: themeStyles.textIcons }}
					>
						Online
					</p>
				</div>
			</div>

			<div className="flex gap-2">
				<button
					onClick={() => setShowSettings(!showSettings)}
					className="flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all hover:scale-[0.98]"
					style={{
						backgroundColor: showSettings 
							? themeStyles.primaryActionColor 
							: `${themeStyles.textIcons}10`,
						color: showSettings ? "#FFFFFF" : themeStyles.textIcons,
					}}
				>
					<Settings size={16} className={showSettings ? "animate-spin-slow" : ""} />
					Settings
				</button>
				<button
					onClick={() => setSidebarOpen(false)}
					className="px-3 py-2 rounded-lg transition-all hover:scale-[0.98]"
					style={{
						backgroundColor: `${themeStyles.textIcons}10`,
						color: themeStyles.textIcons,
					}}
				>
					<LogOut size={16} />
				</button>
			</div>

			{/* Enhanced Theme Selector */}
			{showSettings && (
				<div 
					className="mt-3 p-4 rounded-xl transition-all duration-300 shadow-inner"
					style={{ backgroundColor: `${themeStyles.textIcons}10` }}
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Palette size={14} style={{ color: themeStyles.primaryActionColor }} />
							<p 
								className="text-xs font-bold uppercase tracking-wider"
								style={{ color: themeStyles.textIcons }}
							>
								Theme Selector
							</p>
						</div>
						<div 
							className="w-2 h-2 rounded-full animate-pulse" 
							style={{ backgroundColor: themeStyles.primaryActionColor }} 
						/>
					</div>

					{/* Theme Options */}
					<div className="space-y-2">
						{Object.entries(themes).map(([themeName, themeColors]) => {
							const isActive = theme === themeName;
							
							return (
								<button
									key={themeName}
									onClick={() => handleThemeChange(themeName)}
									className="w-full px-3 py-3 rounded-lg text-left transition-all hover:scale-[0.98] group relative overflow-hidden"
									style={{
										backgroundColor: isActive 
											? themeStyles.primaryActionColor 
											: `${themeStyles.textIcons}15`,
										border: isActive 
											? `2px solid ${themeStyles.primaryActionColor}` 
											: '2px solid transparent',
										boxShadow: isActive ? `0 4px 12px ${themeStyles.primaryActionColor}40` : 'none',
									}}
								>
									{/* Content */}
									<div className="flex items-center justify-between relative z-10">
										<div className="flex items-center gap-2">
											{isActive && (
												<CheckCircle2 
													size={16} 
													style={{ color: '#FFFFFF' }}
													className="animate-in fade-in zoom-in duration-200"
												/>
											)}
											<span 
												className="text-xs font-semibold"
												style={{ color: isActive ? '#FFFFFF' : themeStyles.textIcons }}
											>
												{themeName}
											</span>
										</div>
										
										{/* Color Preview Circles */}
										<div className="flex gap-1">
											<div 
												className="w-4 h-4 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110" 
												style={{ 
													backgroundColor: themeColors.primaryActionColor,
													borderColor: isActive ? '#FFFFFF' : `${themeStyles.textIcons}30`
												}}
												title="Primary Action"
											/>
											<div 
												className="w-4 h-4 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110" 
												style={{ 
													backgroundColor: themeColors.aiMessageBubble,
													borderColor: isActive ? '#FFFFFF' : `${themeStyles.textIcons}30`
												}}
												title="AI Message"
											/>
											<div 
												className="w-4 h-4 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110" 
												style={{ 
													backgroundColor: themeColors.userMessageBubble,
													borderColor: isActive ? '#FFFFFF' : `${themeStyles.textIcons}30`
												}}
												title="User Message"
											/>
										</div>
									</div>

									{/* Active Shimmer Effect */}
									{isActive && (
										<div 
											className="absolute inset-0 opacity-20 animate-shimmer"
											style={{
												background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
												backgroundSize: '200% 100%',
											}}
										/>
									)}
								</button>
							);
						})}
					</div>

					{/* Footer Info */}
					<div 
						className="mt-3 pt-3 border-t flex items-center justify-center gap-2" 
						style={{ borderColor: `${themeStyles.textIcons}20` }}
					>
						<div 
							className="w-1.5 h-1.5 rounded-full animate-pulse" 
							style={{ backgroundColor: '#22c55e' }}
						/>
						<p 
							className="text-xs opacity-60 text-center" 
							style={{ color: themeStyles.textIcons }}
						>
							Theme saved automatically
						</p>
					</div>
				</div>
			)}

			{/* Add custom CSS for animations */}
			<style>{`
				@keyframes shimmer {
					0% { background-position: -200% 0; }
					100% { background-position: 200% 0; }
				}
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
				@keyframes spin-slow {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				.animate-spin-slow {
					animation: spin-slow 2s linear infinite;
				}
			`}</style>
		</div>
	);
}

export default SidebarFooter;