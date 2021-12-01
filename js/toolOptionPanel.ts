import "jquery-ui/ui/widgets/draggable";
import pg from "../src/init";
import {convertCustomLineInput} from "./customToolbarInput";

type component = {
	type?: "int" | "list" | "float" | "text" | "button" | "boolean" | "title" | "customLine",
	min?: any,
	max?: any,
	label?: any,
	options?: any,
	click?: any,
	maxWidth?: any,
	minWidth?: any,
	text?: any,
	requirements?: any,
}

export type componentList = {
	[componentName: string]: component
}

export default {
	
	setup(options, components: componentList, changeCallback: () => void) {
		var $panel = jQuery('<div class="toolOptionPanel">');
		var $title = jQuery('<h3 class="panelTitle">'+options.name+'</h3>');
		var $options = jQuery('<div class="options">');
		
		let lastSubSection: JQuery<HTMLElement> = null;
		jQuery.each(components, function(key: string, comp) {
			var $optionSection = jQuery('<div class="option-section" data-id="'+key+'">');
			var $label = jQuery('<label for="'+key+'">'+comp.label+'</label>');
			var $input: JQuery<HTMLInputElement>;
			var $button: JQuery<HTMLButtonElement>;
			var $sectionTitle: JQuery<HTMLTitleElement>;
			if(comp.type == 'boolean') {
				$input = jQuery('<input type="checkbox" name="'+key+'">');
				if(options[key]) {
					$input.prop('checked', true);
				}

			} else if(comp.type == 'int' || comp.type == 'float') {
				var minAttr = '';
				if(comp.min != undefined && comp.type == 'int') {
					minAttr = ' min="'+parseInt(comp.min)+'"';
					
				} else if(comp.min != undefined && comp.type == 'float') {
					minAttr = ' min="'+parseFloat(comp.min)+'"';
				}
				$input = jQuery('<input type="number" data-type="'+comp.type+'" name="'+key+'" value="'+options[key]+'"'+minAttr+'>');
				
			} else if(comp.type == 'list' || comp.type == 'customLine') {
				$input = jQuery('<select data-type="'+comp.type+'" name="'+key+'">');
				jQuery.each(comp.options, function(index, value) {
					var $opt = jQuery('<option value="'+value+'">'+value+'</option>');
					if(value == options[key]) {
						$opt.prop('selected', true);
					}
					if(comp.maxWidth) {
						$input.css({'maxWidth': comp.maxWidth+'px'});
					}
					$input.append($opt);
				});
				
			} else if(comp.type == 'text') {
				$input = jQuery('<input type="text" id="textToolInput" data-type="'+comp.type+'" name="'+key+'" value="">');
				
			} else if(comp.type == 'button') {
				$button = jQuery('<button data-click="'+comp.click+'">'+comp.label+'</button>');
				
			} else if(comp.type == 'title') {
				$sectionTitle = jQuery('<h4>'+comp.text+'</h4>');
				$optionSection.addClass('titleSection');
			}
			
			if($input) {
				// handle input changes by the user
				$input.on('keyup blur change mousewheel', function(e) {
					var val;
					if(e.target.type == 'checkbox') {
						val = e.target.checked;

					} else if(e.target.type == 'number') {
						var dataType = e.target.dataset.type;

						if(dataType == 'int') {
							val = parseInt(e.target.value);
							var min = parseInt(jQuery(this).attr('min'));

							if(!jQuery.isNumeric(val)) {
								val = min;
							} else if(min != undefined && min > val) {
								val = min;
								jQuery(this).val(min);
							}

						} else if(dataType == 'float') {
							val = parseFloat(e.target.value);
							var min = parseFloat(jQuery(this).attr('min'));
							if(!jQuery.isNumeric(val)) {
								val = min;
							} if(min != undefined && min > val) {
								val = min;
								jQuery(this).val(min);
							}
						}

					} else if(e.target.type == 'select-one') {
						val = e.target.value;
					}

					// set values for tool and save in local options
					options[key] = val;
					pg.tools.setLocalOptions(options);

					processInputRequirements();
					changeCallback();
				});
			};
			
			if($button) {
				$button.click(function() {
					var func = jQuery(this).attr('data-click');
					pg.helper.executeFunctionByName(func, window);
				});
			}
			if($sectionTitle) {
				$optionSection.append($sectionTitle);
				$optionSection.addClass("options");

				$sectionTitle.on("click", function() {
					let p = jQuery(this).parent();
					if (p.hasClass("collapsed")) p.removeClass("collapsed")
					else p.addClass("collapsed")
				});

				lastSubSection = $optionSection;
				$options.append($optionSection);
				return;
			}
			if($input) {
				$optionSection.append($label, $input);
			} else if($button) {
				$optionSection.append($button);
			}
			
			(lastSubSection || $options).append($optionSection);
		});

		var $resetButton = jQuery('<button class="toolOptionResetButton" title="Reset Tool Settings">R</button>').click(function() {
			if(confirm('Reset tool options to default?')) {
				pg.tools.deleteLocalOptions(options.id);
				pg.toolbar.switchTool(options.id, true);
			}
		});
		$title.append($resetButton);
		$panel.append($title, $options);
		jQuery('body').append($panel);
		
		$panel.css({
			'min-width': $title.outerWidth()+30+'px'
		});
		$panel.draggable({
			containment: '#paperCanvas',
			handle: '.panelTitle'
		});
		processInputRequirements();
		
		// shows/hides option-sections based on predefined requirements
		function processInputRequirements() {
			jQuery.each(components, function(reqid, comp){
				if(comp.requirements) {
					jQuery.each(comp.requirements, function(reqkey, req){
						var $el = jQuery('.option-section[data-id="'+reqid+'"]');
						if(options[reqkey] == req) {
							$el.removeClass('hidden');
						} else {
							$el.addClass('hidden');
						}
					});
				}
			});
		};

		convertCustomLineInput(
			$panel.find("[data-type='customLine']") as any
		);
		
		return $panel;
	},
	
	update(options) {
		jQuery.each(options, function(key: string, opt) {
			var $el = jQuery('[name="'+key+'"]');
			if($el.attr('data-type') == 'int') {
				$el.val(parseInt(opt));
			} else if($el.attr('data-type') == 'float') {
				$el.val(parseFloat(opt));
			} else if( $el.attr('data-type') == 'text') {
				$el.val(opt);
			} else if($el.attr('data-type') == 'list'){
				$el.val(opt);
			}
		});
	}
	
}