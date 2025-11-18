import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import { useThemeStyles } from "./hooks/useThemeStyles";
import LoadingFallback from "./components/LoadingFallback";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AuthPage from "./pages/auth/AuthPage";

function App() {
	const themeStyles = useThemeStyles();

	if (!themeStyles) {
		return <LoadingFallback />;
	}

	return (
		<div
			style={{
				backgroundColor: themeStyles.primaryBackground,
				color: themeStyles.textIcons,
				minHeight: "100vh",
			}}
		>
			<Routes>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Home />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<Settings />
						</ProtectedRoute>
					}
				/>
				<Route path="/auth" element={<AuthPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Toaster
				position="top-right"
				reverseOrder={false}
				toastOptions={{
					style: {
						background: "#333",
						color: "#fff",
						borderRadius: "8px",
						padding: "16px",
						fontSize: "1rem",
					},
					success: {
						duration: 3000,
						style: {
							background: "#4BB543",
						},
					},
					error: {
						duration: 5000,
						style: {
							background: "#FF4040",
						},
					},
				}}
			/>
		</div>
	);
}

export default App;
