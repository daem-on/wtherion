import * as layer from "./layer";
import * as pgExport from "./export.js";
import * as menu from "./menu";
import * as tools from "./tools";
import * as input from "./input";
import * as undo from "./undo";
import * as selection from "./selection";
import * as helper from "./helper.js";
import * as hover from "./hover.js";
import editTH2 from "./editTH2";
import * as group from "./group";
import * as item from "./item";
import * as compoundPath from "./compoundPath.js";
import * as math from "./math.js";
import * as geometry from "./geometry.js";
import * as view from "./view";
import * as boolean from "./boolean.js";
import * as edit from "./edit";
import * as importHelper from "./import.js";
import * as order from "./order.js";
import * as dropfiles from "./filesio/dropfiles";
import * as launchQueue from "./filesio/launchQueue";
import * as i18n from "./i18n";
import * as pgDocument from "./document";

import paper from "paper";
import {setup as configSetup} from "./filesio/configManagement";
import { setupCustomRenderer } from "./render";
import { initColors } from "./objectDefs.js";
import colorDefs from "./res/color-defs.json";
import { maybeShowGetStartedDialog } from "./getStarted";

// functions related to initializing pg

export default {
	layer: layer,
	export: pgExport,
	menu: menu,
	tools: tools,
	input: input,
	undo: undo,
	selection: selection,
	helper: helper,
	hover: hover,
	editTH2: editTH2,
	group: group,
	item: item,
	compoundPath: compoundPath,
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

		configSetup();
		this.layer.setup();
		this.export.setup();
		this.menu.setup();
		this.tools.setup();
		this.input.setup();
		this.undo.snapshot("init");
		launchQueue.setup();
		i18n.setup();
		pgDocument.setup();
		setupCustomRenderer();
		initColors(colorDefs);

		maybeShowGetStartedDialog();
	},
};

