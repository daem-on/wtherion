import { componentList } from "../js/toolOptionPanel";
import pg from "./init";

function removeWindow() {
	jQuery('.toolOptionPanel').remove();
}

const components = {
	line: {

	},
	point: {

	}
}

export function updateWindow() {
	let selected = pg.selection.getSelectedItems();
	
	removeWindow();
	if (selected.length !== 1) {
		return;
	}

	let options = {
		name: "O",
		option1: 50,
		option2: 4,
		list: "how",
	}
	let components: componentList = {
		option1: {
			type: 'int',
			label: 'Point distance',
			min: 1
		},
		string1: {
			type: 'text',
			label: 'test',
		},
		subSection: {
			type: "title",
			text: "Advanced"
		},
		option2: {
			type: 'int',
			label: 'Hey look at me',
			min: 1
		},
		string2: {
			type: 'text',
			label: 'test',
		},
		string3: {
			type: 'text',
			label: 'test',
		},
		subSectio2n: {
			type: "title",
			text: "Advanced2"
		},
		list: {
			type: 'list',
			label: 'a',
			options: [
				"what", "how", "why"
			],
		},
		customLineInput: {
			label: 'b',
			type: 'customLine',
			options: [
				"wall", "contour", "slope", "floor-step", "moonmilk", "flowstone"
			],
		},
	}

	pg.toolOptionPanel.setup(options, components, () => {
		console.log("huh?")
	})
	console.log("here's a reference to options", options)
	return;
}