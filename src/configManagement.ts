// TODO: merge with settings.js
import defaultConfig from "../js/res/default-config.json";
let config: Record<string, any> = {}

export function exists(name: string) {
	return config[name] !== undefined && config[name] !== null;
}

export function get(name: string) {
	return config[name];
}

export function set(name: string, value: any) {
	config[name] = value;
	saveConfig();
}

export function loadConfig() {
	try {
		config = JSON.parse(localStorage["wt.config"]);
	} catch (e) {
		console.error("Error while reading config:", e);
		config = {}
	}
}

export function setup() {
	if (localStorage["wt.config"] === undefined) {
		config = defaultConfig;
		saveConfig();
	}
	loadConfig();
}

function saveConfig() {
	localStorage["wt.config"] = JSON.stringify(config);
}