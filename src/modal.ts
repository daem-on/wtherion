import { Component, computed, markRaw, ref } from "vue";

export function notice(msg, type) {
	const $fader = jQuery('<div class="modal fader admin">');
	const $container = jQuery('<div class="container '+type+'">');
	const $header = jQuery('<h2 class="modalTitle">Notice</h2>');
	const $okButton = jQuery('<button class="okButton adminButton">Ok</button>');
	if (type === 'error') {
		$header.text('Error');
	}
	const $message = jQuery('<p>'+msg+'</p>');

	$fader.append($container);
	$container.append($header);
	$container.append($message);
	$container.append($okButton);
	
	$fader.appendTo(jQuery('body'));
	$container.css({
		'margin-top': -$container.outerHeight()*0.5+'px' 
	});
	
	$okButton.click(function() {
		$fader.remove();
	});
}

export function floater(id, title, html, width?, top?) {
	if (jQuery('#'+id).length > 0) return;
	
	const $container = jQuery('<div id="'+id+'" class="modal floater">');
	const $header = jQuery('<header>');
	const $body = jQuery('<div class="floaterBody">');
	const $title = jQuery('<h2>'+title+'</h2>');
	const $closeButton = jQuery('<button class="closeButton" title="Close">&times;</button>');
	const $message = jQuery(html);

	$header.append($title,$closeButton);
	$body.append($message);
	$container.append($header, $body);
	$container.appendTo(jQuery('body'));
	
	$container.css({
		'width': width,
		'left': jQuery('body').width()*0.5 - width*0.5 + 40,
		'top': top
	});
	
	$closeButton.on("click", function() {
		$container.remove();
	});

}


export function confirm(msg, title, callback) {
	const $fader = jQuery('<div class="modal fader admin">');
	const $container = jQuery('<div class="container confirm">');
	const $header = jQuery('<h2 class="modalTitle">'+title+'</h2>');
	const $message = jQuery('<p>'+msg+'</p>');
	
	const $yesButton = jQuery('<button class="yesButton adminButton">Yes</button>');
	const $noButton = jQuery('<button class="noButton adminButton">No</button>');
	
	$fader.append($container);
	$container.append($header);
	$container.append($message);
	$container.append($yesButton);
	$container.append($noButton);
	
	$fader.appendTo(jQuery('body'));
	$container.css({
		'margin-top': -$container.outerHeight()*0.5+'px' 
	});
	
	$yesButton.click(function() {
		callback();
		$fader.remove();
	});
	
	$noButton.click(function() {
		$fader.remove();
	});
}


export function form(html, title, callback) {
	const $fader = jQuery('<div class="modal fader admin">');
	const $container = jQuery('<div class="container form">');
	const $header = jQuery('<h2 class="modalTitle">'+title+'</h2>');
	const $content = jQuery(html);
	
	const saveButton = jQuery('<button class="saveButton adminButton">Save</button>');
	const cancelButton = jQuery('<button class="cancelButton adminButton">Cancel</button>');
	
	$fader.append($container);
	$container.append($header);
	$container.append($content);
	$container.append(saveButton);
	$container.append(cancelButton);
	
	$fader.appendTo(jQuery('body'));
	$container.css({
		'margin-top': -$container.outerHeight()*0.5+'px' 
	});
	
	saveButton.click(function() {
		callback(html);
		$fader.remove();
	});
	
	cancelButton.click(function() {
		$fader.remove();
	});
	
	setTimeout(function() {
		$container.css({
			'margin-top': -$container.outerHeight()*0.5+'px' 
		});
	}, 10);
}

export type DialogData<T> = { id: string, title: string, content: T };
export type DialogComponent<T> = Component<{ data: DialogData<T> }>;

const activeDialogs = ref(new Map<string, { component: DialogComponent<any>, data: DialogData<any> }>());
export const activeDialogList = computed(() => Array.from(activeDialogs.value.values()));

export function addDialog<T>(component: DialogComponent<T>, data: DialogData<T>): void {
	component = markRaw(component);
	activeDialogs.value.set(data.id, { component, data });
}

export function removeDialog(id: string): void {
	activeDialogs.value.delete(id);
}