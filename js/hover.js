
module.exports = function() {

	var hoveredItem;
	var hitResultItem;
	var handleHoveredItem = function(hitOptions, event) {
		var hitResult = paper.project.hitTest(event.point, hitOptions);
		if(hitResult) {
			if(
				(hitResult.item.data && hitResult.item.data.noHover)
				|| hitResult.item.layer != paper.project.activeLayer
			) {
				clearHoveredItem();
				return;
			}
			if(hitResult !== hoveredItem) {
				clearHoveredItem();
			}
			if(	hoveredItem === undefined && hitResult.item.selected === false) {
				hitResultItem = hitResult.item;
				if(pg.item.isBoundsItem(hitResult.item)) {
					hoveredItem = pg.guides.hoverBounds(hitResult.item);

				} else if(pg.group.isGroupChild(hitResult.item)) {
					hoveredItem = pg.guides.hoverBounds(pg.item.getRootItem(hitResult.item));
					
				} else {
					hoveredItem = pg.guides.hoverItem(hitResult);
				}
			}
		} else {
			clearHoveredItem();
		}
	};
	
	var clearHoveredItem = function() {
		hitResultItem = undefined;
		if(hoveredItem !== undefined) {
			hoveredItem.remove();
			hoveredItem = undefined;
		}
		paper.view.update();
	};
	
	
	return {
		handleHoveredItem: handleHoveredItem,
		clearHoveredItem: clearHoveredItem,
		getHoveredItem: () => hitResultItem,
	};
}();