import { beforeEach, expect, test, vi } from "vitest";
import { createProject } from "../../src/import/importTH2";
import paper from "paper";
import type { LineSettings } from "../../src/objectSettings/model/LineSettings";
import type { ReactiveMap } from "../../src/objectSettings/reactiveMap";
import type { AreaSettings } from "../../src/objectSettings/model/AreaSettings";
import type { PointSettings } from "../../src/objectSettings/model/PointSettings";
import type { ScrapSettings } from "../../src/objectSettings/model/ScrapSettings";

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

type SettingType<T extends string> = 
	T extends "LineSettings" ? ReactiveMap<LineSettings> :
	T extends "AreaSettings" ?  ReactiveMap<AreaSettings> :
	T extends "PointSettings" ? ReactiveMap<PointSettings> :
	T extends "ScrapSettings" ? ReactiveMap<ScrapSettings> :
	never;

function getSettingsInTest<T extends string>(object: paper.Item, settingsClass: T): SettingType<T> {
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

test("import scrap with 1 area", () => {
	const data = `
		scrap scrap1
			area water
				8d17911d-71de-4e4a-87b1-650a3be545e1
			endarea
			line border -id 8d17911d-71de-4e4a-87b1-650a3be545e1 -close on
				2548.0 -1341.0
				2574.0 -1363.0 2606.0 -1380.0 2614.0 -1363.0
				2622.0 -1346.0 2617.0 -1314.0 2611.0 -1309.0
				2605.0 -1304.0 2595.0 -1299.0 2581.0 -1304.0
				2567.0 -1309.0 2522.0 -1319.0 2548.0 -1341.0
			endline
		endscrap
	`;
	createProject(data, () => { });
	const layers = getProjectLayers();
	expect(layers.length).toBe(1);
	const scrap = getWrappedItem(layers[0], "Layer");
	expect(scrap.children.length).toBe(1);

	const path = getWrappedItem(scrap.children[0], "Path");
	expect(path.closed).toBe(true);
	
	const areaSettings = getSettingsInTest(path, "AreaSettings");
	expect(areaSettings.type).toBe("water");
	const lineSettings = areaSettings.lineSettings;
	expect(lineSettings?.type).toBe("border");
});

test("import point with all settings", () => {
	const data = `
		scrap scrap1
			point 10 20 test1 -name 0 -subtype test2 -testarg testval -clip on -place top -visibility off -scale 1 -text "test3" -value "test4" -id "test5"
		endscrap
	`;
	createProject(data, () => { });
	const layers = getProjectLayers();
	const scrap = getWrappedItem(layers[0], "Layer");
	const point = getWrappedItem(scrap.children[0], "SymbolItem");

	const settings = getSettingsInTest(point, "PointSettings");
	expect(Array.from(settings.map.entries())).toEqual([
		["className", "PointSettings"],
		["type", "test1"],
		["name", "0"],
		["subtype", "test2"],
		["testarg", "testval"],
		["clip", "on"],
		["place", "top"],
		["invisible", true],
		["scale", "1"],
		["text", "test3"],
		["value", "test4"],
		["id", "test5"]
	]);
	expect(settings.type).toBe("test1");
});

test.each([90, 20, 14])("import point with rotation %i", rotation => {
	const data = `
		scrap scrap1
			point 2 1 blocks -orientation ${rotation}
		endscrap
	`;
	createProject(data, () => { });
	const layers = getProjectLayers();
	const scrap = getWrappedItem(layers[0], "Layer");
	const point = getWrappedItem(scrap.children[0], "SymbolItem");

	const settings = getSettingsInTest(point, "PointSettings");
	expect(settings.type).toBe("blocks");
	const matrix = new paper.Matrix(point.matrix);
	expect(matrix.rotation).toBeCloseTo(rotation, 2);
});
