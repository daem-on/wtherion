import { acceptTypeDefs, openSingleFile, pickSaveFile, supportsFilesystem, writeOrDownloadBlob } from "./fileSystemUtils";
import { SaveHandler, setWindowTitle } from "./saveManagement";

let saveFileHandle: FileSystemFileHandle;

async function save(clearHandle : boolean, json: string) {
	if (clearHandle) saveFileHandle = null;

	if (supportsFilesystem && !saveFileHandle) {
		saveFileHandle = await pickSaveFile([acceptTypeDefs.wth]);
		if (!saveFileHandle) return;
	}

	setWindowTitle(saveFileHandle.name);

	const blob = new Blob([json], {type: "application/json+wtherion"});
	await writeOrDownloadBlob(blob, saveFileHandle, "save.wth");
}

async function open(): Promise<string> {
	if (supportsFilesystem) {
		const handle = (await openSingleFile([acceptTypeDefs.wth]))[0];
		if (!handle) return null;
		const file = await handle.getFile();
		const text = await file.text();
		saveFileHandle = handle;
		setWindowTitle(saveFileHandle.name);
		return text;
	} else {
		// TODO: Implement file picker for non-filesystem browsers
	}
}

export const handler: SaveHandler = {
	save,
	open,
	clearSaveFile: () => saveFileHandle = null,
};
