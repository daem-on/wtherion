import jQuery from "jquery";
import settings from "../js/settings.js";
import pgDocument from "../js/document.js";
import layer from "../js/layer.js";
import layerPanel from "../js/layerPanel.js";
import pgExport from "../js/export.js";
import text from "../js/text.js";
import menu from "../js/menu.js";
import toolbar from "../js/toolbar.js";
import stylebar from "../js/stylebar.js";
import statusbar from "../js/statusbar.js";
import input from "../js/input.js";
import undo from "../js/undo.js";
import tools from "./tools";
import selection from "../js/selection.js";
import guides from "../js/guides.js"
import helper from "../js/helper.js"
import hover from "../js/hover.js"
import editTH2 from "../js/editTH2.js"
import group from "../js/group.js"
import item from "../js/item.js"
import compoundPath from "../js/compoundPath.js"
import toolOptionPanel from "../js/toolOptionPanel.js"
import math from "../js/math.js"
import geometry from "../js/geometry.js"
import view from "../js/view.js"
import boolean from "../js/boolean.js"
import edit from "../js/edit.js"
import importHelper from "../js/import.js"
import order from "../js/order.js"

import paper from "paper";

// functions related to initializing pg

export default {
	settings: settings,
	document: pgDocument,
	layer: layer,
	layerPanel: layerPanel,
	export: pgExport,
	text: text,
	menu: menu,
	toolbar: toolbar,
	stylebar: stylebar,
	statusbar: statusbar,
	input: input,
	undo: undo,
	tools: tools,
	selection: selection,
	guides: guides,
	helper: helper,
	hover: hover,
	editTH2: editTH2,
	group: group,
	item: item,
	compoundPath: compoundPath,
	toolOptionPanel: toolOptionPanel,
	math: math,
	geometry: geometry,
	view: view,
	boolean: boolean,
	edit: edit,
	import: importHelper,
	order: order,
	
	init: function() {
		paper.setup('paperCanvas');
		jQuery.ajaxSetup({ cache: false });
		
		this.settings.setup();
		this.document.setup();
		this.layer.setup();
		this.export.setup();
		this.text.setup();
		this.menu.setup();
		this.toolbar.setup();
		this.stylebar.setup();
		this.statusbar.setup();
		this.input.setup();
		this.undo.setup();
		// this.codeEditor.setup();
	}
};

