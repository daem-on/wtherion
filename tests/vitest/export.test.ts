import { expect, test } from "vitest";
import { processProject } from "../../src/export/processProject";
import { PointSettings, defaultPointSettings } from "../../src/objectSettings/model/PointSettings";
import ScrapSettings from "../../src/objectSettings/model/ScrapSettings";
import { defaultLineSettings } from "../../src/objectSettings/model/LineSettings";

function createStationSettings(): PointSettings {
	const pointSettings = defaultPointSettings();
	pointSettings.type = "station";
	pointSettings.name = "0";
	return pointSettings;
}

test("export scrap with 1 station", () => {
	const scrapSettings = ScrapSettings.defaultSettings();

	const result = processProject([
		["dictionary", []],
		[
			["Layer", {
				children: [
					["SymbolItem", {
						matrix: [1, 0, 0, 1, 10, -20],
						data: { therionData: createStationSettings() },
						symbol: [""],
					}]
				],
				data: { therionData: scrapSettings },
				name: "scrap1"
			}]
		]
	]);

	expect(result).toEqual([
		"encoding utf-8",
		"scrap scrap1 ",
		"	point 10 20 station -name 0",
		"endscrap"
	]);
});

test("export with all scrap settings", () => {
	const scrapSettings = ScrapSettings.defaultSettings();
	scrapSettings.projection = "elevation 100";
	scrapSettings.scale = "0 0 39.3701 0 0 0 1 0 m";
	scrapSettings.author = `2021.08.01 "Author Name"`;
	scrapSettings.copyright = `2021.08.01 "Author Name"`;
	scrapSettings.stationNames = "prefix1 suffix1";
	scrapSettings.otherSettings = `-walls on`;

	const result = processProject([
		["dictionary", []],
		[
			["Layer", {
				children: [
					["SymbolItem", {
						matrix: [1, 0, 0, 1, 10, -20],
						data: { therionData: createStationSettings() },
						symbol: [""],
					}]
				],
				data: { therionData: scrapSettings },
				name: "scrap1"
			}]
		]
	]);

	expect(result).toEqual([
		"encoding utf-8",
		`scrap scrap1 -scale [0 0 39.3701 0 0 0 1 0 m] -projection [elevation 100] -author 2021.08.01 "Author Name" -copyright 2021.08.01 "Author Name" -station-names prefix1 suffix1 -walls on`,
		"	point 10 20 station -name 0",
		"endscrap"
	]);
});

test("export closed line", () => {
	const lineSettings = defaultLineSettings();
	lineSettings.type = "wall";

	const result = processProject([
		["Layer", {
			children: [
				["Path", {
					segments: [
						[[-580, -92], [2, 5], [-2, -5]],
						[[-566, -125], [-14, 3], [14, -3]],
						[[-524, -126], [-4, -7], [4, 7]],
						[[-524, -90], [1, -4], [-1, 4]]
					],
					closed: true,
					data: { therionData: lineSettings }
				}]
			],
			name: "scrap1",
			data: { therionData: ScrapSettings.defaultSettings() }
		}]
	]);

	expect(result).toEqual([
		"encoding utf-8",
		"scrap scrap1 ",
		"	line wall -close on",
		"		-525 86 -578 87 -580 92",
		"		-582 97 -580 122 -566 125",
		"		-552 128 -528 133 -524 126",
		"		-520 119 -523 94 -524 90",
		"		-525 86 -578 87 -580 92",
		"	endline",
		"endscrap"
	]);
});
