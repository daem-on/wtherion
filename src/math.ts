import paper from "paper";
// functions related to math

	
export function checkPointsClose(startPos: paper.Point, eventPoint: paper.Point, threshold: number): boolean {
	const xOff = Math.abs(startPos.x - eventPoint.x);
	const yOff = Math.abs(startPos.y - eventPoint.y);
	if (xOff < threshold && yOff < threshold) {
		return true;
	}
	return false;	
}


export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}


export function getRandomBoolean() {
	return getRandomInt(0,2) === 1 ? false : true;
}


// Thanks Mikko Mononen! https://github.com/memononen/stylii
export function snapDeltaToAngle(delta: paper.Point, snapAngle: number) {
	let angle = Math.atan2(delta.y, delta.x);
	angle = Math.round(angle/snapAngle) * snapAngle;
	const dirx = Math.cos(angle);
	const diry = Math.sin(angle);
	const d = dirx*delta.x + diry*delta.y;
	return new paper.Point(dirx*d, diry*d);
}