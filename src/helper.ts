import paper from "paper";
import { getSelectedItems } from "./selection";

export function selectedItemsToJSONString() {
	const selectedItems = getSelectedItems();
	if (selectedItems.length > 0) {
		let jsonComp = '[["Layer",{"applyMatrix":true,"children":[';
		for (let i=0; i < selectedItems.length; i++) {
			let itemJSON = selectedItems[i].exportJSON({asString: true});
			if (i+1 < selectedItems.length) {
				itemJSON += ',';
			}
			jsonComp += itemJSON;
		}
		return jsonComp += ']}]]';
	} else {
		return null;
	}
}


export function getAllPaperItems(includeGuides) {
	includeGuides = includeGuides || false;
	const allItems = [];
	for (let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		if (!includeGuides && layer.data && layer.data.isGuideLayer)
			continue;
		for (let j=0; j<layer.children.length; j++) {
			const child = layer.children[j];
			// don't give guides back
			if (!includeGuides && (child as any).guide) {
				continue;
			}
			allItems.push(child);
		}
	}
	return allItems;
}
	

export function getPaperItemsByLayerID(id) {
	const allItems = getAllPaperItems(false);
	const foundItems = [];
	for (const item of allItems) {
		if (item.layer.data.id === id) {
			foundItems.push(item);
		}
	}
	return foundItems;
}


export function getPaperItemsByTags(tags) {
	const allItems = getAllPaperItems(true);
	const foundItems = [];
	for (const item of allItems) {
		for (const tag of tags) {
			if (item[tag] && foundItems.indexOf(item) === -1) {
				foundItems.push(item);
			}
		}
	}
	return foundItems;
}


export function removePaperItemsByDataTags(tags) {
	const allItems = getAllPaperItems(true);
	for (const item of allItems) {
		for (const tag of tags) {
			if (item.data && item.data[tag]) {
				item.remove();
			}
		}
	}
}


export function removePaperItemsByTags(tags) {
	const allItems = getAllPaperItems(true);
	for (const item of allItems) {
		for (const tag of tags) {
			if (item[tag]) {
				item.remove();
			}
		}
	}
}


export function processFileInput(dataType ,input, callback) {
	const reader = new FileReader();
	
	if (dataType === 'text') {
		reader.readAsText(input.files[0]);
		
	} else if (dataType === 'dataURL') {
		reader.readAsDataURL(input.files[0]);
	}
	
	reader.onload = function() {
		callback(reader.result);
	};
}


export function executeFunctionByName(functionName, context, ...args) {
	const namespaces = functionName.split(".");
	const func = namespaces.pop();
	for (let i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func](...args);
}
