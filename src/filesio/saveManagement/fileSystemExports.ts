import { showErrorWindow } from "../../errorHandling";
import { asBlob } from "../../export/runner";
import { acceptTypeDefs, pickSaveFile, supportsFilesystem, writeOrDownloadBlob } from "./fileSystemUtils";

let exportFileHandle: FileSystemFileHandle;

export async function exportTH2(clearHandle = false) {	
	if (clearHandle) exportFileHandle = null;

	if (supportsFilesystem && !exportFileHandle) {
		exportFileHandle = await pickSaveFile([acceptTypeDefs.th2]);
		if (!exportFileHandle) return;
	}
	
	try {
		const blob = await asBlob();
		await writeOrDownloadBlob(blob, exportFileHandle, "export.th2");
	} catch (e) {
		showErrorWindow(e);
	}
}
