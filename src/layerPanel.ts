import "jquery-ui/ui/widgets/sortable";
import paper from "paper";
import * as layers from "../js/layer";
import editTH2 from "./editTH2";
import * as wtConfig from "./filesio/configManagement";
import * as selection from "./selection";

let mode = "normal";

export function toggleMode() {
	mode = mode === "xvi" ? "normal" : "xvi";

	jQuery("#paperCanvas").toggleClass("xviMode", mode === "xvi");
	jQuery("#modeInfo").toggleClass('hidden', mode !== "xvi");

	// auto-activate the first qualified layer
	for (const layer of paper.project.layers) {
		if ((mode === "xvi" && (layer.data?.xviLayer)) 
		|| (mode === "normal" && !layer.data?.xviLayer)) {
			layer.activate();
			break;
		}
	}

	updateLayerList();
}

export function toggleVisibility() {
	const $panel = jQuery('.layerPanel');
	if(!$panel || $panel.length <= 0) {
		setup();
		
	} else {
		if($panel.hasClass('hidden')) {
			$panel.removeClass('hidden');
			updateLayerList();
		} else {
			$panel.addClass('hidden');
		}
	}
}


export function setup() {
	
	const $panel = jQuery('<div class="layerPanel">');
	const baseTopOffset = jQuery('.appNav').height();
	$panel.css({
		'top': baseTopOffset+'px',
		'max-height': jQuery(window).height()-baseTopOffset+'px' 
	});
	const $header = jQuery('<header class="layerPanelHeader"><h2>%scraps%</h2></header>');
	const $newLayerButton = jQuery('<button class="newLayerButton">%scraps.add%</button>');
	
	$newLayerButton.on("click", function() {
		const newLayer = layers.addNewLayer();
		selection.clearSelection();
		updateLayerList();
	});
	
	$header.append($newLayerButton);

	const $layerEntries = jQuery('<div class="layerEntries">');
	$layerEntries.sortable({
		containment: 'parent',
		forcePlaceholderSize: true,
		tolerance: 'pointer',
		delay: 300,
		stop: function(event, ui) {
			handleLayerOrderChange();
		}
	});
	
	$panel.append($header,$layerEntries);
	jQuery('body').append($panel);
	
	$layerEntries.css({
		'max-height': jQuery('body').height() - baseTopOffset - $header.height()+'px'
	});

	updateLayerList();
	
	updateLayerValues();
	
	jQuery(document).on('LayerAdded LayerRemoved', function() {
		updateLayerList();
	});
	
	jQuery(document).on('keyup keydown mouseup mousedown', function(){
		updateLayerValues();
	});
}


function setupLayerEntry(layer: paper.Layer) {
	const isGuide = (layer.data && layer.data.isGuideLayer);
	const isXVI = (layer.data && layer.data.xviLayer);
	if (mode === "normal" && isGuide
		|| mode === "xvi" && !isXVI) return;

	let $activeClass = '';
	if(layers.isActiveLayer(layer)) {
		$activeClass= ' active';
	}
	const $layerEntry = jQuery('<ul class="layerEntry'+$activeClass+'" data-layer-id="'+layer.data.id+'">');
	const $layerVisSection = jQuery('<li class="layerVisSection">');
	const $layerVisButton = jQuery('<input type="checkbox" class="layerVisibilityToggle" title="Layer visibility">').attr('checked', layer.visible.toString());
	const $layerNameSection = jQuery('<li class="layerName" title="">');
	const $layerNameInput = jQuery('<input type="text">').val(layer.name);
	const $layerActionSection = jQuery('<li class="layerActions">');
	const $layerDeleteButton = jQuery('<button class="layerDeleteButton" data-layer-id="'+layer.data.id+'" title="Delete layer">&times;</button>');
	const $layerInfo = jQuery('<li class="layerInfo" title="Selected 0/0 Total">0/0</li>');

	$layerEntry.on("click", function() {
		setActiveLayerEntry(layer);
	});
	
	$layerVisButton.on("click", function() {
		layer.visible = !layer.visible;
	});
	
	if (wtConfig.get("lockLayerNames")) {
		$layerNameInput.attr("disabled", "disabled");
	}
	
	
	$layerNameInput.on('change', function() {
		layer.name = $layerNameInput.val() as string;
	});
	
	$layerDeleteButton.on("click", function() {
		if(confirm('%scraps.delete.confirm%')) {
			if (layer.data.isDefaultLayer) layer.removeChildren();
			else {
				layers.deleteLayer(jQuery(this).attr('data-layer-id'));
				updateLayerList();
			}
		}
	});

	$layerVisSection.append($layerVisButton);
	$layerNameSection.append($layerNameInput);
	$layerActionSection.append($layerDeleteButton);
	// $layerSelectSection.append($layerSelectButton);
	$layerEntry.append($layerVisSection, $layerNameSection, $layerActionSection, $layerInfo);
	jQuery('.layerEntries').prepend($layerEntry);
}


function setActiveLayerEntry(layer: paper.Layer) {
	jQuery('.layerEntry').removeClass('active');
	layers.setActiveLayer(layer);
	editTH2.updateInactiveScraps();
	jQuery('.layerEntry[data-layer-id="'+layer.data.id+'"]').addClass('active');
}


function handleLayerOrderChange() {
	const order = [];
	jQuery('.layerEntries').children().each(function() {
		order.push(jQuery(this).attr('data-layer-id'));
	});
	layers.changeLayerOrderByIDArray(order);
}


export function updateLayerList() {
	jQuery('.layerEntries').empty();
	jQuery('.newLayerButton').toggleClass('hidden', mode !== "normal");
	jQuery.each(paper.project.layers, function(index, layer) {
		setupLayerEntry(layer);
	});
	updateLayerValues();
	editTH2.updateInactiveScraps();
}

function updateLayerValues() {
	if (jQuery('.layerPanel').hasClass('hidden')) return;
	jQuery('.layerEntry').each(function() {
		const id = parseInt(jQuery(this).attr('data-layer-id'));
		const layer = layers.getLayerByID(id);
		if(layer) {
			
			let selectedItems = 0;
			jQuery.each(layer.children, function(index, child) {
				if(child.selected || (child as paper.Path).fullySelected) {
					selectedItems++;
				}
			});

			const $entry = jQuery(this);
			$entry.find(".layerInfo")
				.text(`${selectedItems}/${layer.children.length}`)
				.attr("title",`Selected ${selectedItems}/${layer.children.length} Total`);

		}
	});
}
