import useThemeStore from "../stores/themeStore";
import { themes } from "../utils/themes";

export const useThemeStyles = () => {
	const { theme } = useThemeStore();

	if (!theme) {
		console.error("Theme is undefined or not set correctly.");
		return null;
	}
	const themeStyles = themes[theme];

	if (!themeStyles) {
		console.error("Theme styles are undefined. Check the themes object.");
		return null;
	}
	return themeStyles;
};
