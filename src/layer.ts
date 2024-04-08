import paper from "paper";
import editTH2 from "./editTH2";
import * as layerPanel from "./layerPanel";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import * as selection from "./selection";
import { triggers } from "./triggers";

export function setup() {
	const defaultLayer = addNewLayer('Default scrap');
	defaultLayer.data.isDefaultLayer = true;
	defaultLayer.data.id = getUniqueLayerID();
	
	ensureGuideLayer();
	
	defaultLayer.activate();
	layerPanel.updateLayerList();
}


export function isLayer(item) {
	return item.className === "Layer";
}


export function isActiveLayer(layer) {
	return paper.project.activeLayer.data.id === layer.data.id;
}


export function getUniqueLayerID() {
	let biggestID = 0;
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data.id > biggestID) {
			biggestID = layer.data.id;
		}
	}
	return biggestID + 1;
}
	

export function ensureGuideLayer() {
	if (!getGuideLayer()) {
		const guideLayer = addNewLayer('pg.internalGuideLayer');
		guideLayer.data.isGuideLayer = true;
		guideLayer.data.id = getUniqueLayerID();
		guideLayer.bringToFront();
		triggers.emit("LayersChanged");
	}
}


export function addNewLayer(layerName: string = null, setActive = true, elementsToAdd: paper.Item[] = null) {
	const newLayer = new paper.Layer();
	
	newLayer.data.id = getUniqueLayerID();
	newLayer.data.therionData = ScrapSettings.defaultSettings();
	
	if (layerName) {
		newLayer.name = layerName;
	} else {
		newLayer.name = `Scrap ${newLayer.data.id}`;
	}
	
	if (setActive) {
		setActiveLayer(newLayer);
	}
	
	if (elementsToAdd) {
		newLayer.addChildren(elementsToAdd);
	}
	
	const guideLayer = getGuideLayer();
	if (guideLayer) {
		guideLayer.bringToFront();
	}
	triggers.emit("LayerAdded");
	selection.clearSelection();
	return newLayer;
}


export function deleteLayer(id) {
	const layer = getLayerByID(id);
	if (layer) {
		layer.remove();
	}
	const defaultLayer = getDefaultLayer();
	if (defaultLayer) {
		defaultLayer.activate();
	}
}


export function addItemsToLayer(items, layer) {
	layer.addChildren(items);
}


export function addSelectedItemsToActiveLayer() {
	addItemsToLayer(selection.getSelectedItems(), paper.project.activeLayer);
}


export function getActiveLayer() {
	return paper.project.activeLayer;
}


export function setActiveLayer(activeLayer: paper.Layer) {
	if (paper.project.activeLayer === activeLayer) return;
	selection.clearSelection();
	activeLayer.activate();
	layerPanel.setActiveLayerEntry(activeLayer);
	triggers.emit("LayersChanged");
	editTH2.updateInactiveScraps();
}


export function getLayerByID(id): paper.Layer | undefined {
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data.id === id) {
			return layer;
		}
	}
	return undefined;
}


export function getDefaultLayer() {
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data && layer.data.isDefaultLayer) {
			return layer;
		}
	}
	return null;
}
	

export function activateDefaultLayer() {
	const defaultLayer = getDefaultLayer();
	defaultLayer.activate();
}


export function getGuideLayer() {
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.name === "pg.internalGuideLayer") {
			return layer;
		}
	}
	return false;
}


export function getAllUserLayers() {
	const layers = [];
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data && layer.data.isGuideLayer) {
			continue;
		}
		layers.push(layer);
	}
	return layers;
}


export function changeLayerOrderByIDArray(order) {
	order.reverse();
	for (let i=0; i<order.length; i++) {
		getLayerByID(order[i]).bringToFront();
	}
	// guide layer is always top
	const guideLayer = getGuideLayer();
	if (guideLayer) {
		guideLayer.bringToFront();
	}
}


export function reinitLayers(activeLayerID) {
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data.id === activeLayerID) {
			setActiveLayer(layer);
			break;
		}
	}
	layerPanel.updateLayerList();
	triggers.emit("LayersChanged");
}
