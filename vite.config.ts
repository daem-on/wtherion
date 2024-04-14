import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { pwaPlugin } from "./meta/pwa";

export default defineConfig({
	plugins: [
		vue(),
		pwaPlugin,
	],
	define: {
		__BUILD_DATE__: JSON.stringify(new Date().toISOString())
	},
	resolve: {
		alias: {
			"paper": "paper/dist/paper-core"
		}
	}
});