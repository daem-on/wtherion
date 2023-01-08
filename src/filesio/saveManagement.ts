import * as pgDocument from "../document";
import { floater } from "../../js/modal";
import { asBlob } from "../export/exportTH2";
import { saveAs } from "file-saver";
import * as wtConfig from "./configManagement";
import { Octokit } from "@octokit/rest";
import importTH2 from "../import/importTH2";
import { showCommitButton } from "../menu";

let exportFileHandle: FileSystemFileHandle;
let saveFileName: string;
const gitHubDetails = {
	path: "",
	sha: ""
};

export function setSaveFileName(name: string) {
	saveFileName = name;
	document.title = saveFileName || "%save.untitled%";
}

export function save(clearName = false) {
	if (!saveFileName || clearName) {
		setSaveFileName(prompt("%save.saveFileName%"));
		if (saveFileName == null) return;
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

	floater("loadWindow", "%load.title%", content, 400, 200);
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

function showErrorWindow(e: Error) {
	const content = jQuery(document.createElement("div"));
	content.append(jQuery(`<p>${e.message}</p>`));
	content.append(jQuery(`<pre class="scrollable">${e.stack}</pre>`));

	const report = jQuery(`<a>%error.report%</a>`);
	report.attr("href", "https://github.com/daem-on/wtherion/issues/new");
	report.attr("target", "_blank");
	content.append(report);

	floater("errorWindow", "%error.title%", content, 400, 200);
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
	
	try {
		const blob = asBlob();
		
		if (window.showSaveFilePicker) {
			const writable = await exportFileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
		} else {
			saveAs(blob, "export.th2");
		}
	} catch (e) {
		showErrorWindow(e);
	}
}

export function showGitHubLoadModal() {
	const path = prompt("%save.githubLoadPrompt%");
	if (path) { loadFromGitHub(path); }
}

function getGitHubURLDetails(path: string) {
	const url = new URL(path);
	const split = url.pathname.split("/");

	if (url.host !== "github.com" || split[3] !== "blob") {
		throw new Error("Invalid GitHub URL");
	}

	return {
		owner: split[1],
		repo: split[2],
		branch: split[4],
		filePath: split.slice(5).join("/")
	};
}

async function loadFromGitHub(path: string) {
	const url = getGitHubURLDetails(path);

	const token = wtConfig.get("githubToken");
	
	if (!token) return;

	const octokit = new Octokit({
		auth: token
	});

	const res = await octokit.repos.getContent({
		owner: url.owner,
		repo: url.repo,
		path: decodeURI(url.filePath),
		mediaType: {
			format: "application/vnd.github.VERSION.raw"
		},
		ref: url.branch,
	});

	if (res.status === 200) {
		const data = res.data as any;

		if (data.type !== "file") {
			console.error("Not a file");
			return;
		}
		const content = atob(data.content);

		if (data.name.endsWith(".json")) {
			try {
				pgDocument.loadJSONDocument(content);
			} catch (e) {
				console.error(e);
				pgDocument.clear();
			}
		} else if (data.name.endsWith(".th2")) {
			importTH2(content);
		} else return;

		gitHubDetails.sha = data.sha;
		gitHubDetails.path = path;
		showCommitButton(true);
	} else {
		console.error("Error loading file");
		return;
	}
}

export function saveAsNewFileToGitHub() {
	const path = prompt("%save.githubNewFilePrompt%");
	if (path) { 
		gitHubDetails.path = path;
		gitHubDetails.sha = null;
		saveJSONToGitHub();
	}
}

export async function saveJSONToGitHub() {
	if (!gitHubDetails.path) return;

	const token = wtConfig.get("githubToken");
	if (!token) return;

	const octokit = new Octokit({
		auth: token
	});

	const content = pgDocument.documentAsJSON();
	const url = getGitHubURLDetails(gitHubDetails.path);
	const message = prompt(
		"%save.githubCommitPrompt%",
		`%save.updateFileMessage% ${url.filePath}`
	);
	if (!message) return;

	const result = await octokit.repos.createOrUpdateFileContents({
		owner: url.owner,
		repo: url.repo,
		path: decodeURI(url.filePath),
		message: message,
		content: btoa(content),
		branch: url.branch,
		sha: gitHubDetails.sha,
		mediaType: {
			format: "application/json"
		}
	});

	if (result.status === 200) {
		gitHubDetails.sha = result.data.content.sha;
		showCommitButton(true);
	}
}