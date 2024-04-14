/// <reference types="wicg-file-system-access" />

import { saveAs } from "file-saver";

export const supportsFilesystem = window.showSaveFilePicker && window.showOpenFilePicker;

export const acceptTypeDefs = {
	"th2": {
		description: "Therion scraps",
		accept: {
			"application/therion": ".th2"
		}
	},
	"wth": {
		description: "wtherion projects",
		accept: {
			"application/json+wtherion": ".wth"
		}
	}
} as const;

export async function pickSaveFile(types: FilePickerAcceptType[]): Promise<FileSystemFileHandle | undefined> {
	if (supportsFilesystem) {
		try {
			return await window.showSaveFilePicker({ types });
		} catch {
			console.log("Exited without any save location set.");
			return undefined;
		}
	} else {
		alert("%save.notSupported%");
	}
}

export async function writeOrDownloadBlob(blob: Blob, handle: FileSystemFileHandle | undefined, filename: string) {
	if (supportsFilesystem && handle) {
		const writable = await handle.createWritable();
		await writable.write(blob);
		await writable.close();
	} else {
		saveAs(blob, filename);
	}
}

export async function openSingleFile(types: FilePickerAcceptType[]): Promise<[FileSystemFileHandle] | undefined> {
	if (supportsFilesystem) {
		try {
			return window.showOpenFilePicker({ types, multiple: false });
		} catch {
			console.log("Exited without any file selected.");
			return undefined;
		}
	} else {
		alert("%save.notSupported%");
	}
}
