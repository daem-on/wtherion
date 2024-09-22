// select tool
// adapted from resources on http://paperjs.org and 
// https://github.com/memononen/stylii

import { default as getSettings } from "../../src/objectSettings/model/getSettings";
import { updateWindow } from "../../src/objectSettings/objectOptionPanel";
import * as hover from "../hover";
import * as layer from "../layer";
import * as guides from "../guides";
import * as edit from "../edit";
import * as compoundPath from "../compoundPath";
import * as group from "../group";
import * as item from "../item";
import * as undo from "../undo";
import * as selection from "../selection";
import paper from "paper";
import { LineSettings } from "../../src/objectSettings/model/LineSettings";
import { defineTool, ToolAction } from "@daem-on/graphite/tools";
import { triggers } from "../triggers";
import editTH2 from "../editTH2";
import { bringSelectionToFront, sendSelectionToBack } from "../order";
import selectAllUrl from "../../assets/ui/select_all.svg";
import contentCopyUrl from "../../assets/ui/content_copy.svg";
import contentPasteUrl from "../../assets/ui/content_paste.svg";
import linkUrl from "../../assets/ui/link.svg";
import mergeUrl from "../../assets/ui/merge.svg";
import deleteUrl from "../../assets/ui/delete.svg";
import lockUrl from "../../assets/ui/lock.svg";
import lockOpenUrl from "../../assets/ui/lock_open.svg";
import { useBounds, useMoving, useRectangularSelection, useRotatation, useScaling } from "@daem-on/graphite/interactions";
import { notifyViewChanged } from "@daem-on/graphite/render";

const actions: ToolAction[] = [
	{
		name: "selectAll",
		callback: () => selection.selectAllItems(),
		defaultKey: "ctrl-a",
		category: "menu.edit",
		label: "selectAll",
		icon: selectAllUrl
	},
	{
		name: "invertSelection",
		callback: () => selection.invertItemSelection(),
		defaultKey: "ctrl-i",
		category: "selection"
	},
	{
		name: "groupSelection",
		callback: () => group.groupSelection(),
		defaultKey: "ctrl-g",
		category: "selection",
		icon: linkUrl
	},
	{
		name: "ungroupSelection",
		callback: () => group.ungroupSelection(),
		defaultKey: "ctrl-shift-g",
		category: "selection",
	},
	{
		name: "copySelection",
		callback: () => edit.copySelectionToClipboard(),
		defaultKey: "ctrl-c",
		category: "menu.edit",
		icon: contentCopyUrl
	},
	{
		name: "pasteSelection",
		callback: () => edit.pasteObjectsFromClipboard(),
		defaultKey: "ctrl-v",
		category: "menu.edit",
		icon: contentPasteUrl
	},
	{
		name: "delete",
		callback: () => selection.deleteItemSelection(),
		category: "menu.edit",
		defaultKey: "delete",
		icon: deleteUrl,
	},
	{
		name: "deselectAll",
		callback: () => selection.clearSelection(),
		category: "selection",
		label: "deselectAll",
	},
	{
		name: "lineToArea",
		callback: () => editTH2.lineToArea(),
		category: "areas",
	},
	{
		name: "areaToLine",
		callback: () => editTH2.areaToLine(),
		category: "areas",
	},
	{
		name: "toggleItemsLocked",
		callback: () => editTH2.toggleItemsLocked(),
		category: "selection",
		defaultKey: "ctrl-l",
		icon: lockUrl
	},
	{
		name: "unlockSelection",
		callback: () => editTH2.unlockSelection(),
		category: "selection",
		defaultKey: "ctrl-shift-l",
		icon: lockOpenUrl
	},
	{
		name: "bringToFront",
		callback: () => bringSelectionToFront(),
		category: "order",
	},
	{
		name: "sendToBack",
		callback: () => sendSelectionToBack(),
		category: "order",
	},
	{
		name: "mergeLines",
		callback: () => editTH2.mergeLines(),
		category: "lines",
		icon: mergeUrl
	},
	{
		name: "smoothLine",
		callback: () => editTH2.smooth(),
		category: "lines",
	},
	{
		name: "simplifyLine",
		callback: () => editTH2.simplify(),
		category: "lines",
	},
	{
		name: "randomizeRotation",
		callback: () => editTH2.randomizeRotation(),
		category: "points"
	},
	{
		name: "changeNamespace",
		callback: () => editTH2.changeStationsNamespace(),
		category: "points"
	}
];

