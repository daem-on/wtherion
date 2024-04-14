import * as pgDocument from "../../document";
import { DialogData, addDialog } from "../../modal";
import { handler as localStorageSaves } from "./localStorageSaves";
import { handler as fileSystemExports } from "./fileSystemExports";
import { handler as fileSystemSaves } from "./fileSystemSaves";
import * as wtConfig from "../configManagement";
import MultipleFileSelectDialog from "../../components/dialogs/MultipleFileSelectDialog.vue";
import { i18n } from "../../i18n";

export interface SaveHandler {
	save: (saveAs: boolean, json: string) => void;
	open: () => Promise<string>;
	clearSaveFile: () => void;
}

export interface ExportHandler {
	export: (exportAs: boolean) => Promise<void>;
}

export function setWindowTitle(name: string) {
	document.title = name || i18n.global.t("save.untitled");
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
	document.title = i18n.global.t("save.untitled");
}

export function exportTH2(exportAs = false) {
	getExportHandler().export(exportAs);
}

export type MultipleFileSelectDialogData = DialogData<{
	filenames: string[];
	callback: (files: Map<string, File>) => void;
}>;

export function showMultipleFileSelect(filenames: string[]): Promise<Map<string, File>> {
	return new Promise((resolve, reject) => {

		addDialog(MultipleFileSelectDialog, {
			content: {
				filenames,
				callback: files => resolve(files),
			},
			id: "multipleFileSelectDialog",
			title: "import.embeddedTitle",
		});
	});
}
