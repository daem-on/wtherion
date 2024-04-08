import { showErrorWindow } from "../../errorHandling";
import { acceptTypeDefs, pickSaveFile, supportsFilesystem, writeOrDownloadBlob } from "./fileSystemUtils";
import { ExportHandler } from "./saveManagement";

let exportFileHandle: FileSystemFileHandle;

async function exportTH2(clearHandle = false) {
	const { asBlob } = await import("../../export/exportTH2");
	
	if (clearHandle) exportFileHandle = null;

	if (supportsFilesystem && !exportFileHandle) {
		exportFileHandle = await pickSaveFile([acceptTypeDefs.th2]);
		if (!exportFileHandle) return;
	}
	
	try {
		const blob = asBlob();
		await writeOrDownloadBlob(blob, exportFileHandle, "export.th2");
	} catch (e) {
		showErrorWindow(e);
	}
}

export const handler: ExportHandler = {
	export: exportTH2,
};
