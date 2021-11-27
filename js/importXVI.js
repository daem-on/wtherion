var importerXvi = {

	_state: 0,
	_commonColor: new paper.Color(0.2, 0.2, 0.2),

	/**	@param source {String} */
	import: function(source) {
		var layer = pg.layer.addNewLayer("therion.xviLayer");
		layer.locked = true;
		layer.data.isGuideLayer = true;

		for (line of source.split("\n")) {
			line = line.trim();
			if (this._state === 0) {
				if (line.startsWith("set XVIstations")) this._state = 1;
				if (line.startsWith("set XVIshots")) this._state = 2;
			} else if (this._state === 1) {
				if (line.startsWith("}")) {this._state = 0; continue;}

				[x, y, n] = line.slice(1, line.length-1).split(" ").filter(i => i);
				this.createStation(x, y, n);
			} else if (this._state === 2) {
				if (line.startsWith("}")) {this._state = 0; continue;}

				[x1, y1, x2, y2] = line.slice(1, line.length-1).split(" ").filter(i => i);
				this.createShot(x1, y1, x2, y2);
			}
		}
	},

	createStation(x, y, n) {
		var circle = new paper.Shape.Circle({
			center: new paper.Point(
				Number.parseFloat(x),
				Number.parseFloat(y)
			),
			radius: 5,
			fillColor: this._commonColor,
		});
		circle.data.noDrawHandle = true;
		circle.data.therionData = {
			name: n
		};
	},

	createShot(x1, y1, x2, y2) {
		var path = new paper.Path({
			segments: [
				[Number.parseFloat(x1), Number.parseFloat(y1)],
				[Number.parseFloat(x2), Number.parseFloat(y2)]
			],
			strokeColor: this._commonColor
		})
	}

}