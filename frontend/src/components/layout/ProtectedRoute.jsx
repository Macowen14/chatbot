import React from "react";
import { Navigate } from "react-router-dom";
import authStore from "../../stores/authStore";

const ProtectedRoute = ({ children }) => {
	const { user } = authStore();

	if (!user) {
		// Redirect to the auth page if the user is not authenticated
		return <Navigate to="/auth" replace />;
	}

	return children;
};

export default ProtectedRoute;
