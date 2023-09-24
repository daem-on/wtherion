import { floater } from "../../../js/modal";
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
	jQuery("#loadWindow").remove();
	const content = jQuery(document.createElement("ul"));
	
	for (const key of Object.keys(localStorage)) {
		if (key.startsWith("wt.saves.")) {
			const entry = jQuery(`<li class="saveEntry"></li>`);
			const name = jQuery(`<a>${key.substring(9)}</a>`);
			const del = jQuery(`<a class="delete">&times</a>`);
			name.on("click", () => {callback(key);});
			del.on("click", () => {deleteFromStorage(key);});
			del.attr("title", "%save.deleteTooltip%");
			entry.append(name, del);
			content.append(entry);
		}
	}

	floater("loadWindow", "%load.title%", content, 400, 200);
}

function setSaveFileName(name: string | undefined) {
	saveFileName = name;
	setWindowTitle(name);
}

function loadFromStorage(name: string) {
	jQuery("#loadWindow").remove();
	const fileName = name.substring(9);
	setWindowTitle(fileName);
	saveFileName = fileName;
	return localStorage.getItem(name);
}

function deleteFromStorage(name: string) {
	if (confirm(`%save.delete1% ${name.substring(9)} %save.delete2%`)) {
		localStorage.removeItem(name);
		open();
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
