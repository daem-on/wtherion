import pg from "./init";
const COMMMON_COLOR = new paper.Color(0.2, 0.2, 0.2);

export default {
	_state: 0,

	import(source: string) {
		let layer = pg.layer.addNewLayer("therion.xviLayer");
		layer.locked = true;
		layer.data.isGuideLayer = true;

		for (let line of source.split("\n")) {
			line = line.trim();
			if (this._state === 0) {
				if (line.startsWith("set XVIstations")) this._state = 1;
				if (line.startsWith("set XVIshots")) this._state = 2;
			} else if (this._state === 1) {
				if (line.startsWith("}")) {this._state = 0; continue;}

				let [x, y, n] = line.slice(1, line.length-1).split(" ").filter(i => i);
				this.createStation(x, y, n);
			} else if (this._state === 2) {
				if (line.startsWith("}")) {this._state = 0; continue;}

				let [x1, y1, x2, y2] = line.slice(1, line.length-1).split(" ").filter(i => i);
				this.createShot(x1, y1, x2, y2);
			}
		}
		pg.layerPanel.updateLayerList();
	},

	createStation(x: string, y: string, n: string) {
		let circle = new paper.Shape.Circle({
			center: new paper.Point(
				Number.parseFloat(x),
				Number.parseFloat(y)
			),
			radius: 5,
			fillColor: COMMMON_COLOR,
		});
		circle.data.noDrawHandle = true;
		circle.data.therionData = {
			name: n
		};
	},

	createShot(x1: string, y1: string, x2: string, y2: string) {
		let path = new paper.Path({
			segments: [
				[Number.parseFloat(x1), Number.parseFloat(y1)],
				[Number.parseFloat(x2), Number.parseFloat(y2)]
			],
			strokeColor: COMMMON_COLOR
		})
	}

}