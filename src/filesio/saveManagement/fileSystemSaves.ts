import { SaveProvider } from "grapht/io";
import { openSingleFile, pickSaveFile, supportsFilesystem, writeOrDownloadBlob } from "grapht/io";
import { acceptTypeDefs } from "./fileSystemUtils";

async function saveString(content: string, handle: FileSystemFileHandle) {
	const blob = new Blob([content], {type: "application/json+wtherion"});
	await writeOrDownloadBlob(blob, handle, "save.wth");
}

export const fileSystemSaves: SaveProvider<FileSystemFileHandle, string> = {
	async createInitialSave(document) {
		const handle = await pickSaveFile([acceptTypeDefs.wth]);
		if (!handle) return null;
		await saveString(document, handle);
		return handle;
	},
	save(handle, document) {
		saveString(document, handle);
	},
	async reload(handle) {
		const file = await handle.getFile();
		return await file.text();
	},
	async open() {
		const handle = await openSingleFile([acceptTypeDefs.wth]);
		if (!handle) return null;
		const file = await handle.getFile();
		const text = await file.text();
		return [handle, text];
	},
	getDisplayName(handle) {
		return handle.name;
	},
};
