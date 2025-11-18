import React from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { Loader2, MessageSquare, History, LogIn, UserPlus } from "lucide-react";

/**
 * Reusable Loader Component
 *
 * @param {string} variant - Type of loader: 'spinner' | 'dots' | 'pulse' | 'skeleton'
 * @param {string} size - Size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - Full screen overlay
 * @param {string} context - Context for appropriate icon: 'chat' | 'history' | 'login' | 'signup' | 'general'
 */
function Loader({
	variant = "spinner",
	size = "md",
	text = "",
	fullScreen = false,
	context = "general",
}) {
	const themeStyles = useThemeStyles();

	// Size mappings
	const sizeMap = {
		sm: { spinner: 20, dot: 6, icon: 16 },
		md: { spinner: 32, dot: 8, icon: 24 },
		lg: { spinner: 48, dot: 10, icon: 32 },
		xl: { spinner: 64, dot: 12, icon: 40 },
	};

	const currentSize = sizeMap[size] || sizeMap.md;

	// Context icons
	const contextIcons = {
		chat: MessageSquare,
		history: History,
		login: LogIn,
		signup: UserPlus,
		general: Loader2,
	};

	const ContextIcon = contextIcons[context] || Loader2;

	// Spinner Loader
	const SpinnerLoader = () => (
		<div className="flex flex-col items-center justify-center gap-3">
			<Loader2
				size={currentSize.spinner}
				className="animate-spin"
				style={{ color: themeStyles.primaryActionColor }}
			/>
			{text && (
				<p
					className="text-sm font-medium animate-pulse"
					style={{ color: themeStyles.textIcons }}
				>
					{text}
				</p>
			)}
		</div>
	);

	// Dots Loader
	const DotsLoader = () => (
		<div className="flex flex-col items-center justify-center gap-3">
			<div className="flex gap-2">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="rounded-full animate-bounce"
						style={{
							width: currentSize.dot,
							height: currentSize.dot,
							backgroundColor: themeStyles.primaryActionColor,
							animationDelay: `${i * 0.15}s`,
						}}
					/>
				))}
			</div>
			{text && (
				<p
					className="text-sm font-medium"
					style={{ color: themeStyles.textIcons }}
				>
					{text}
				</p>
			)}
		</div>
	);

	// Pulse Loader
	const PulseLoader = () => (
		<div className="flex flex-col items-center justify-center gap-3">
			<div
				className="rounded-full flex items-center justify-center animate-pulse-ring"
				style={{
					width: currentSize.spinner,
					height: currentSize.spinner,
					backgroundColor: `${themeStyles.primaryActionColor}20`,
				}}
			>
				<ContextIcon
					size={currentSize.icon}
					style={{ color: themeStyles.primaryActionColor }}
				/>
			</div>
			{text && (
				<p
					className="text-sm font-medium animate-pulse"
					style={{ color: themeStyles.textIcons }}
				>
					{text}
				</p>
			)}
		</div>
	);

	// Skeleton Loader (for chat/history lists)
	const SkeletonLoader = () => (
		<div className="w-full space-y-3">
			{[...Array(3)].map((_, i) => (
				<div
					key={i}
					className="animate-pulse"
					style={{ animationDelay: `${i * 0.1}s` }}
				>
					<div
						className="flex items-start gap-3 p-3 rounded-lg"
						style={{ backgroundColor: `${themeStyles.textIcons}05` }}
					>
						{/* Avatar skeleton */}
						<div
							className="rounded-full flex-shrink-0"
							style={{
								width: 40,
								height: 40,
								backgroundColor: `${themeStyles.textIcons}15`,
							}}
						/>
						{/* Content skeleton */}
						<div className="flex-1 space-y-2">
							<div
								className="h-4 rounded"
								style={{
									width: "60%",
									backgroundColor: `${themeStyles.textIcons}15`,
								}}
							/>
							<div
								className="h-3 rounded"
								style={{
									width: "40%",
									backgroundColor: `${themeStyles.textIcons}10`,
								}}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);

	// Message Skeleton (for chat messages)
	const MessageSkeletonLoader = () => (
		<div className="w-full space-y-4">
			{[...Array(3)].map((_, i) => {
				const isUser = i % 2 === 0;
				return (
					<div
						key={i}
						className={`flex ${
							isUser ? "justify-end" : "justify-start"
						} animate-pulse`}
						style={{ animationDelay: `${i * 0.15}s` }}
					>
						<div
							className="max-w-[70%] px-4 py-3 rounded-2xl space-y-2"
							style={{
								backgroundColor: isUser
									? `${themeStyles.userMessageBubble}30`
									: `${themeStyles.aiMessageBubble}50`,
							}}
						>
							<div
								className="h-3 rounded"
								style={{
									width: "100%",
									backgroundColor: `${themeStyles.textIcons}20`,
								}}
							/>
							<div
								className="h-3 rounded"
								style={{
									width: "75%",
									backgroundColor: `${themeStyles.textIcons}15`,
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);

	// Select loader variant
	const renderLoader = () => {
		switch (variant) {
			case "dots":
				return <DotsLoader />;
			case "pulse":
				return <PulseLoader />;
			case "skeleton":
				return <SkeletonLoader />;
			case "message-skeleton":
				return <MessageSkeletonLoader />;
			case "spinner":
			default:
				return <SpinnerLoader />;
		}
	};

	// Wrapper for full screen
	if (fullScreen) {
		return (
			<div
				className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
				style={{
					backgroundColor: `${themeStyles.primaryBackground}95`,
				}}
			>
				{renderLoader()}
			</div>
		);
	}

	// Regular inline loader
	return (
		<div className="flex items-center justify-center w-full py-8">
			{renderLoader()}
		</div>
	);
}

export default Loader;

// ========================================
// USAGE EXAMPLES
// ========================================

/**
 * Example 1: Chat History Loading
 *
 * import Loader from './components/Loader';
 *
 * function ChatHistory() {
 *   const [loading, setLoading] = useState(true);
 *
 *   if (loading) {
 *     return <Loader variant="skeleton" context="history" />;
 *   }
 *
 *   return <div>Chat history content...</div>;
 * }
 */

/**
 * Example 2: Messages Loading
 *
 * function Messages() {
 *   const [loading, setLoading] = useState(true);
 *
 *   if (loading) {
 *     return <Loader variant="message-skeleton" context="chat" />;
 *   }
 *
 *   return <div>Messages...</div>;
 * }
 */

/**
 * Example 3: Login/Signup Loading
 *
 * function Login() {
 *   const [loading, setLoading] = useState(false);
 *
 *   if (loading) {
 *     return <Loader
 *       variant="pulse"
 *       size="lg"
 *       text="Signing in..."
 *       context="login"
 *       fullScreen
 *     />;
 *   }
 *
 *   return <LoginForm />;
 * }
 */

/**
 * Example 4: Inline Spinner
 *
 * function DataFetch() {
 *   return (
 *     <div>
 *       <Loader
 *         variant="spinner"
 *         size="sm"
 *         text="Loading data..."
 *       />
 *     </div>
 *   );
 * }
 */

/**
 * Example 5: Dots Loader
 *
 * <Loader
 *   variant="dots"
 *   size="md"
 *   text="Processing..."
 *   context="general"
 * />
 */
