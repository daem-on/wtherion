import { SaveProvider } from "@daem-on/graphite/io";
import LoadDialog from "../../components/dialogs/LoadDialog.vue";
import { i18n } from "../../i18n";
import { addDialog } from "@daem-on/graphite/modal";

const t = i18n.global.t;

export function deleteFromStorage(name: string): boolean {
	if (confirm(t("save.deletePrompt", { filename: name.substring(9) }))) {
		localStorage.removeItem(name);
		return true;
	}
	return false;
}

function getKey(name: string): string {
	return "wt.saves." + name;
}

function listSaves(): string[] {
	return Object.keys(localStorage).filter(key => key.startsWith("wt.saves.")).map(key => key.substring(9));
}

export const localStorageSaves: SaveProvider<string, string> = {
	async createInitialSave(document) {
		const name = prompt(t("save.saveFileName"));
		if (name == null) return null;
		localStorage.setItem(getKey(name), document);
		return name;
	},
	save(state, document) {
		localStorage.setItem(getKey(state), document);
	},
	open() {
		return new Promise((resolve, reject) => {
			addDialog(LoadDialog, {
				content: {
					filenames: listSaves(),
					callback: key => resolve([
						key,
						localStorage.getItem(getKey(key))
					])
				},
				id: "loadWindow",
				title: "load.title",
			});
		});
	},
	getDisplayName(state) {
		return state;
	},
	async reload(state) {
		return localStorage.getItem(getKey(state));
	},
};
