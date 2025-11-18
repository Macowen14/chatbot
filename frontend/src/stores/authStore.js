import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { instance } from "../utils/axios";

const authStore = create(
	persist(
		(set) => ({
			user: null,
			token: null,

			login: async (email, password) => {
				try {
					const response = await instance.post("/auth/login", {
						email,
						password,
					});
					const { access_token } = response.data;
					set({ token: access_token });

					// Fetch user details after login
					const userResponse = await instance.get("/auth/me", {
						headers: { Authorization: `Bearer ${access_token}` },
					});
					set({ user: userResponse.data });
				} catch (error) {
					console.error("Login failed:", error);
					throw error;
				}
			},

			register: async (username, email, password, imageurl) => {
				try {
					console.log("register instance called");
					const response = await instance.post("/auth/register", {
						username,
						email,
						password,
						imageurl,
					});
					const { access_token } = response.data;
					set({ token: access_token });

					// Fetch user details after registration
					const userResponse = await instance.get("/auth/me", {
						headers: { Authorization: `Bearer ${access_token}` },
					});
					set({ user: userResponse.data });
				} catch (error) {
					console.error("Registration failed:", error);
					throw error;
				}
			},

			logout: () => {
				set({ user: null, token: null });
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export default authStore;
