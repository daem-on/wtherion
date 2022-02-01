import paper from "paper";

export function isBoundsItem(item) {
	if( item.className === 'PointText' || 
		item.className === 'Shape' ||
		item.className === 'PlacedSymbol' ||
		item.className === 'Raster') {
		return true;
		
	} else {
		return false;
	}
};


export function isPathItem(item: paper.Item): item is paper.Path {
	return item.className === 'Path';
};


export function isCompoundPathItem(item: paper.Item): item is paper.CompoundPath {
	return item.className === 'CompoundPath';
};


export function isGroupItem(item: paper.Item): item is paper.Group {
	return item && item.className && item.className === 'Group';
};


export function isPointTextItem(item) {
	return item.className === 'PointText';
};


export function isLayer(item: paper.Item): item is paper.Layer {
	return item.className === 'Layer';
};


export function isPGTextItem(item) {
	return getRootItem(item).data.isPGTextItem;
};


export function setPivot(item, point) {
	if(isBoundsItem(item)) {
		item.pivot = item.globalToLocal(point);
	} else {
		item.pivot = point;
	}
};


export function getPositionInView(item) {
	var itemPos = new paper.Point(0, 0);
	itemPos.x = item.position.x - paper.view.bounds.x;
	itemPos.y = item.position.y - paper.view.bounds.y;
	return itemPos;
};


export function setPositionInView(item, pos) {
	item.position.x = paper.view.bounds.x + pos.x;
	item.position.y = paper.view.bounds.y + pos.y;
};

export function getRootItem(item) {
	if(item.parent.className === 'Layer') {
		return item;
	} else {
		return getRootItem(item.parent);
	}
};