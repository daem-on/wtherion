import paper from "paper";

export enum CustomRenderStyle {
	Spiky, Triangle, Notched, Contour
}

let enableCustomRender = true;

export function setCustomRender(enable: boolean) {
	enableCustomRender = enable;
}

function drawSpikyLine(path: paper.Path, context: CanvasRenderingContext2D, reverse: boolean) {
	const length = reverse ? -10 : 10;
	context.beginPath();
	for (let o = 0; o < path.length; o += 20) {
		const pos = path.getLocationAt(o).point;
		const normal = path.getNormalAt(o);
		context.moveTo(pos.x, pos.y);
		const target = pos.add(normal.multiply(length));
		context.lineTo(target.x, target.y);
	}
	context.stroke();
}

function drawTriangleLine(path: paper.Path, context: CanvasRenderingContext2D, reverse: boolean) {
	const length = reverse ? -10 : 10;
	context.beginPath();
	for (let o = 3; o < path.length - 3; o += 20) {
		const posL = path.getLocationAt(o-3).point;
		const posC = path.getLocationAt(o).point;
		const posR = path.getLocationAt(o+3).point;
		const normal = path.getNormalAt(o);
		context.moveTo(posL.x, posL.y);
		const apex = posC.add(normal.multiply(length));
		context.lineTo(apex.x, apex.y);
		context.lineTo(posR.x, posR.y);
	}
	context.fill();
}

function drawNotchedLine(path: paper.Path, context: CanvasRenderingContext2D, reverse: boolean) {
	const multiplier = reverse ? -1 : 1;
	context.beginPath();
	for (let o = 0; o < path.length; o += 20) {
		const pos = path.getLocationAt(o).point;
		const normal = path.getNormalAt(o);
		const length = o % 40 === 0 ? 20 : 10;
		context.moveTo(pos.x, pos.y);
		const target = pos.add(normal.multiply(length*multiplier));
		context.lineTo(target.x, target.y);
	}
	context.stroke();
}

function drawLineWithContour(path: paper.Path, context: CanvasRenderingContext2D, reverse: boolean) {
	const length = reverse ? -10 : 10;
	if (!path.length) return;
	const middle = path.getLocationAt(path.length / 2).point;
	const target = path.getNormalAt(path.length / 2).multiply(length).add(middle);
	context.beginPath();
	context.moveTo(middle.x, middle.y);
	context.lineTo(target.x, target.y);
	context.stroke();
}

export function setupCustomRenderer() {
	const originalUpdate = paper.view.update;
	paper.view.update = function() {
		const updated = originalUpdate.bind(this)();
		if (updated) renderCallback();
		return updated;
	};

	const context = paper.view.element.getContext("2d");
	let itemsToDraw: paper.Item[] = [];

	paper.view.on("frame", event => {
		if (!enableCustomRender) return;
		if (event.count % 20 !== 0) return;
		itemsToDraw = paper.project.getItems({
			recursive: true,
			match: item => item.layer?.visible && item.data?.customRenderStyle != null,
			overlapping: paper.view.bounds
		});
	});

	function renderCallback() {
		if (!enableCustomRender) return;
		paper.view.matrix.applyToContext(context);
		for (const item of itemsToDraw) {
			switch (item.data.customRenderStyle) {
				case CustomRenderStyle.Spiky:
					drawSpikyLine(item as paper.Path, context, item.data.therionData.reverse);
					break;
				case CustomRenderStyle.Triangle:
					drawTriangleLine(item as paper.Path, context, item.data.therionData.reverse);
					break;
				case CustomRenderStyle.Notched:
					drawNotchedLine(item as paper.Path, context, item.data.therionData.reverse);
					break;
				case CustomRenderStyle.Contour:
					drawLineWithContour(item as paper.Path, context, item.data.therionData.reverse);
					break;
			}
		}
		context.resetTransform();
	}
}