const hitOptions: HitOptions = {
	segments: true,
	stroke: true,
	curves: true,
	fill: true,
	guides: false
};

export const select = defineTool({
	definition: {
		id: "select",
		name: "tools.itemSelect",
		actions,
	},
	setup(on) {
		const moving = useMoving();
		const scaling = useScaling(paper);
		const rotation = useRotatation({ snapAngle: 45 });
		const rectSelection = useRectangularSelection(paper);
		const bounds = useBounds({ rotationHandleDistance: 10 });

		let mode: "none" | "scale" | "rotate" | "move" | "cloneMove" | "rectSelection" = "none";

		const hideBounds = () => bounds.hide();
		on("activate", () => {
			preProcessSelection();
			showBounds();
			
			triggers.onAny(["DeleteItems", "Undo", "Redo", "Grouped", "Ungrouped", "SelectionChanged"], triggerHandler);
		});

		on("mousedown", event => {
			if (event.event.button > 0) return;
			hover.clearHoveredItem();

			const tolerance = 8 / paper.view.zoom;

			if (bounds.state) {
				if (bounds.state.rotPoint.isClose(event.point, tolerance)) {
					mode = "rotate";
					rotation.start(selection.getSelectedItems(), bounds.state.rect.center, event.point);
					bounds.hide();
					return;
				}
				for (const point of bounds.state.scalePoints) {
					if (point.isClose(event.point, tolerance)) {
						mode = "scale";
	
						scaling.start(selection.getSelectedItems(), bounds.state.rect.center, point);
						bounds.hide();
						return;
					}
				}
			}
			
			const hitResult = paper.project.hitTest(event.point, { ...hitOptions, tolerance });
			if (hitResult && hitResult.item.layer === paper.project.activeLayer) {
				// deselect all by default if the shift key isn't pressed
				// also needs some special love for compound paths and groups,
				// as their children are not marked as "selected"
				if (!event.modifiers.shift) {
					const root = item.getRootItem(hitResult.item);
					if (item.isCompoundPathItem(root) || group.isGroup(root)) {
						if (!root.selected) {
							selection.clearSelection();
						}
					} else if (!hitResult.item.selected) {
						selection.clearSelection();
					}
				}
				// deselect a currently selected item if shift is pressed
				if (event.modifiers.shift && hitResult.item.selected) {
					selection.setItemSelection(hitResult.item, false);
				} else {
					selection.setItemSelection(hitResult.item, true);
					if (event.modifiers.alt) {
						mode = "cloneMove";
						selection.cloneSelection();
					} else {
						mode = "move";
					}
				}
				hideBounds();
				guides.removeHelperItems();
				return;
			} else {
				if (!event.modifiers.shift) {
					hideBounds();
					guides.removeHelperItems();
					selection.clearSelection();
				}
				mode = "rectSelection";
			}
		});

		on("mousemove", event => {
			hover.handleHoveredItem(hitOptions, event);
		});

		
		on("mousedrag", event => {
			if (event.event.button > 0) return;
			
			switch (mode) {
				case "rectSelection":
					if (!rectSelection.rect) {
						rectSelection.start(event.downPoint);
					} else {
						rectSelection.update(event.point, event.downPoint);
					}
					notifyViewChanged(paper);
					break;
				case "scale":
					scaling.update(event.delta, event.modifiers.shift, event.modifiers.alt);
					break;
				case "rotate":
					rotation.update(event.point, event.modifiers.shift);
					break;
				case "move":
				case "cloneMove":
					const selectedItems = selection.getSelectedItems();
					moving.update(selectedItems, event.delta);
				break;
			}
		});

		on("mouseup", event => {
			if (event.event.button > 0) return;
			
			switch (mode) {
				case "rectSelection":
					if (rectSelection.rect) {
						selection.processRectangularSelection(event.event.shiftKey, rectSelection.rect);
					}
					break;
				case "move":
				case "cloneMove":
					undo.snapshot("moveSelection");
					break;
				case "scale":
					scaling.end();
					undo.snapshot("scaleSelection");
					break;
				case "rotate":
					rotation.end();
					undo.snapshot("rotateSelection");
					break;
			}
			
			mode = "none";
			rectSelection.end();
			
			hideBounds();
			guides.removeHelperItems();
			if (selection.getSelectedItems().length > 0) {
				showBounds();
			}
		});

		on("deactivate", () => {
			hover.clearHoveredItem();
			guides.removeHelperItems();
			triggers.offAny(["DeleteItems", "Undo", "Redo", "Grouped", "Ungrouped", "SelectionChanged"], triggerHandler);
		});

		function triggerHandler() {
			showBounds();
			updateWindow();
		}

		const guideColor = "#59c99c";

		on("drawImmediate", ({ context }) => {
			const zoom = 1/paper.view.zoom;
			if (rectSelection.rect) {
				const { x, y, width, height } = rectSelection.rect;
				context.setLineDash([3 * zoom, 3 * zoom]);
				context.strokeStyle = guideColor;
				context.strokeRect(x, y, width, height);
				context.setLineDash([]);
			}
			if (bounds.state) {
				const { rect: { x, y, width, height }, rotPoint, scalePoints } = bounds.state;
				context.strokeStyle = guideColor;
				context.fillStyle = "white";
				context.strokeRect(x, y, width, height);
				if (rotPoint) {
					context.beginPath();
					context.arc(rotPoint.x, rotPoint.y, 5 * zoom, 0, 2 * Math.PI);
					context.stroke();
					context.fill();
				}
				context.fillStyle = guideColor;
				for (const [index, point] of scalePoints.entries()) {
					const size = (index % 2 ? 4 : 6) * zoom;
					context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
				}
			}
		});

		const showBounds = () => {
			const items = selection.getSelectedItems();
			if (items.length <= 0) return;

			// If there are items with noDrawHandle, don't draw regular handles0
			if (items.some(item => (item.data?.noDrawHandle))) {
				return;
			}
			
			if (items.length === 1 && items[0].data?.onlyRotateHandle) {
				showRotateHandle(items[0]);
				return;
			}

			if (items.length === 1 && item.isPathItem(items[0])) {
				const settings = getSettings(items[0]);
				if (settings.className === "LineSettings")
					showLineDirectionTick(items[0], settings);
			}

			bounds.show(items, paper.view.zoom);
			notifyViewChanged(paper);
		};
	},
});

