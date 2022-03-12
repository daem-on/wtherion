// function related to the main menu

import * as importerXvi from "../src/import/importXVI";
import importerTh2 from "../src/import/importTH2";
import pg from "../src/init";
import { save, showLoadSelect, exportTH2, setSaveFileName } from "../src/saveManagement";
import pgDocument from "../js/document";
import * as layerPanel from "../js/layerPanel";
import { getVersionNumber } from "../src/configManagement";

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
		pg.helper.processFileInput('text', event.target, function(data) {
			pg.import.importAndAddSVG(data);
		});
	});
	
	// handle change on hidden file input in menu item
	jQuery('#fileUploadJSON').on('change', function(event) {
		pg.helper.processFileInput('text', event.target, function(data) {
			pg.document.loadJSONDocument(data);
		});
	});

	// handle change on hidden file input in menu item
	jQuery('#fileUploadTH2').on('change', function(event) {
		pg.helper.processFileInput('text', event.target, function(data) {
			importerTh2(data);
		});
	});

	// handle change on hidden file input in menu item
	jQuery('#fileUploadXVI').on('change', function(event) {
		pg.helper.processFileInput('text', event.target, function(data) {
			importerXvi.importXVI(data, (event.target as HTMLInputElement).files[0].name);
		});
	});
	
	
	// handle change on hidden file input in menu item
	jQuery('#fileUploadImage').on('change', function(event) {
		pg.helper.processFileInput('dataURL', event.target, function(dataURL) {
			pg.import.importAndAddImage(dataURL);
		});
	});

}

export const handlers = {
	
	undo: () => pg.undo.undo(),
	
	redo: () => pg.undo.redo(),
	
	resetZoom: () => pg.view.resetZoom(),
	
	resetPan: () => pg.view.resetPan(),
	
	layerPanel: () => pg.layerPanel.toggleVisibility(),
	
	exportSVG: () => pg.export.exportAndPromptSVG(),

	exportImage: () => pg.export.exportAndPromptImage(),
	
	about: showAboutModal,

	saveJSON: save,

	open: showLoadSelect,

	downloadJSON: pgDocument.saveJSONDocument,

	exportTH2: exportTH2,
			
	importImageFromURL: function() {
		const url = prompt("%import.imageURL% (jpg, png, gif)", "http://");
		if(url) {
			pg.import.importAndAddExternalImage(url);
		}
	},
	
	importSVGFromURL: function () {
		const url = prompt("%import.svgURL%", "http://");
		if (url) {
			pg.import.importAndAddSVG(url);
		}
	},
	
	zoomIn: function() {
		pg.view.zoomBy(1.25);
	},
	
	zoomOut: function() {
		pg.view.zoomBy(1/1.25);
	},

	panToScrap: function() {
		pg.view.centerView();
	},

	resetSettings: function() {
		if (confirm('%clearSettings%')) {
			localStorage.clear();
		}
	},

	clearDocument: function() {
		if (confirm('%clearDocument%')) {
			pg.document.clear();
			setSaveFileName(null);
		}
	},

	xviMode: layerPanel.toggleMode,
};


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
				pg.helper.executeFunctionByName(func, window);
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


export function showContextMenu(event) {

	// check for selected items, so the right context menu can be opened
	if(pg.selection.getSelectedItems().length > 0) {
		if(jQuery('#appNavContextMenu').length > 0) {
			return;
		}
		// create, append and position context menu for object context
		jQuery('body').append("<nav class='appNav' id='appNavContextMenu'></nav>");
		
		const $menu = jQuery('#toolSubMenu')
			.clone(true)
			.appendTo('#appNavContextMenu')
			.show();
		
		let menuPosY = event.pageY;
		const diff = (jQuery(document).height() - event.pageY) - $menu.outerHeight();
		if(diff < 0) {
			menuPosY += diff - 10; 
		}
		$menu.css({ 'position': 'absolute', 'top': menuPosY, 'left': event.pageX });
		
		jQuery('#menuInputBlocker').show();
		
	} else {
		//todo: create context menu for document context
	}

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
	const html = `
		<img src="assets/logo-cropped.png" width=600>
		<p style="margin: 0.5em;">
			<b style="font-weight: bold">wtherion</b>
			version ${getVersionNumber()}
			%translationCredits%
			Created by Csongor Zih, based on
			<a href="https://github.com/w00dn/papergrapher" target="_blank">papergrapher</a>, created by Rolf Fleischmann.
			Powered by <a href="http://paperjs.org/" target="_blank">Paper.js</a>. Published under the MIT license.
		</p>
	`;
	pg.modal.floater('appInfoWindow', 'About', html, 600, 100);
	jQuery("#appInfoWindow").css("padding", 0);
}

