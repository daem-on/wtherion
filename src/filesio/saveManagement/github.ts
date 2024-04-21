import * as pgDocument from "../../document";
import * as wtConfig from "../configManagement";
// import { Octokit } from "@octokit/rest";
import { importTH2 } from "../../import/importWrapper.ts";

const Octokit = {} as any;

const gitHubDetails = {
	path: "",
	sha: ""
};

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
		// TODO
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
		// TODO
	}
}