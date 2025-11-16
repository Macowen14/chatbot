import React, { useState } from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { LogOut, Settings } from "lucide-react";
import useThemeStore from "../../store/themeStore";
import { themes } from "../../utils/themes";

function SidebarFooter({ setSidebarOpen }) {
	const { setTheme, theme } = useThemeStore();
	const themeStyles = useThemeStyles();
	const [showSettings, setShowSettings] = useState(false);
	const [previewTheme, setPreviewTheme] = useState(null);

	const handleThemeChange = (themeName) => {
		setTheme(themeName);
		setShowSettings(false);
	};

	const handlePreviewTheme = (themeName) => {
		setPreviewTheme(themeName);
	};

	return (
		<div
			className="p-4 border-t"
			style={{ borderColor: `${themeStyles.textIcons}20` }}
		>
			<div className="flex items-center gap-3 mb-3">
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
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
					className="flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all hover:bg-gray-700 hover:text-white"
					style={{
						backgroundColor: `${themeStyles.textIcons}10`,
						color: themeStyles.textIcons,
					}}
				>
					<Settings size={16} />
					Settings
				</button>
				<button
					onClick={() => setSidebarOpen(false)}
					className="px-3 py-2 rounded-lg transition-all hover:bg-gray-700 hover:text-white"
					style={{
						backgroundColor: `${themeStyles.textIcons}10`,
						color: themeStyles.textIcons,
					}}
				>
					<LogOut size={16} />
				</button>
			</div>

			{/* Theme Selector */}
			{showSettings && (
				<div className="mt-3 p-3 rounded-lg bg-gray-700">
					<p
						className="text-xs font-semibold mb-2 opacity-60"
						style={{ color: themeStyles.textIcons }}
					>
						Theme
					</p>
					<div className="grid grid-cols-2 gap-2">
						{Object.keys(themes).map((themeName) => (
							<button
								key={themeName}
								onClick={() => handlePreviewTheme(themeName)}
								className="px-3 py-2 rounded text-xs font-medium transition-all"
								style={{
									backgroundColor:
										previewTheme === themeName || theme === themeName
											? themeStyles.primaryActionColor
											: `${themeStyles.textIcons}20`,
									color:
										previewTheme === themeName || theme === themeName
											? "#FFFFFF"
											: themeStyles.textIcons,
								}}
							>
								{themeName}
							</button>
						))}
					</div>
					<button
						onClick={() => handleThemeChange(previewTheme || theme)}
						className="w-full px-3 py-2 mt-2 rounded text-xs font-medium transition-all bg-gray-800 hover:bg-gray-700"
						style={{ color: themeStyles.textIcons }}
					>
						Apply Theme
					</button>
				</div>
			)}
		</div>
	);
}

export default SidebarFooter;
