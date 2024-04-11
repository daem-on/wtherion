// function related to the main menu

import { ref } from "vue";
import importerTh2 from "../src/import/importTH2";
import * as importerXvi from "../src/import/importXVI";
import AboutDialog from "./components/dialogs/AboutDialog.vue";
import KeybindEditorDialog from "./components/dialogs/KeybindEditorDialog.vue";
import * as configEditor from "./configEditor";
import * as pgDocument from "./document";
import * as exporter from "./export";
import * as github from "./filesio/saveManagement/github";
import * as saves from "./filesio/saveManagement/saveManagement";
import * as helper from "./helper";
import * as importer from "./import";
import * as layerPanel from "./layerPanel";
import * as modal from "./modal";
import { openSearchDialog } from "./search";
import * as undo from "./undo";
import { showValidationWindow } from "./validate";
import * as view from "./view";

export function setup() {
	setupNavigationLogic();
	setupFileSection();
}


function setupNavigationLogic() {
	
	// click on $topMenuButton sets active state on button and shows/hides 
	// submenu. also shows/hides inputblocker in the background (transparent)
	jQuery('#appNav .topMenu>li').off('click').on('click', function(e) {
		e.stopPropagation();
		const $button = jQuery(this);
		jQuery('#appNav .topMenu>li').not($button).removeClass('active');
		jQuery('#appNav .subMenu').hide();
		
		if(!$button.hasClass('empty')) {			
			$button.parent().addClass('active');

			if($button.hasClass('active')) {
				closeMainMenu();
				
			} else {
				$button.addClass('active').children('ul').show();
				$button.find('.subSubMenu').removeClass('active');
				jQuery('#menuInputBlocker').show();
			}
		}
	});
	
	
	jQuery('#appNav .subMenu .hasSubSubMenu').off('click').on('click', function(e) {
		e.stopPropagation();
		const $subSubMenu = jQuery(this).children('ul');
		$subSubMenu.toggleClass('active');
	});
	
	
	jQuery('.subSubMenu>li').on('click', function(e) {
		e.stopPropagation();
		closeMainMenu();
	});
	
	
	jQuery('#menuInputBlocker').off('click').on('click', function(e) {
		hideMenus();
	});
	
}


function closeMainMenu() {
	jQuery('.topMenuButton').removeClass('active');
	jQuery('.subMenu').hide();
	jQuery('.subSubMenu').removeClass('active');
	jQuery('#menuInputBlocker').hide();
}


function setupFileSection() {
	
	// handle change on hidden file input in menu item
	jQuery('#fileUploadSVG').on('change', function(event) {
		helper.processFileInput('text', event.target, function(data) {
			importer.importAndAddSVG(data);
		});
	});
	
	// handle change on hidden file input in menu item
	jQuery('#fileUploadJSON').on('change', function(event) {
		helper.processFileInput('text', event.target, function(data) {
			pgDocument.loadJSONDocument(data);
		});
	});

	// handle change on hidden file input in menu item
	jQuery('#fileUploadTH2').on('change', function(event) {
		helper.processFileInput('text', event.target, function(data) {
			importerTh2(data);
		});
	});

	// handle change on hidden file input in menu item
	jQuery('#fileUploadXVI').on('change', function(event) {
		helper.processFileInput('text', event.target, function(data) {
			importerXvi.importXVI(data, (event.target as HTMLInputElement).files[0].name);
		});
	});
	
	
	// handle change on hidden file input in menu item
	jQuery('#fileUploadImage').on('change', function(event) {
		helper.processFileInput('dataURL', event.target, function(dataURL) {
			importer.importAndAddImage(dataURL);
		});
	});

}

