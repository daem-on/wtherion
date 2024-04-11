import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [vue()],
	define: {
		__BUILD_DATE__: JSON.stringify(new Date().toISOString())
	}
});