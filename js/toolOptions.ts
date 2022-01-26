import {PGToolOptions} from "./toolbar";

let options: PGToolOptions[] = [
	{
		id: 'viewzoom',
		name: 'View zoom',
		type: 'hidden'
	},
	{
		id: 'viewgrab',
		name: 'View grab',
		type: 'hidden'
	},
	// {
	// 	id: 'zoom',
	// 	name: 'Zoom',
	// 	usedKeys : {
	// 		toolbar : 'z'
	// 	}
	// },
	// {
	// 	id: 'text',
	// 	name: 'Text',
	// 	usedKeys : {
	// 		toolbar : 't'
	// 	}
	// },
	// {
	// 	id: 'scale',
	// 	name: 'Scale',
	// 	usedKeys : {
	// 		toolbar : 's'
	// 	}
	// },
	// {
	// 	id: 'rotate',
	// 	name: 'Rotate',
	// 	usedKeys : {
	// 		toolbar : 'r'
	// 	}
	// },
	{
		id: 'select',
		name: 'Item select',
		usedKeys : {
			toolbar : 'v',
			selectAll : 'ctrl-a',
			invertSelection: 'ctrl-i',
			groupSelection : 'ctrl-g',
			ungroupSelection : 'ctrl-shift-g',
			copySelection: 'ctrl-c',
			pasteSelection : 'ctrl-v'
		}
	},
	{
		id: 'detailselect',
		name: 'Detail select',
		usedKeys : {
			toolbar : 'a'
		}
	},
	{
		id: 'draw',
		name: 'Draw'
	},
	{
		id: 'bezier',
		name: 'Bezier',
		usedKeys : {
			toolbar : 'p'
		}
	},
	{
		id: 'point',
		name: 'Add point',
		usedKeys : {
			toolbar : 'k'
		}
	},
	{
		id: 'inspect',
		name: 'Inspect',
		usedKeys : {
			toolbar : 'k'
		}
	},
]
export default options;