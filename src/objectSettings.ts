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
	if (selected.length !== 1) {
		removeWindow();
		return;
	}

	let options = {
		name: "O",
		option1: 50
	}
	let components = {
		option1: {
			type: 'int',
			label: 'Point distance',
			min: 1
		}
	}

	pg.toolOptionPanel.setup(options, components, () => {
		console.log("huh?")
	})
	console.log("here's a reference to options", options)
	return;
}