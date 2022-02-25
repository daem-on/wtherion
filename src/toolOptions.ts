import {PGToolOptions} from "./toolbar";

const options: PGToolOptions[] = [
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
		name: '%tools.itemSelect%',
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
		name: '%tools.detailSelect%',
		usedKeys : {
			toolbar : 'a'
		}
	},
	{
		id: 'draw',
		name: '%tools.draw%'
	},
	{
		id: 'bezier',
		name: '%tools.bezier%',
		usedKeys : {
			toolbar : 'p'
		}
	},
	{
		id: 'point',
		name: '%tools.point%',
		usedKeys : {
			toolbar : 'k'
		}
	},
	{
		id: 'inspect',
		name: '%tools.inspect%',
		usedKeys : {
			toolbar : 'm'
		}
	},
];
export default options;