function preProcessSelection() {
	
	// when switching to the select tool while having a child object of a
	// compound path selected, deselect the child and select the compound path
	// instead. (otherwise the compound path breaks because of scale-grouping)
	const items = selection.getSelectedItems();
	for (const item of items) {
		if (compoundPath.isCompoundPathChild(item)) {
			const cp = compoundPath.getItemsCompoundPath(item);
			selection.setItemSelection(item, false);
			selection.setItemSelection(cp, true);
		}
	}
}

function showLineDirectionTick(line: paper.Path, settings: LineSettings) {
	if (line.segments.length < 2) return;
	const reverse = settings.reverse ? -1 : 1;
	const normal = line.getNormalAt(0).multiply(10 * reverse);
	const directionIndicator = new paper.Path([
		line.firstSegment.point,
		line.firstSegment.point.add(normal)
	]);
	directionIndicator.strokeColor = new paper.Color("#fcba03");
	directionIndicator.data.isHelperItem = true;
	directionIndicator["guide"] = true;
	directionIndicator.parent = layer.getGuideLayer() || null;
}

function showRotateHandle(item: paper.Item) {
	const thPointRotHandle =
		new paper.Path.Line({
			data: {
				isRotHandle: true,
				isHelperItem: true,
				noSelect: true,
				noHover: true
			},
			from: item.position
				.subtract(new paper.Point(0, 6)),
			to: item.position
				.subtract(new paper.Point(0, 10 + (paper.view.zoom / 60))),
			strokeColor: guides.getGuideColor("blue"),
			strokeWidth: 4 / paper.view.zoom,
			parent: layer.getGuideLayer()
		});
	thPointRotHandle.rotate(item.rotation, item.position);
}
