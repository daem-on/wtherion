module.exports = function() {
	
	var setup = function() {
		setupZoomSelect();
	};
	
	
	var setupZoomSelect = function() {
		jQuery('#zoomSelect').change(function() {
			paper.view.zoom = this.value;
			update();
			this.value = '';
			this.blur();
		});
	};
	
	var showCustom = function(customText) {
		jQuery('#selectionTypeLabel').html(customText).removeClass('none');
	}
	
	var update = function() {
		jQuery('#zoomInput').val(Math.round(paper.view.zoom*100));
		
		var selectionType = pg.selection.getSelectionType();
		if (selectionType !== null) {
			jQuery('#selectionTypeLabel').html(selectionType).removeClass('none');
		} else {
			jQuery('#selectionTypeLabel').html('No selection').addClass('none');
		}
	};

	
	return {
		setup: setup,
		update: update,
		showCustom: showCustom,
	};
	
}();