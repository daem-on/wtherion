import paper from "paper";
import editTH2 from "./editTH2";
import * as layerPanel from "./layerPanel";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import * as selection from "./selection";

const layerNames = ['coasts','sisters','buttons','spaces','teeth','arguments','clubs','thrills','vegetables','sausages','locks','kicks','insects','cars','trays','clams','legs','humor','levels','jelly','competition','cubs','quivers','flags','pins','floors','suits','actors','queens','appliances','dogs','plates','donkeys','coughing','tops','covers','dads','breath','sacks','thumbs','impulse','linens','industry','cobwebs','babies','volcanoes','beef','values','reason','birds','rays','stages','wrenches','uncles','water','bits','knees','jails','jellyfish','treatment','scissors','cars','vacation','lips','ovens','language','money','soup','knowledge','eggs','sponges','basins','coats','chalk','scarfs','letters','rooms','horses','touch','carpentry','honey','effects','flight','debt','boards','advice','brakes','fish','camps','the north','trains','balance','wounds','routes','guitars','receipts','cracks','sex','chance','looks','windows','girls','partners','stars','yam','smashing','existence','keys','flowers','talk','sons','wood','fuel','cakes','wealth','sofas','homes','desks','screws','bells','ears','juice','dogs','force','crooks','attraction','knots','lumber','activity','moons','creators','apparel','iron','crayons','tanks','twigs','condition','songs','snails','driving','cheese','rails','rings','shows','vans','love','moms','schools','pets','dust','experience','cellars','questions','rolls','power','scale','connection','grades','magic','maids','ships','leather','exchange','pigs','sticks','rhythm','distribution','harmony','dinosaurs','towns','rings','cribs','toes','heat','buckets','cables','books','drinks','grass','aunts','turkey','laborer','oil','discussion','drawers','oceans','machines','loafs','curtains','hours','taste','shaking','protest','needles','quicksand','battle','distance','bombs','hairs','smell'] as const;

export function setup() {
	const defaultLayer = addNewLayer('Default layer');
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
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.data.id > biggestID) {
			biggestID = layer.data.id;
		}
	}
	return biggestID + 1;
}
	

export function ensureGuideLayer() {
	if(!getGuideLayer()) {
		const guideLayer = addNewLayer('pg.internalGuideLayer');
		guideLayer.data.isGuideLayer = true;
		guideLayer.data.id = getUniqueLayerID();
		guideLayer.bringToFront();
	}
}


export function addNewLayer(layerName: string = null, setActive = true, elementsToAdd: paper.Item[] = null) {
	const newLayer = new paper.Layer();
	
	newLayer.data.id = getUniqueLayerID();
	newLayer.data.therionData = ScrapSettings.defaultSettings();
	
	if(layerName) {
		newLayer.name = layerName;
	} else {
		newLayer.name = 'Layer of '+layerNames[Math.floor(Math.random()*layerNames.length)];
	}
	
	if(setActive) {
		setActiveLayer(newLayer);
	}
	
	if(elementsToAdd) {
		newLayer.addChildren(elementsToAdd);
	}
	
	const guideLayer = getGuideLayer();
	if(guideLayer) {
		guideLayer.bringToFront();
	}
	return newLayer;
}


export function deleteLayer(id) {
	const layer = getLayerByID(id);
	if(layer) {
		layer.remove();
	}
	const defaultLayer = getDefaultLayer();
	if(defaultLayer) {
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
	editTH2.updateInactiveScraps();
}


export function getLayerByID(id): paper.Layer | undefined {
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.data.id === id) {
			return layer;
		}
	}
	return undefined;
}


export function getDefaultLayer() {
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.data && layer.data.isDefaultLayer) {
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
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.name === "pg.internalGuideLayer") {
			return layer;
		}
	}
	return false;
}


export function getAllUserLayers() {
	const layers = [];
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.data && layer.data.isGuideLayer) {
			continue;
		}
		layers.push(layer);
	}
	return layers;
}


export function changeLayerOrderByIDArray(order) {
	order.reverse();
	for(let i=0; i<order.length; i++) {
		getLayerByID(order[i]).bringToFront();
	}
	// guide layer is always top
	const guideLayer = getGuideLayer();
	if(guideLayer) {
		guideLayer.bringToFront();
	}
}


export function reinitLayers(activeLayerID) {
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if(layer.data.id === activeLayerID) {
			setActiveLayer(layer);
			break;
		}
	}
	layerPanel.updateLayerList();
}
