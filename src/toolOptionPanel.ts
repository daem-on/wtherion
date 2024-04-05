import * as tools from "./tools";
import {constructSelect} from "../src/objectSettings/customToolbarInput";

type ComponentType = "int" | "list" | "float" | "text" | "button" | "boolean" |
"nullable-boolean" | "title" | "customList" | "textarea";

type component = {
	type?: ComponentType
	min?: number,
	max?: number,
	label?: string,
	options?: string[],
	optionValuePairs?: [name: string, value: string|number][],
	click?: () => void,
	maxWidth?: any,
	minWidth?: number,
	text?: string,
	tooltip?: string,
	imageRoot?: string,
	requirements?: {
		[reqKey: string]: any
	},
}

export type componentList<T> = {
	[componentName in keyof T]: component;
}

type optionsType = {
	[key: string]: any;
};

export default {
	
	setup(options: optionsType, components: componentList<optionsType>, changeCallback: () => void, title?: string) {
		const panelTitle = title || options.name || "Settings";
		
		const $panel = jQuery('<div class="toolOptionPanel">');
		const $title = jQuery(`<h3 class="panelTitle">${panelTitle}</h3>`);
		const $options = jQuery('<div class="options">');
		
		let lastSubSection: JQuery<HTMLElement> = null;
		jQuery.each(components, function(key: string, comp) {
			const $optionSection = jQuery(`<div class="option-section" data-id="${key}">`);
			const $label = jQuery(`<label for="${key}">${comp.label}</label>`);
			let $input: JQuery<HTMLInputElement>;
			let $button: JQuery<HTMLButtonElement>;
			let $sectionTitle: JQuery<HTMLTitleElement>;

			if (comp.tooltip) $label.attr("title", comp.tooltip);

			switch (comp.type) {
			case 'boolean':
				$input = jQuery(`<input type="checkbox" name="${key}">`);
				if(options[key]) {
					$input.prop('checked', true);
				}

				break;
			case 'nullable-boolean':
				$input = jQuery(`<input type="checkbox" name="${key}">`);
				if(options[key] === true) {
					$input.prop("checked", true);
				} else if (options[key] == null) {
					$input.prop("indeterminate", true);
					$input.prop("readonly", true);
				}
				$input.on("click", nullableCheckboxCallback);

				break;
			case 'float':
			case 'int':
				$input = jQuery(`<input type="number" data-type="${comp.type}" name="${key}" value="${options[key]}">`);
				$input.attr("min", comp.min);

				break;
			case 'list':
				$input = jQuery(`<select data-type="${comp.type}" name="${key}">`);

				if (comp.options) {
					for (const value of comp.options) {
						$input.append(createOption(value, value, options[key]));
					}
				} else if (comp.optionValuePairs) {
					for (const [display, value] of comp.optionValuePairs)
						$input.append(createOption(value, display, options[key]));
				}

				if(comp.maxWidth) $input.css({'maxWidth': comp.maxWidth+'px'});

				break;
			case 'customList':
				const $wrapper = jQuery(`<div class="custom-select"></div>`);
				$input = jQuery(`<input name="${key}">`);
				$input.val(options[key] ?? "");
				const $options = jQuery(`<div class="customListOptions"></div>`);

				if (comp.options) {
					for (const value of comp.options)
					$options.append(createOption(value, value, options[key]));
				}
				$wrapper.append($input, $options);
				constructSelect($wrapper[0] as HTMLDivElement, options[key], comp.imageRoot);
				break;
			case 'text':
				$input = jQuery(`<input type="text" id="textToolInput" data-type="${comp.type}" name="${key}">`);
				$input.val(options[key] ?? "");

				break;
			case 'button':
				$button = jQuery(`<button>${comp.label}</button>`);

				break;
			case 'title':
				$sectionTitle = jQuery(`<h4>${comp.text} ⯆</h4>`);
				$optionSection.addClass('titleSection collapsed');
				break;
			case 'textarea':
				$input = jQuery(`<textarea name="${key}">${options[key] ?? ""}</textarea>`);
				$optionSection.addClass('vertical');
				break;
			}

			if ($input && comp.minWidth) {
				$input.css({'minWidth': comp.minWidth+'px'});
			}

			if($input) {
				// handle input changes by the user
				$input.on('keyup blur change mousewheel', function(e) {
					let val;
					if(e.target.type === 'checkbox') {
						val = 
							e.target.indeterminate ? null :
							e.target.checked;
					} else if (e.target.type === "text" || e.target.type === "textarea") {
						val = e.target.value;
					} else if(e.target.type === 'number') {
						const dataType = e.target.dataset.type;

						if(dataType === 'int') {
							val = parseInt(e.target.value);
							const min = parseInt(jQuery(this).attr('min'));

							if(!jQuery.isNumeric(val)) {
								val = min;
							} else if(min != null && min > val) {
								val = min;
								jQuery(this).val(min);
							}

						} else if(dataType === 'float') {
							val = parseFloat(e.target.value);
							const min = parseFloat(jQuery(this).attr('min'));
							if(!jQuery.isNumeric(val)) {
								val = min;
							} if(min != null && min > val) {
								val = min;
								jQuery(this).val(min);
							}
						}

					} else if(e.target.type === 'select-one') {
						val = e.target.value;
						val = asNumOrString(val);
					}

					// set values for tool and save in local options
					options[key] = val;
					// pg.tools.setLocalOptions(options);

					processInputRequirements();
					changeCallback();
				});
			}

			if($button) {
				$button.on("click", function() {
					if (comp.click) comp.click();
				});
			}
			if($sectionTitle) {
				$optionSection.append($sectionTitle);
				$optionSection.addClass("options");

				$sectionTitle.on("click", function() {
					const p = jQuery(this).parent();
					if (p.hasClass("collapsed")) p.removeClass("collapsed");
					else p.addClass("collapsed");
				});

				lastSubSection = $optionSection;
				$options.append($optionSection);
				return;
			}
			if($input) {
				if (comp.type === 'customList') {
					$optionSection.append($label, $input.parent()[0]);
				} else
				$optionSection.append($label, $input);
			} else if($button) {
				$optionSection.append($button);
			} else if (!$sectionTitle) {
				$optionSection.append($label);
			}

			(lastSubSection || $options).append($optionSection);

			// if ($input && comp.type == "customList") {
			// 	constructSelect($input.parent()[0] as HTMLDivElement, comp.imageRoot);
			// }
		});

		const $resetButton = jQuery('<button class="toolOptionResetButton" title="Reset Tool Settings">R</button>').click(function() {
			if(confirm('Reset tool options to default?')) {
				tools.deleteLocalOptions(options.id);
				tools.switchTool(options.id, { force: true });
			}
		});
		$title.append($resetButton);
		$panel.append($title, $options);
		processInputRequirements();
		
		// shows/hides option-sections based on predefined requirements
		function processInputRequirements() {
			for (const name in components) {
				const requirements = components[name].requirements;
				if (requirements) {
					for (const reqkey in requirements) {
						$options
						.children(`.option-section[data-id="${name}"]`)
						.toggleClass(
							"hidden",
							!compareInputRequirement(
								options[reqkey], requirements[reqkey]
							)
						);
					}
				}
			}
		}
		
		return $panel;
	},

	setupFloating(options: optionsType, components: componentList<optionsType>, changeCallback: () => void, title?: string) {
		const $panel = this.setup(options, components, changeCallback, title);
		
		jQuery('body').append($panel);

		return $panel;
	},
	
	update(options: optionsType) {
		jQuery.each(options, function(key: string, opt) {
			const $el = jQuery(`[name="${key}"]`);
			if($el.attr('data-type') === 'int') {
				$el.val(opt);
			} else if($el.attr('data-type') === 'float') {
				$el.val(opt);
			} else if( $el.attr('data-type') === 'text') {
				$el.val(opt);
			} else if($el.attr('data-type') === 'list'){
				$el.val(opt);
			}
		});
	}
	
};


function nullableCheckboxCallback(event: JQuery.ClickEvent<HTMLInputElement, undefined, HTMLInputElement, HTMLInputElement>) {
	const cb = event.target;
	if (cb.readOnly) cb.checked=cb.readOnly=false;
	else if (!cb.checked) cb.readOnly=cb.indeterminate=true;
}

function compareInputRequirement(value: any, requirement: any) {
	if (Array.isArray(requirement)) return requirement.includes(value);
	else return value === requirement;
}

function createOption(value: string | number, display: string, selected: string | number) {
	if (typeof value === "string" && value.startsWith("**")) {
		const $category = jQuery(`<optgroup label="${value.substring(2)}" />`);
		return $category;
	}

	const $opt = jQuery(`<option value="${value}">${display}</option>`);
	if (value === selected) $opt.prop('selected', true);
	return $opt;
}

function asNumOrString(val: string) {
	if (/^\d+$/.test(val)) return Number.parseInt(val);
	return val;
}