import jQuery from "jquery";
import pgDocument from "../js/document.js";
import layer from "../js/layer.js";
import * as layerPanel from "./layerPanel";
import pgExport from "../js/export.js";
import text from "../js/text.js";
import * as menu from "./menu";
import * as modal from "../js/modal.js";
import toolbar from "./toolbar";
import stylebar from "../js/stylebar.js";
import statusbar from "../js/statusbar.js";
import input from "../js/input.js";
import * as undo from "./undo";
import * as tools from "./tools";
import * as selection from "./selection";
import guides from "../js/guides.js";
import helper from "../js/helper.js";
import hover from "../js/hover.js";
import editTH2 from "./editTH2";
import * as group from "./group";
import * as item from "./item";
import compoundPath from "../js/compoundPath.js";
import toolOptionPanel from "./toolOptionPanel";
import math from "../js/math.js";
import geometry from "../js/geometry.js";
import * as view from "./view";
import boolean from "../js/boolean.js";
import edit from "../js/edit.js";
import importHelper from "../js/import.js";
import order from "../js/order.js";
import * as dropfiles from "./filesio/dropfiles";
import * as launchQueue from "./filesio/launchQueue";
import * as historyPanel from "./historyPanel";

import paper from "paper";
import {setup as configSetup} from "./filesio/configManagement";

// functions related to initializing pg

export default {
	document: pgDocument,
	layer: layer,
	layerPanel: layerPanel,
	export: pgExport,
	text: text,
	menu: menu,
	modal: modal,
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
	dropfiles: dropfiles,
	
	init: function() {
		paper.setup('paperCanvas');
		jQuery.ajaxSetup({ cache: false });

		configSetup();
		this.document.setup();
		this.layer.setup();
		this.export.setup();
		this.menu.setup();
		this.toolbar.setup();
		this.stylebar.setup();
		this.statusbar.setup();
		this.input.setup();
		this.undo.setup();
		this.layerPanel.setup();
		historyPanel.setup();
		launchQueue.setup();
	}
};

