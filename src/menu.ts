// function related to the main menu

import { ref } from "vue";
import AboutDialog from "./components/dialogs/AboutDialog.vue";
import KeybindEditorDialog from "./components/dialogs/KeybindEditorDialog.vue";
import * as configEditor from "./configEditor";
import * as pgDocument from "./document";
import * as exporter from "./export";
import * as github from "./filesio/saveManagement/github";
import * as saves from "./filesio/saveManagement/saveManagement";
import * as importer from "./import";
import * as modal from "./modal";
import { openSearchDialog } from "./search";
import * as undo from "./undo";
import { showValidationWindow } from "./validate";
import * as view from "./view";
import { i18n } from "./i18n";
import HistoryDialog from "./components/dialogs/HistoryDialog.vue";

const t = i18n.global.t;

export function setup() {
}

export const handlers = {
	
	undo: () => undo.undo(),
	
	redo: () => undo.redo(),
	
	resetZoom: () => view.resetZoom(),
	
	resetPan: () => view.resetPan(),
	
	exportSVG: () => exporter.exportAndPromptSVG(),

	exportImage: () => exporter.exportAndPromptImage(),
	
	about: showAboutModal,

	saveJSON: saves.save,

	open: saves.open,

	downloadJSON: pgDocument.saveJSONDocument,

	exportTH2: saves.exportTH2,
			
	importImageFromURL: function() {
		const url = prompt(`${t("import.imageURL")} (jpg, png, gif)`, "http://");
		if (url) {
			importer.importAndAddExternalImage(url);
		}
	},
	
	importSVGFromURL: function() {
		const url = prompt(t("import.svgURL"), "http://");
		if (url) {
			importer.importAndAddSVG(url);
		}
	},
	
	zoomIn: function() {
		view.zoomBy(1.25);
	},
	
	zoomOut: function() {
		view.zoomBy(1/1.25);
	},

	panToScrap: function() {
		view.centerView();
	},

	resetSettings: function() {
		if (confirm(t("clearSettings"))) {
			localStorage.clear();
		}
	},

	clearDocument: function() {
		if (confirm(t("clearDocument"))) {
			pgDocument.clear();
			saves.clearSaveFileName();
		}
	},

	showConfigEditor: configEditor.show,

	commit: github.saveJSONToGitHub,

	commitNew: github.saveAsNewFileToGitHub,

	loadFromGitHub: github.showGitHubLoadModal,

	historyPanel: () => {
		modal.addDialog(HistoryDialog, { id: "historyDialog", content: undefined, title: "menu.historyPanel", style: { "justify-self": "flex-end" } });
	},

	searchDialog: openSearchDialog,

	validate: showValidationWindow,

	openKeybindEditor: function() {
		modal.addDialog(KeybindEditorDialog, { id: "keybindEditor", content: undefined, title: "keybinds.title" });
	},
};

function showAboutModal() {
	modal.addDialog(AboutDialog, { id: "aboutDialog", content: undefined, title: "menu.about" });
}

