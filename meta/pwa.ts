import { VitePWA } from "vite-plugin-pwa";

export const pwaPlugin = VitePWA({
	includeAssets: ["**/*.svg", "**/*.png"],
	manifest: {
		"name": "wtherion",
		"description": "A web-based Therion map editor",
		"display": "standalone",
		"start_url": "/",
		"theme_color": "#3AAB75",
		"icons": [
			{ "src": "assets/web-icons/favicon.ico", "type": "image/x-icon", "sizes": "16x16 32x32" },
			{ "src": "assets/web-icons/icon-192.png", "type": "image/png", "sizes": "192x192" },
			{ "src": "assets/web-icons/icon-512.png", "type": "image/png", "sizes": "512x512" },
			{ "src": "assets/web-icons/icon-192-maskable.png", "type": "image/png", "sizes": "192x192", "purpose": "maskable" },
			{ "src": "assets/web-icons/icon-512-maskable.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable" }
		],
		"file_handlers": [
			{
				"action": "/",
				"accept": {
					"application/json+wtherion": [".wth"]
				},
			}
		]
	}

});