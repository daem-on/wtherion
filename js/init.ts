import jQuery from "jquery";
import settings from "./settings.js";
import pgDocument from "./document.js";
import layer from "./layer.js";
import layerPanel from "./layerPanel.js";
import pgExport from "./export.js";
import text from "./text.js";
import menu from "./menu.js";
import toolbar from "./toolbar.js";
import stylebar from "./stylebar.js";
import statusbar from "./statusbar.js";
import input from "./input.js";
import undo from "./undo.js";
import tools from "../src/tools";
import selection from "./selection.js";
import guides from "./guides.js"
import helper from "./helper.js"
import hover from "./hover.js"
import editTH2 from "./editTH2.js"
import group from "./group.js"
import item from "./item.js"
import compoundPath from "./compoundPath.js"
import toolOptionPanel from "./toolOptionPanel.js"
import math from "./math.js"
import geometry from "./geometry.js"
// import codeEditor from "../js/codeEditor.js";

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
	// codeEditor: codeEditor,
	
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

