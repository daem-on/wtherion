import { expect, test } from "vitest";
import { processProject } from "../../src/export/processProject";
import PointSettings from "../../src/objectSettings/model/PointSettings";
import ScrapSettings from "../../src/objectSettings/model/ScrapSettings";

function createStationSettings(): PointSettings {
	const pointSettings = PointSettings.defaultSettings();
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