export const handlers = {
	
	undo: () => undo.undo(),
	
	redo: () => undo.redo(),
	
	resetZoom: () => view.resetZoom(),
	
	resetPan: () => view.resetPan(),
	
	layerPanel: layerPanel.toggleVisibility,
	
	exportSVG: () => exporter.exportAndPromptSVG(),

	exportImage: () => exporter.exportAndPromptImage(),
	
	about: showAboutModal,

	saveJSON: saves.save,

	open: saves.open,

	downloadJSON: pgDocument.saveJSONDocument,

	exportTH2: saves.exportTH2,
			
	importImageFromURL: function() {
		const url = prompt("%import.imageURL% (jpg, png, gif)", "http://");
		if(url) {
			importer.importAndAddExternalImage(url);
		}
	},
	
	importSVGFromURL: function () {
		const url = prompt("%import.svgURL%", "http://");
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
		if (confirm('%clearSettings%')) {
			localStorage.clear();
		}
	},

	clearDocument: function() {
		if (confirm('%clearDocument%')) {
			pgDocument.clear();
			saves.clearSaveFileName();
		}
	},

	xviMode: layerPanel.toggleMode,

	showConfigEditor: configEditor.show,

	commit: github.saveJSONToGitHub,

	commitNew: github.saveAsNewFileToGitHub,

	loadFromGitHub: github.showGitHubLoadModal,

	historyPanel: function() {
		jQuery("#historyPanel").toggleClass("hidden");
		jQuery(document).trigger("HistoryChanged");
	},

	searchDialog: openSearchDialog,

	validate: showValidationWindow,

	openKeybindEditor: function() {
		modal.addDialog(KeybindEditorDialog, { id: "keybindEditor", content: undefined, title: "keybinds.title" });
	},
};

export function showCommitButton(show: boolean) {
	jQuery("#commitButton").toggleClass("hidden", !show);
}

export function setupToolEntries(entries) {
	const $toolMenu = jQuery('#toolSubMenu');		
	$toolMenu.empty().parent().removeClass('empty');
	let $subMenuAttachParent = null;
	jQuery.each(entries, function(index, entry) {
		if(entry.type === 'title') {
			$toolMenu.append(jQuery('<li class="space"></li>'));
			const $subSubMenuButton = jQuery('<li class="hasSubSubMenu">'+entry.text+'</li>');
			$subMenuAttachParent = jQuery('<ul class="subSubMenu">');
			$subSubMenuButton.append($subMenuAttachParent);
			$toolMenu.append($subSubMenuButton);
			
		} else if(entry.type === 'button') {
			const classString = entry.class ? ' '+entry.class : '' ;
			const $toolButton = jQuery('<li class="button'+classString+'" data-click="'+entry.click+'">'+entry.label+'</li>');
			
			$toolButton.on("click", function() {
				const func = jQuery(this).attr('data-click');
				helper.executeFunctionByName(func, window);
				setTimeout(function() {
					hideMenus();
				}, 100);
			});
			if($subMenuAttachParent === undefined) {
				$toolMenu.append($toolButton);
			} else {
				$subMenuAttachParent.append($toolButton);
			}
		}
		
	});
	setupNavigationLogic();
}


export function clearToolEntries() {
	jQuery('#toolSubMenu').empty().parent().addClass('empty');
}

export const contextMenuPosition = ref<{ x: number; y: number } | null>(null);

export function showContextMenu(event) {
	contextMenuPosition.value = { x: event.clientX, y: event.clientY };
}

function hideMenus() {
	jQuery('#appNav .topMenu>li').removeClass('active');
	jQuery('#appNav .topMenu').removeClass('active');
	jQuery('#appNav .subMenu').hide();
	jQuery('#menuInputBlocker').hide();
	hideContextMenu();
}


export function hideContextMenu() {
	
	jQuery('body').off('click.contextMenu');
	jQuery('body>#appNavContextMenu').remove();
	jQuery('#menuInputBlocker').hide();
	
}
	

function showAboutModal() {
	modal.addDialog(AboutDialog, { id: "aboutDialog", content: undefined, title: "menu.about" });
}

