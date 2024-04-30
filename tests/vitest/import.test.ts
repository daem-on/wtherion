import { beforeEach, expect, test, vi } from "vitest";
import { createProject } from "../../src/import/importTH2";
import paper from "paper";

vi.mock("../../src/triggers.ts", () => ({
	triggers: {
		emit: () => {},
		on: () => {},
		off: () => {},
		emitAll: () => {},
		onAny: () => {},
		offAny: () => {},
	}
}));

beforeEach(() => {
	paper.setup('paperCanvas');
});

function getProjectLayers(): any[] {
	const data = paper.project.exportJSON({ asString: false }) as any;
	if (data[0][0] === "dictionary") return data[1];
	return data;
}

function getWrappedItem(wrapped: any, type: string): any {
	expect(wrapped).toEqual([type, expect.anything()]);
	return wrapped[1];
}

function getSettingsInTest(object: any, settingsClass: string): any {
	expect(object.data.therionData.className).toBe(settingsClass);
	return object.data.therionData;
}

test("import scrap with 1 station", () => {
	const data = `
		scrap scrap1
			point 10 20 station -name 0
		endscrap
	`;
	createProject(data, () => {});
	const layers = getProjectLayers();
	expect(layers.length).toBe(1);
	const scrap = getWrappedItem(layers[0], "Layer");
	expect(scrap.children.length).toBe(1);

	const station = getWrappedItem(scrap.children[0], "SymbolItem");
	const settings = getSettingsInTest(station, "PointSettings");
	expect(station.matrix).toEqual([1, 0, 0, 1, 10, -20]);
	expect(settings.type).toBe("station");
	expect(settings.name).toBe("0");
});

test("import scrap with 1 line", () => {
	const data = `
		scrap scrap1
			line wall
				-84.0 182.5
				-157.0 124.27 -159.0 228.73 -232.0 169.5
				smooth off
			endline
		endscrap
	`;
	createProject(data, () => {});
	const layers = getProjectLayers();
	expect(layers.length).toBe(1);
	const scrap = getWrappedItem(layers[0], "Layer");
	expect(scrap.children.length).toBe(1);

	const line = getWrappedItem(scrap.children[0], "Path");
	const settings = getSettingsInTest(line, "LineSettings");
	expect(line.segments.length).toBe(2);
	expect(settings.type).toBe("wall");
});

test("import closed line", () => {
	const data = `
		scrap scrap1
			line wall -close on
				-580.0 92.0
				-582.0 97.0 -580.0 122.0 -566.0 125.0
				-552.0 128.0 -528.0 133.0 -524.0 126.0
				-520.0 119.0 -523.0 94.0 -524.0 90.0
				-525.0 86.0 -578.0 87.0 -580.0 92.0
			endline
		endscrap
	`;
	createProject(data, () => { });
	const layers = getProjectLayers();
	expect(layers.length).toBe(1);
	const scrap = getWrappedItem(layers[0], "Layer");
	expect(scrap.children.length).toBe(1);

	const line = getWrappedItem(scrap.children[0], "Path");
	expect(line.closed).toBe(true);
	expect(line.segments.length).toBe(4);
	expect(line.segments).toEqual([
		[[-580, -92], [2, 5], [-2, -5]],
		[[-566, -125], [-14, 3], [14, -3]],
		[[-524, -126], [-4, -7], [4, 7]],
		[[-524, -90], [1, -4], [-1, 4]]
	]);
});
