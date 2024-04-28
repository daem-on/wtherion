import paper from "paper";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import { triggers } from "./triggers";
import { COLOR_GUIDE_PRIMARY } from "./colors";

export function setup() {
	const defaultLayer = addNewLayer('Scrap 1');
	
	ensureGuideLayer();
	
	defaultLayer.activate();
}


export function isLayer(item: paper.Item): item is paper.Layer {
	return item.className === "Layer";
}


export function isActiveLayer(layer: paper.Layer) {
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

function getUniqueLayerName() {
	let i = 1;
	let name = `Scrap ${i}`;
	while (paper.project.layers.find(layer => layer.name === name)) {
		i++;
		name = `Scrap ${i}`;
	}
	return name;
}

export function addNewLayer(layerName: string = null, setActive = true, elementsToAdd: paper.Item[] = null) {
	const newLayer = new paper.Layer();
	
	newLayer.data.id = getUniqueLayerID();
	newLayer.data.therionData = ScrapSettings.defaultSettings();
	
	newLayer.name = layerName ?? getUniqueLayerName();
	
	if (setActive) {
		setActiveLayer(newLayer);
	}
	
	if (elementsToAdd) {
		newLayer.addChildren(elementsToAdd);
	}
	
	newLayer.selectedColor = COLOR_GUIDE_PRIMARY;
	
	const guideLayer = getGuideLayer();
	if (guideLayer) {
		guideLayer.bringToFront();
	}
	triggers.emit("LayerAdded");
	return newLayer;
}

function backupSingletonData(layer: paper.Layer) {
	const xthSettings = layer.data.therionData?.xthSettings;
	if (!xthSettings) return;
	paper.project.layers.find(l => l !== layer).data.therionData.xthSettings = xthSettings;
}

export function deleteLayer(id: number) {
	if (paper.project.layers.length === 1) return;
	const layer = getLayerByID(id);
	if (!layer) return;
	backupSingletonData(layer);
	layer.remove();
	activateDefaultLayer();
	triggers.emit("LayerRemoved");
}


export function addItemsToLayer(items, layer) {
	layer.addChildren(items);
}


export function getActiveLayer() {
	return paper.project.activeLayer;
}


export function setActiveLayer(activeLayer: paper.Layer) {
	if (paper.project.activeLayer === activeLayer) return;
	activeLayer.activate();
	triggers.emit("LayersChanged");
}


export function getLayerByID(id: number): paper.Layer | undefined {
	return paper.project.layers.find(layer => layer.data.id === id);
}


export function getDefaultLayer(): paper.Layer {
	return paper.project.layers.find(layer => !layer.data?.isGuideLayer);
}
	

export function activateDefaultLayer() {
	const defaultLayer = getDefaultLayer();
	defaultLayer.activate();
	triggers.emit("LayersChanged");
}


export function getGuideLayer(): paper.Layer {
	return paper.project.layers.find(layer => layer.data.isGuideLayer);
}


export function getAllUserLayers() {
	return paper.project.layers.filter(layer => !layer.data?.isGuideLayer);
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


export function reinitLayers(activeLayerID: number) {
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (layer.data.id === activeLayerID) {
			setActiveLayer(layer);
			break;
		}
	}
	triggers.emit("LayersChanged");
}

export function moveLayer(layer: paper.Layer, delta: number) {
	const index = paper.project.layers.indexOf(layer);
	const newIndex = index + delta;
	if (newIndex < 0 || newIndex >= paper.project.layers.length) return;
	const prevActive = paper.project.activeLayer;
	paper.project.insertLayer(newIndex, layer);
	prevActive.activate();
	triggers.emit("LayersChanged");
}
