// themeStore.js (Revised with persistence middleware)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useThemeStore = create(
	persist(
		// 👈 Wrap your state creator with persist
		(set) => ({
			theme: "Deep Space",
			setTheme: (newTheme) => {
				set({ theme: newTheme });
			},
		}),
		{
			name: "theme-storage", // required: unique name for the item in localStorage
			storage: createJSONStorage(() => localStorage), // required: specify storage type
		}
	)
);

export default useThemeStore;
