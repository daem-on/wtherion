import "jquery-ui/ui/widgets/selectmenu";

export function convertCustomLineInput(selectInput: JQuery<HTMLSelectElement>) {

	if (!selectInput.length) return;
	// for (const item of list) {
	// 	let $opt = jQuery('<option value="'+item+'">'+item+'</option>');
	// 	selectInput.append($opt);
	// }
	// console.log(selectInput);

	let instance = selectInput.selectmenu({
		change:  ()=> {selectInput.trigger("change")},
	}).data("ui-selectmenu");

	instance.menu.addClass("limited-height");

	instance._renderItem = function( ul, item ) {
		let li = jQuery( "<li>" );
		let wrapper = jQuery( "<div>", {
				title: item.element.attr( "title" )
			} );

		if ( item.disabled ) {
			this._addClass( li, null, "ui-state-disabled" );
		}
		this._setText( wrapper, item.label );
		wrapper.prepend(
			jQuery(`<img src='assets/rendered/${item.label}.svg'>`)
			.addClass("crop-svg")
		);
		return li.append( wrapper ).appendTo( ul );
	}

}