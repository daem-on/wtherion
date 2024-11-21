import { notifyViewChanged } from "@daem-on/graphite/render";
import paper from "paper";
import { isGroupChild } from "./group";
import { getRootItem, isBoundsItem, isPathItem } from "./item";

type HoverState = { type: "path", item: paper.Path; } | { type: "bounds", rect: paper.Rectangle; };
export let hoverState: HoverState | null = null;

export function handleHoveredItem(hitOptions: HitOptions, event: paper.ToolEvent) {
	const hitResult = paper.project.hitTest(event.point, hitOptions);
	if (hitResult) {
		if (hitResult.item.data?.noHover || hitResult.item.layer !== paper.project.activeLayer) {
			clearHoveredItem();
			return;
		}
		if (hitResult.item.selected === false) {
			if (isBoundsItem(hitResult.item)) {
				hoverState = { type: "bounds", rect: hitResult.item.bounds };
			} else if (isGroupChild(hitResult.item)) {
				hoverState = { type: "bounds", rect: getRootItem(hitResult.item).bounds };
			} else {
				if (isPathItem(hitResult.item)) {
					hoverState = { type: "path", item: hitResult.item };
				}
			}
			notifyViewChanged(paper);
		}
	} else {
		clearHoveredItem();
	}
}

export function clearHoveredItem() {
	hoverState = null;
	notifyViewChanged(paper);
}
