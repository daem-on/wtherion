import "jquery-ui/ui/widgets/sortable";
import * as wtConfig from "../src/configManagement";

let mode = "normal";

export function toggleMode() {
	mode = mode === "xvi" ? "normal" : "xvi";

	jQuery("#paperCanvas").toggleClass("xviMode", mode === "xvi");
	jQuery("#modeInfo").toggleClass('hidden', mode !== "xvi");

	updateLayerList();
}

export function toggleVisibility() {
	var $panel = jQuery('.layerPanel');
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
};


function setup() {
	
	var $panel = jQuery('<div class="layerPanel">');
	var baseTopOffset = jQuery('.appNav').height();
	$panel.css({
		'top': baseTopOffset+'px',
		'max-height': jQuery(window).height()-baseTopOffset+'px' 
	});
	var $header = jQuery('<header class="layerPanelHeader"><h2>Scraps</h2></header>');
	var $newLayerButton = jQuery('<button class="newLayerButton">Add</button>');
	
	$newLayerButton.on("click", function() {
		var newLayer = pg.layer.addNewLayer();
		pg.selection.clearSelection();
		updateLayerList();
	});
	
	$header.append($newLayerButton);

	var $layerEntries = jQuery('<div class="layerEntries">');
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
};


function setupLayerEntry(layer) {
	let isGuide = (layer.data && layer.data.isGuideLayer);
	let isXVI = (layer.data && layer.data.xviLayer);
	if (mode === "normal" && isGuide
		|| mode === "xvi" && !isXVI) return;

	var $activeClass = '';
	if(pg.layer.isActiveLayer(layer)) {
		$activeClass= ' active';
	}
	var $layerEntry = jQuery('<ul class="layerEntry'+$activeClass+'" data-layer-id="'+layer.data.id+'">');
	var $layerVisSection = jQuery('<li class="layerVisSection">');
	var $layerVisButton = jQuery('<input type="checkbox" class="layerVisibilityToggle" title="Layer visibility">').attr('checked', layer.visible);
	var $layerNameSection = jQuery('<li class="layerName" title="">');
	var $layerNameInput = jQuery('<input type="text">').val(layer.name);
	var $layerActionSection = jQuery('<li class="layerActions">');
	var $layerDeleteButton = jQuery('<button class="layerDeleteButton" data-layer-id="'+layer.data.id+'" title="Delete layer">&times;</button>');
	var $layerInfo = jQuery('<li class="layerInfo" title="Selected 0/0 Total">i</li>');
	var $layerSelectSection = jQuery('<li class="layerSelectSection">');
	var $layerSelectButton = jQuery('<input type="radio" class="layerSelectToggle" title="Select all/none">');
	
	$layerEntry.on("click", function() {
		setActiveLayerEntry(layer);
	});
	
	$layerVisButton.on("click", function() {
		layer.visible = !layer.visible;
	});
	
	if (wtConfig.get("lockLayerNames")) {
		$layerNameInput.attr('disabled', true);
	}
	
	
	$layerNameInput.on('change', function() {
		layer.name = jQuery(this).val();
	});
	
	$layerDeleteButton.on("click", function() {
		if(confirm('Delete this layer and all its children?')) {
			pg.layer.deleteLayer(jQuery(this).attr('data-layer-id'));
			updateLayerList();
		};
	});

	$layerSelectButton.on("click", function() {
		if(jQuery(this).attr('checked')) {
			pg.selection.clearSelection();
			jQuery(this).removeAttr('checked');

		} else {
			pg.selection.clearSelection();
			jQuery('.toolOptionPanel').remove();

			var items = pg.helper.getPaperItemsByLayerID(layer.data.id);
			jQuery.each(items, function(index, item) {
				pg.selection.setItemSelection(item, true);
			});
			jQuery(this).attr('checked', items.length >0);
		}
	});

	$layerVisSection.append($layerVisButton);
	$layerNameSection.append($layerNameInput);
	if(!layer.data.isDefaultLayer) {
		$layerActionSection.append($layerDeleteButton);
	}
	$layerSelectSection.append($layerSelectButton);
	$layerEntry.append($layerVisSection, $layerNameSection, $layerActionSection, $layerInfo, $layerSelectSection);
	jQuery('.layerEntries').prepend($layerEntry);
};


function setActiveLayerEntry(layer) {
	jQuery('.layerEntry').removeClass('active');
	pg.layer.setActiveLayer(layer);
	jQuery('.layerEntry[data-layer-id="'+layer.data.id+'"]').addClass('active');
};


function handleLayerOrderChange() {
	var order = [];
	jQuery('.layerEntries').children().each(function() {
		order.push(jQuery(this).attr('data-layer-id'));
	});
	pg.layer.changeLayerOrderByIDArray(order);
};


export function updateLayerList() {
	jQuery('.layerEntries').empty();
	jQuery('.newLayerButton').toggleClass('hidden', mode !== "normal");
	jQuery.each(paper.project.layers, function(index, layer) {
		setupLayerEntry(layer);
	});
	
};

function updateLayerValues() {
	jQuery('.layerEntry').each(function() {
		var id = parseInt(jQuery(this).attr('data-layer-id'));
		var layer = pg.layer.getLayerByID(id);
		if(layer) {
			
			var selectedItems = 0;
			jQuery.each(layer.children, function(index, child) {
				if(child.selected || child.fullySelected) {
					selectedItems++;
				}
			});

			var $entry = jQuery(this);
			$entry.find('.layerInfo').attr('title','Selected '+selectedItems+'/'+layer.children.length+' Total');

			if(layer.children.length > 0 && selectedItems === layer.children.length) {
				$entry.find('.layerSelectToggle').prop('checked', true);
			} else {
				$entry.find('.layerSelectToggle').prop('checked', false);
			}
		}
	});
};
