import pgDocument from "../js/document";
import { floater } from "../js/modal";
import { asBlob } from "./export/exportTH2";
import { saveAs } from "file-saver";

let exportFileHandle: FileSystemFileHandle;
let saveFileName: string;

export function setSaveFileName(name: string) {
	saveFileName = name;
	document.title = saveFileName || "%save.untitled%";
}

export function save(clearName = false) {
	if (clearName) setSaveFileName(null);

	if (!saveFileName) {
		setSaveFileName(prompt("%save.saveFileName%"));
		if (saveFileName === null) return;
	}

	const json = pgDocument.documentAsJSON();
	localStorage.setItem("wt.saves." + saveFileName, json);
}

export function showLoadSelect() {
	jQuery("#loadWindow").remove();
	const content = jQuery(document.createElement("ul"));
	
	for (const key of Object.keys(localStorage)) {
		if (key.startsWith("wt.saves.")) {
			const entry = jQuery(`<li class="saveEntry"></li>`);
			const name = jQuery(`<a>${key.substring(9)}</a>`);
			const del = jQuery(`<a class="delete">&times</a>`);
			name.on("click", () => {loadFromStorage(key);});
			del.on("click", () => {deleteFromStorage(key);});
			del.attr("title", "%save.deleteTooltip%");
			entry.append(name, del);
			content.append(entry);
		}
	}

	floater("loadWindow", "Saved files", content, 400, 200);
}

export function showMultipleFileSelect(filenames: string[]): Promise<File[]> {
	return new Promise((resolve, reject) => {
		jQuery("#fileSelectWindow").remove();
		const content = jQuery(document.createElement("div"));
		const selectedFiles: Record<string, File> = {};

		for (const filename of filenames) {
			const label = jQuery(`<label>${filename}</label>`);
			const extension = filename.substring(filename.lastIndexOf("."));
			const fileInput: JQuery<HTMLInputElement> =
				jQuery(`<input type="file" accept="${extension}">`);
			fileInput.on("change", () => {
				const files = fileInput[0].files;
				if (files.length > 0) {
					selectedFiles[filename] = files[0];
				}
			});
			const div = jQuery(`<div></div>`);
			div.append(label, fileInput);
			content.append(div);
		}

		const ok = jQuery(`<button>%ok%</button>`);
		ok.on("click", () => {
			resolve(Object.values(selectedFiles));
			jQuery("#fileSelectWindow").remove();
		});
		content.append(ok);
		floater("fileSelectWindow", "%import.embeddedTitle%", content, 400, 200);
	});
}

function loadFromStorage(name: string) {
	jQuery("#loadWindow").remove();
	setSaveFileName(name.substring(9));
	const item = localStorage.getItem(name);
	if (item) pgDocument.loadJSONDocument(item);
}

function deleteFromStorage(name: string) {
	if (confirm(`%save.delete1% ${name.substring(9)} %save.delete2%`)) {
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
			console.log("Exited without any save location set.");
			return;
		}
	} else {
		alert("%save.notSupported%");
	}
}

export async function exportTH2(clearHandle = false) {
	if (clearHandle) exportFileHandle = null;

	if (window.showSaveFilePicker && !exportFileHandle) {
		await chooseExportLocation();
		if (!exportFileHandle) return;
	}
	
	const blob = asBlob();
	if (window.showSaveFilePicker) {
		const writable = await exportFileHandle.createWritable();
		await writable.write(blob);
		await writable.close();
	} else {
		saveAs(blob, "export.th2");
	}
}
