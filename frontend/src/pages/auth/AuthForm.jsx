import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { useNavigate } from "react-router-dom";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
	const themeStyles = useThemeStyles();

	return (
		<div
			style={{
				position: "fixed",
				top: "20px",
				right: "20px",
				padding: "16px 24px",
				borderRadius: "8px",
				backgroundColor:
					type === "error" ? "#E94560" : themeStyles?.primaryActionColor,
				color: "#FFFFFF",
				boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
				zIndex: 1000,
				animation: "slideIn 0.3s ease-out",
			}}
		>
			{message}
		</div>
	);
};

const AuthForm = ({ isLogin = true, onToggleMode, onSubmit }) => {
	const themeStyles = useThemeStyles();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [toast, setToast] = useState(null);

	// Early return check AFTER all hooks
	if (!themeStyles) {
		return (
			<div style={{ padding: "20px", color: "#E94560" }}>
				Error: Theme not loaded. Please refresh the page.
			</div>
		);
	}

	const showToast = (message, type = "success") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validation
		if (!email || !password || (!isLogin && !username)) {
			showToast("Please fill in all fields", "error");
			return;
		}

		if (!email.includes("@")) {
			showToast("Please enter a valid email address", "error");
			return;
		}

		if (password.length < 6) {
			showToast("Password must be at least 6 characters", "error");
			return;
		}

		setIsLoading(true);

		try {
			const formData = isLogin
				? { email, password }
				: { email, password, username };

			await onSubmit(formData);
			showToast(
				isLogin ? "Login successful!" : "Account created successfully!",
				"success"
			);
		} catch (error) {
			showToast(error.message || "An error occurred", "error");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: themeStyles.primaryBackground,
				padding: "20px",
			}}
		>
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			<div
				style={{
					width: "100%",
					maxWidth: "440px",
					backgroundColor: themeStyles.sidebarBackground,
					borderRadius: "16px",
					padding: "48px 40px",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
				}}
			>
				<div style={{ textAlign: "center", marginBottom: "32px" }}>
					<div
						style={{
							width: "64px",
							height: "64px",
							margin: "0 auto 16px",
							backgroundColor: themeStyles.primaryActionColor,
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{isLogin ? (
							<LogIn size={32} color="#FFFFFF" />
						) : (
							<UserPlus size={32} color="#FFFFFF" />
						)}
					</div>
					<h1
						style={{
							fontSize: "28px",
							fontWeight: "700",
							color: themeStyles.textIcons,
							marginBottom: "8px",
						}}
					>
						{isLogin ? "Welcome Back" : "Create Account"}
					</h1>
					<p
						style={{
							color: themeStyles.textIcons,
							opacity: 0.7,
							fontSize: "14px",
						}}
					>
						{isLogin ? "Sign in to continue" : "Sign up to get started"}
					</p>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					{!isLogin && (
						<div>
							<label
								htmlFor="username"
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: "500",
									color: themeStyles.textIcons,
								}}
							>
								Username
							</label>
							<div style={{ position: "relative" }}>
								<User
									size={20}
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: themeStyles.textIcons,
										opacity: 0.5,
									}}
								/>
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter your username"
									style={{
										width: "100%",
										padding: "12px 12px 12px 44px",
										backgroundColor: themeStyles.mainChatAreaBackground,
										border: `2px solid transparent`,
										borderRadius: "8px",
										fontSize: "15px",
										color: themeStyles.textIcons,
										outline: "none",
										transition: "border-color 0.2s",
									}}
									onFocus={(e) =>
										(e.target.style.borderColor =
											themeStyles.primaryActionColor)
									}
									onBlur={(e) => (e.target.style.borderColor = "transparent")}
								/>
							</div>
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
								color: themeStyles.textIcons,
							}}
						>
							Email
						</label>
						<div style={{ position: "relative" }}>
							<Mail
								size={20}
								style={{
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									color: themeStyles.textIcons,
									opacity: 0.5,
								}}
							/>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								style={{
									width: "100%",
									padding: "12px 12px 12px 44px",
									backgroundColor: themeStyles.mainChatAreaBackground,
									border: `2px solid transparent`,
									borderRadius: "8px",
									fontSize: "15px",
									color: themeStyles.textIcons,
									outline: "none",
									transition: "border-color 0.2s",
								}}
								onFocus={(e) =>
									(e.target.style.borderColor = themeStyles.primaryActionColor)
								}
								onBlur={(e) => (e.target.style.borderColor = "transparent")}
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="password"
							style={{
								display: "block",
								marginBottom: "8px",
								fontSize: "14px",
								fontWeight: "500",
								color: themeStyles.textIcons,
							}}
						>
							Password
						</label>
						<div style={{ position: "relative" }}>
							<Lock
								size={20}
								style={{
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									color: themeStyles.textIcons,
									opacity: 0.5,
								}}
							/>
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								style={{
									width: "100%",
									padding: "12px 44px 12px 44px",
									backgroundColor: themeStyles.mainChatAreaBackground,
									border: `2px solid transparent`,
									borderRadius: "8px",
									fontSize: "15px",
									color: themeStyles.textIcons,
									outline: "none",
									transition: "border-color 0.2s",
								}}
								onFocus={(e) =>
									(e.target.style.borderColor = themeStyles.primaryActionColor)
								}
								onBlur={(e) => (e.target.style.borderColor = "transparent")}
								onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								style={{
									position: "absolute",
									right: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									background: "none",
									border: "none",
									cursor: "pointer",
									padding: "4px",
									display: "flex",
									alignItems: "center",
									color: themeStyles.textIcons,
									opacity: 0.5,
								}}
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<button
						onClick={handleSubmit}
						disabled={isLoading}
						style={{
							width: "100%",
							padding: "14px",
							backgroundColor: themeStyles.primaryActionColor,
							color: "#FFFFFF",
							border: "none",
							borderRadius: "8px",
							fontSize: "16px",
							fontWeight: "600",
							cursor: isLoading ? "not-allowed" : "pointer",
							opacity: isLoading ? 0.7 : 1,
							transition: "opacity 0.2s",
							marginTop: "8px",
						}}
					>
						{isLoading
							? "Processing..."
							: isLogin
							? "Sign In"
							: "Create Account"}
					</button>
				</div>

				<div
					style={{
						marginTop: "24px",
						textAlign: "center",
						fontSize: "14px",
						color: themeStyles.textIcons,
						opacity: 0.8,
					}}
				>
					{isLogin ? "Don't have an account? " : "Already have an account? "}
					<button
						onClick={onToggleMode}
						style={{
							background: "none",
							border: "none",
							color: themeStyles.primaryActionColor,
							fontWeight: "600",
							cursor: "pointer",
							textDecoration: "underline",
							padding: 0,
						}}
					>
						{isLogin ? "Sign up" : "Sign in"}
					</button>
				</div>
			</div>

			<style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
		</div>
	);
};

export default AuthForm;
