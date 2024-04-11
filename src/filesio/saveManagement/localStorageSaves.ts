import LoadDialog from "../../components/dialogs/LoadDialog.vue";
import { addDialog } from "../../modal";
import { SaveHandler, setWindowTitle } from "./saveManagement";

let saveFileName: string;

function save(clearName = false, json: string) {
	if (!saveFileName || clearName) {
		setSaveFileName(prompt("%save.saveFileName%"));
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

export function deleteFromStorage(name: string) {
	if (confirm(`%save.delete1% ${name.substring(9)} %save.delete2%`)) {
		localStorage.removeItem(name);
	}
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
