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
	{
		id: 'select',
		name: '%tools.itemSelect%',
		usedKeys : {
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
	},
	{
		id: 'draw',
		name: '%tools.draw%',
	},
	{
		id: 'bezier',
		name: '%tools.bezier%',
	},
	{
		id: 'point',
		name: '%tools.point%',
	},
	{
		id: 'inspect',
		name: '%tools.inspect%'
	},
];
export default options;