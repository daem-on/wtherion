import { createSaveManager } from "grapht/filesio";
import { DialogData, addDialog } from "grapht/modal";
import MultipleFileSelectDialog from "../../components/dialogs/MultipleFileSelectDialog.vue";
import * as pgDocument from "../../document";
import { i18n } from "../../i18n";
import { fileSystemSaves } from "./fileSystemSaves";
import { localStorageSaves } from "./localStorageSaves";

export const saveManager = createSaveManager({
	getDocumentState: () => pgDocument.documentAsJSON(),
	setDisplayName: name => document.title = name,
	untitledName: i18n.global.t("save.untitled"),
	setDocumentState: json => pgDocument.loadJSONDocument(json),
	createEmptyDocument: pgDocument.createEmptyDocument,
	providers: { localStorageSaves, fileSystemSaves },
});

export { exportTH2 } from "./fileSystemExports";

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
