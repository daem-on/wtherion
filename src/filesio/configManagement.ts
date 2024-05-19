import defaultConfig from "../res/default-config.json";
import { initColors } from "../objectDefs.ts";
import versionConfig from "../../versionconfig.json";
let config: Record<string, any> = {};

export function getVersionNumber() {
	return versionConfig.appVersion;
}

export function exists(name: string) {
	return config[name] != null;
}

export function get(name: string) {
	return config[name];
}

export function set(name: string, value: any) {
	config[name] = value;
	saveConfig();
}

export function assign(values: Record<string, any>) {
	Object.assign(config, values);
	saveConfig();
}

export function loadConfig() {
	try {
		config = JSON.parse(localStorage["wt.config"]);
	} catch (e) {
		console.error("Error while reading config:", e);
		config = {};
	}
}

export function setup() {
	if (localStorage["wt.config"] === undefined) {
		config = defaultConfig;
		saveConfig();
	}
	loadConfig();

	if (localStorage["wt.colors"] != null) {
		try {
			initColors(JSON.parse(localStorage["wt.colors"]));
		} catch (e) {
			console.error("Error while reading colors:", e);
		}
	}
}

function saveConfig() {
	localStorage["wt.config"] = JSON.stringify(config);
}