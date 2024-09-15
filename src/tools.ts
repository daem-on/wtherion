import { createToolRegistry, createToolSwitcher, initializeTools } from "@daem-on/graphite/tools";
import { bezier } from "./tools/bezier";
import { detailselect } from "./tools/detailselect";
import { draw } from "./tools/draw";
import { inspect } from "./tools/inspect";
import { point } from "./tools/point";
import { select } from "./tools/select";
import { viewgrab } from "./tools/viewgrab";
import { viewzoom } from "./tools/viewzoom";
import paper from "paper";

const registry = createToolRegistry({
	select,
	detailselect,
	draw,
	bezier,
	point,
	viewgrab,
	viewzoom,
	inspect,
});

export function setup() {
	initializeTools(registry, paper);
	setDefaultTool();
}

export const switchToolById = createToolSwitcher(registry);

export function setDefaultTool() {
	switchToolById("select");
}
