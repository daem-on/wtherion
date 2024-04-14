import LoadDialog from "../../components/dialogs/LoadDialog.vue";
import { i18n } from "../../i18n";
import { addDialog } from "../../modal";
import { SaveHandler, setWindowTitle } from "./saveManagement";

const t = i18n.global.t;

let saveFileName: string;

function save(clearName = false, json: string) {
	if (!saveFileName || clearName) {
		setSaveFileName(prompt(t("save.saveFileName")));
		if (saveFileName == null) return;
	}

	localStorage.setItem("wt.saves." + saveFileName, json);
}

function showLoadSelect(callback: (key: string) => void) {
	addDialog(LoadDialog, {
		content: {
			filenames: Object.keys(localStorage).filter(key => key.startsWith("wt.saves.")),
			callback: callback
		},
		id: "loadWindow",
		title: "load.title",
	});

	return;
}

function setSaveFileName(name: string | undefined) {
	saveFileName = name;
	setWindowTitle(name);
}

export function loadFromStorage(name: string) {
	const fileName = name.substring(9);
	setWindowTitle(fileName);
	saveFileName = fileName;
	return localStorage.getItem(name);
}

export function deleteFromStorage(name: string): boolean {
	if (confirm(t("save.deletePrompt", { filename: name.substring(9) }))) {
		localStorage.removeItem(name);
		return true;
	}
	return false;
}

export const handler: SaveHandler = {
	save,
	open: () => new Promise((resolve, reject) => {
		showLoadSelect((key) => {
			resolve(loadFromStorage(key));
		});
	}),
	clearSaveFile: () => saveFileName = undefined,
};
