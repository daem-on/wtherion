import paper from "paper";
import { isGroupChild } from "./group";
import { hoverBounds, hoverItem } from "./guides";
import { getRootItem, isBoundsItem } from "./item";

let hoveredItem;
let hitResultItem;
export function handleHoveredItem(hitOptions, event) {
	const hitResult = paper.project.hitTest(event.point, hitOptions);
	if(hitResult) {
		if(
			(hitResult.item.data && hitResult.item.data.noHover)
			|| hitResult.item.layer !== paper.project.activeLayer
		) {
			clearHoveredItem();
			return;
		}
		if(hitResult !== hoveredItem) {
			clearHoveredItem();
		}
		if(	hoveredItem === undefined && hitResult.item.selected === false) {
			hitResultItem = hitResult.item;
			if(isBoundsItem(hitResult.item)) {
				hoveredItem = hoverBounds(hitResult.item);

			} else if(isGroupChild(hitResult.item)) {
				hoveredItem = hoverBounds(getRootItem(hitResult.item));
				
			} else {
				hoveredItem = hoverItem(hitResult);
			}
		}
	} else {
		clearHoveredItem();
	}
}

export function clearHoveredItem() {
	hitResultItem = undefined;
	if(hoveredItem !== undefined) {
		hoveredItem.remove();
		hoveredItem = undefined;
	}
	paper.view.update();
}
