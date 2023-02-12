import * as pgDocument from "../../document";
import { floater } from "../../../js/modal";
import { handler as localStorageSaves } from "./localStorageSaves";
import { handler as fileSystemExports } from "./fileSystemExports";
import { handler as fileSystemSaves } from "./fileSystemSaves";
import * as wtConfig from "../configManagement";

export interface SaveHandler {
	save: (saveAs: boolean, json: string) => void;
	open: () => Promise<string>;
	clearSaveFile: () => void;
}

export interface ExportHandler {
	export: (exportAs: boolean) => Promise<void>;
}

export function setWindowTitle(name: string) {
	document.title = name || "%save.untitled%";
}

function getSaveHandler() {
	const saveHandler = wtConfig.get("saveHandler");
	if (saveHandler === "fileSystem") {
		return fileSystemSaves;
	} else {
		return localStorageSaves;
	}
}

function getExportHandler() {
	return fileSystemExports;
}

export function save(saveAs = false) {
	const json = pgDocument.documentAsJSON();
	getSaveHandler().save(saveAs, json);
}

export async function open() {
	// TODO: warn if document is not empty
	const json = await getSaveHandler().open();
	if (json) {
		pgDocument.loadJSONDocument(json);
	}
}

export function clearSaveFileName() {
	getSaveHandler().clearSaveFile();
	document.title = "%save.untitled%";
}

export function exportTH2(exportAs = false) {
	getExportHandler().export(exportAs);
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
