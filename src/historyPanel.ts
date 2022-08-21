import {getHead, getStates, clear, undo, redo, moveHeadTo} from "./undo";

export function setup() {
	const $panel = jQuery("<div id='historyPanel' class='hidden'>");
	const $header = jQuery("<header class='historyPanelHeader'><h2>%history%</h2></header>");

	$header.append(jQuery("<div class='divider'>"));

	const $undo = jQuery("<button class='undo'>Undo</button>");
	$undo.on("click", undo);
	
	const $redo = jQuery("<button class='redo'>Redo</button>");
	$redo.on("click", redo);
	
	$header.append($undo);
	$header.append($redo);
	$panel.append($header);

	const $entriesContainer = jQuery("<div class='entriesContainer'>");
	$panel.append($entriesContainer);

	jQuery("body").append($panel);

	jQuery(document).on("HistoryChanged Snapshot", function() {
		updateEntries($entriesContainer);
	});
	updateEntries($entriesContainer);
}

function updateEntries(container: JQuery) {
	if (container.parent().hasClass("hidden")) return;

	const entries = getStates();
	container.empty();
	
	for (let i = entries.length-1; i >= 0; i--) {
		const entry = entries[i];
		const $label = jQuery(`<div class='historyEntry'>${entry.type}</div>`);

		$label.on("click", function() {
			moveHeadTo(i);
			updateEntries(container);
		});
		if (i === getHead()) {
			$label.addClass("active");
		}

		container.append($label);
	}


}