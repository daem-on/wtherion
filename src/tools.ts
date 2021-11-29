// functions related to tools

import select from "../js/tools/select.js";
import detailselect from "../js/tools/detailselect.js";
import draw from "../js/tools/draw.js";
import bezier from "../js/tools/bezier.js";
import cloud from "../js/tools/cloud.paper.js";
import broadbrush from "../js/tools/broadbrush.paper.js";
import text from "../js/tools/text.paper.js";
import eyedropper from "../js/tools/eyedropper.paper.js";
import circle from "../js/tools/circle.paper.js";
import rectangle from "../js/tools/rectangle.paper.js";
import rotate from "../js/tools/rotate.paper.js";
import scale from "../js/tools/scale.paper.js";
import exportrect from "../js/tools/exportrect.paper.js";
import zoom from "../js/tools/zoom.paper.js";
import viewgrab from "../js/tools/viewgrab.paper.js";
import viewzoom from "../js/tools/viewzoom.paper.js";

import toolOptions from "../js/toolOptions.js";

export default {
	select: select,
	detailselect: detailselect,
	draw: draw,
	bezier: bezier,
	cloud: cloud,
	broadbrush: broadbrush,
	text: text,
	eyedropper: eyedropper,
	circle: circle,
	rectangle: rectangle,
	rotate: rotate,
	scale: scale,
	exportrect: exportrect,
	zoom: zoom,
	viewgrab: viewgrab,
	viewzoom: viewzoom,
	toolList: toolOptions,

	registerTool: function(toolInfos) {
		this.toolList.push(toolInfos);
	},
	
	
	getToolList: function() {
		return this.toolList;
	},
	
	
	getToolInfoByID: function(id) {
		for(var i=0; i<this.toolList.length; i++) {
			if(this.toolList[i].id == id) {
				return this.toolList[i];
			}
		}
	},

	
	// localstorage
	getLocalOptions: function(options) {
		var storageJSON = localStorage.getItem('pg.tools.'+options.id);
		if(storageJSON && storageJSON.length > 0) {
			var storageOptions = JSON.parse(storageJSON);
			
			// only overwrite options that are stored
			// new options will use their default value
			for(var option in options) {
				if(storageOptions.hasOwnProperty(option)) {
					options[option] = storageOptions[option];
				}
			}
		}
		return options;
	},
	
	
	setLocalOptions: function(options) {
		var optionsJSON = JSON.stringify(options, null, 2);
		localStorage.setItem('pg.tools.'+options.id, optionsJSON);
	},
	
	
	deleteLocalOptions: function(id) {
		localStorage.removeItem('pg.tools.'+id);
	},
		
};