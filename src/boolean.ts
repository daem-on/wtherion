import { getActiveLayer } from "./layer";
import { getSelectedItems } from "./selection";
import { snapshot } from "./undo";

export function booleanUnite(items, replaceWithResult?) {
	items = items || getSelectedItems();
	replaceWithResult = replaceWithResult || true;
	
	let result;
	for(let i=0; i<items.length; i++) {
		if(i === 0) {
			result = items[0];
		}
		const temp = items[i].unite(result, {insert:false});
		result.remove();
		result = temp;
		items[i].remove();
	}
	
	if(replaceWithResult) {
		applyReplaceWithResult(items, result);
	}
	
	return result;
}


export function booleanIntersect(items, replaceWithResult) {
	items = items || getSelectedItems();
	replaceWithResult = replaceWithResult || true;
	
	let main;
	let result;
	for(let i=0; i<items.length; i++) {
		if(i === 0) {
			main = items[0];
		} else {
			result = items[i].intersect(main, {insert:false});
			if(i+1 < items.length) {
				main = result;
			}
		}
		main.remove();
		items[i].remove();
	}
	
	if(replaceWithResult) {
		applyReplaceWithResult(items, result);
	}
	return result;
}


export function booleanSubtract(items, replaceWithResult?) {
	items = items || getSelectedItems();
	replaceWithResult = replaceWithResult || true;
	
	const main = items[0];
	const rem = [];
	for(let i=0; i<items.length; i++) {
		if(i>0) {
			rem.push(items[i]);
		}
	}
	const over = booleanUnite(rem);
	
	const result = main.subtract(over, {insert:false});
	over.remove();
	main.remove();
	
	if(replaceWithResult) {
		applyReplaceWithResult(items, result);
	}
	
	return result;
}


export function booleanExclude(items, replaceWithResult?) {
	items = items || getSelectedItems();
	replaceWithResult = replaceWithResult || true;
	
	let main = items[0];
	let result;
	for(let i=0; i<items.length; i++) {
		if(i > 0) {
			result = items[i].exclude(main, {insert:false});
			if(i+1 < items.length) {
				main = result;
			}
		}
		main.remove();
		items[i].remove();
	}
	
	if(replaceWithResult) {
		applyReplaceWithResult(items, result);
	}
	
	return result;
}


export function booleanDivide(items, replaceWithResult) {
	items = items || getSelectedItems();
	replaceWithResult = replaceWithResult || true;
	
	const union = booleanUnite(items);
	const exclusion = booleanExclude(items);
	const subtraction = booleanSubtract([union, exclusion.clone()]);
	
	const group = new paper.Group();
	
	if(exclusion.children) {
		for(let i=0; i<exclusion.children.length; i++) {
			const child = exclusion.children[i];
			child.strokeColor = 'black';
			group.addChild(child);
			i--;
		}
	}
	subtraction.strokeColor = 'black';
	group.addChild(subtraction);
	
	if(replaceWithResult) {
		applyReplaceWithResult(items, group);
	}
	
	return group;

}


export function applyReplaceWithResult(items, group) {
	jQuery.each(items, function(index, item) {
		item.remove();
	});
	getActiveLayer().addChild(group);
	
	snapshot('booleanOperation');
}