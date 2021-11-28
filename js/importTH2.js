toPoint = function(global, global2 = undefined) {
	if (global2)
	return [
		-(Number.parseFloat(global2[0])-Number.parseFloat(global[0])),
		+(Number.parseFloat(global2[1])-Number.parseFloat(global[1]))
	]
	else return [
		Number.parseFloat(global[0]),
		-Number.parseFloat(global[1])
	]
}

getOptions = function(source) {
	var options = {};

	var re = /-([a-z]+) ['"\[]([^'"\[\]]+)['"\]]/g;
	var matches = source.matchAll(re);
	for (var match of matches) {
		options[match[1]] = match[2];
	}
	var singleOptions = source.replace(re, "");
	var split = singleOptions.split(" ");
	for (var i = 0; i < split.length; i+=2) {
		if (split[i].trim().startsWith("-"))
			options[split[i].slice(1)] = split[i+1];
	}
	return options;
} 

var importerTh2 = {

	_linedef: false,
	_currentPath: null,
	_currentSegments: null,
	_closeLine: null,
	_lineCommands: ["reverse", "close"],

	/**	@param source {String} */
	import: function(source) {
		for (line of source.split("\n")) {
			line = line.trim();
			if (line.startsWith("#")) continue;
			if (this._linedef === true) {
				if (isNaN(line.slice(0, 2))) {
					if (line.startsWith("close")) this._closeLine = true;
					if (line.startsWith("endline")) this.endLine();
				}
				else this.addSegment(line);
			} else {
				if (line.startsWith("line")) {
					this.createLine(line)
				} else if (line.startsWith("scrap")) {
					this.createScrap(line);
				} else if (line.startsWith("point")) {
					this.createPoint(line);
				}
			}
		}
	},

	addSegment: function(line) {
		this._currentSegments.push(line.split(" "));
	},

	endLine: function() {
		var segments = this._currentSegments;
		var lastpoint;
		for (let i = 0; i < segments.length; i++) {
			var segment = segments[i];
			if (segment.length == 2) {
				this._currentPath.add(new paper.Point(
					toPoint(segment)
				));
				lastpoint = segment;
			} else if (segment.length == 6) {
				this._currentPath.lastSegment.handleOut =
					toPoint(segment.slice(0, 2), lastpoint);
				this._currentPath.add(new paper.Segment(
					toPoint(segment.slice(4, 6)),
					toPoint(segment.slice(2, 4), segment.slice(4, 6)),
					[0, 0]
				));
				lastpoint = segment.slice(4, 6);
			}
		}
		if (this._closeLine) this._currentPath.closed = true;
		this._linedef = false;
	},

	createLine: function(line) {
		var split = line.split(" ");
		this._currentPath = pg.editTH2.newPath();
		this._currentPath.strokeColor = "black";
		this._currentSegments = [];
		this._linedef = true;
		this._closeLine = false;
		this._currentPath.data
		this._currentPath.data.therionData.type = split[1];
	},

	createScrap: function(line) {
		var split = line.split(" ");
		var nl = pg.layer.addNewLayer(split[1], true);
		nl.data.therionData = {
			createdFrom: line,
		};
	},

	createPoint: function(line) {
		var point = pg.editTH2.createPoint();
		var split = line.split(" ");
		point.position = new paper.Point(toPoint(split.slice(1, 3)))
		index = split.findIndex(s => s=="-orient" || s=="-orientation");
		if (index !== -1)
			point.rotation = split[index+1];
	}
}