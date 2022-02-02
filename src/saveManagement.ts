import pgDocument from "../js/document";
import { floater } from "../js/modal";
import { asBlob } from "./export/exportTH2";
import { saveAs } from "file-saver";

let exportFileHandle: FileSystemFileHandle;
let saveFileName: string;

export function setSaveFileName(name: string) {
	saveFileName = name;
	document.title = saveFileName || "Empty document";
}

export function save(clearName = false) {
	if (clearName) setSaveFileName(null);

	if (!saveFileName) {
		setSaveFileName(prompt("Save file name"));
		if (saveFileName === null) return;
	}

	let json = pgDocument.documentAsJSON();
	localStorage.setItem("wt.saves." + saveFileName, json);
}

export function showLoadSelect() {
	jQuery("#loadWindow").remove();
	let content = jQuery(document.createElement("ul"));
	
	for (let key of Object.keys(localStorage)) {
		if (key.startsWith("wt.saves.")) {
			let entry = jQuery(`<li class="saveEntry"></li>`)
			let name = jQuery(`<a>${key.substring(9)}</a>`);
			let del = jQuery(`<a class="delete">&times</a>`);
			name.on("click", () => {loadFromStorage(key)});
			del.on("click", () => {deleteFromStorage(key)});
			del.attr("title", "Delete save file");
			entry.append(name, del);
			content.append(entry);
		}
	}

	floater("loadWindow", "Saved files", content, 400, 200);
}

function loadFromStorage(name: string) {
	jQuery("#loadWindow").remove();
	setSaveFileName(name.substring(9));
	const item = localStorage.getItem(name);
	if (item) pgDocument.loadJSONDocument(item);
}

function deleteFromStorage(name: string) {
	if (confirm(`Delete ${name.substring(9)} permanently?`)) {
		localStorage.removeItem(name);
		showLoadSelect();
	}
}

async function chooseExportLocation() {
	if (window.showSaveFilePicker) {
		try {
			exportFileHandle = await window.showSaveFilePicker({
				types: [
					{description: "Therion scraps", accept: {
						"application/therion": ".th2"
					}}
				]
			});
		} catch {
			console.log("Exited without any save location set.")
			return
		}
	} else {
		alert("This feature is not supported by browsers except Chrome.")
	}
}

export async function exportTH2(clearHandle = false) {
	if (clearHandle) exportFileHandle = null;

	if (window.showSaveFilePicker && !exportFileHandle) {
		await chooseExportLocation();
		if (!exportFileHandle) return;
	}
	
	let blob = asBlob();
	if (window.showSaveFilePicker) {
		const writable = await exportFileHandle.createWritable();
		await writable.write(blob);
		await writable.close();
	} else {
		saveAs(blob, "export.th2");
	}
}
