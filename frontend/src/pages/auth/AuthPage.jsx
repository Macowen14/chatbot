import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import authStore from "../../stores/authStore";

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();

	const onToggleMode = () => {
		setIsLogin(!isLogin);
	};

	const onSubmit = async (formData) => {
		console.log("functuion called");
		try {
			if (isLogin) {
				// Handle login
				await authStore.getState().login(formData.email, formData.password);
			} else {
				// Handle signup
				await authStore
					.getState()
					.register(
						formData.username,
						formData.email,
						formData.password,
						formData.imageurl || ""
					);
			}
			// Navigate to home page after successful submission
			navigate("/");
		} catch (error) {
			// Handle errors and provide feedback to the user
			console.error("Authentication failed:", error);
			throw error; // Re-throw the error to be caught by the AuthForm component
		}
	};

	return (
		<div>
			<AuthForm
				isLogin={isLogin}
				onToggleMode={onToggleMode}
				onSubmit={onSubmit}
			/>
		</div>
	);
};

export default AuthPage;
