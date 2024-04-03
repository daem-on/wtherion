import paper from "paper";
import { getSelectionType } from "./selection";

export function setup() {
	setupZoomSelect();
}

export function setupZoomSelect() {
	jQuery<HTMLSelectElement>('#zoomSelect').change(function() {
		paper.view.zoom = +this.value;
		update();
		this.value = '';
		this.blur();
	});
}

export function showCustom(customText) {
	jQuery('#selectionTypeLabel').html(customText).removeClass('none');
}

export function update() {
	jQuery('#zoomInput').val(Math.round(paper.view.zoom*100));
	
	const selectionType = getSelectionType();
	if (selectionType != null) {
		jQuery('#selectionTypeLabel').html(selectionType).removeClass('none');
	} else {
		jQuery('#selectionTypeLabel').html('No selection').addClass('none');
	}
}
