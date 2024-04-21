import { expect, test } from "vitest";
import { processProject } from "../../src/export/processProject";
import PointSettings from "../../src/objectSettings/model/PointSettings";
import ScrapSettings from "../../src/objectSettings/model/ScrapSettings";

test("export scrap with 1 station", () => {
	const pointSettings = PointSettings.defaultSettings();
	pointSettings.type = "station";
	pointSettings.name = "0";

	const scrapSettings = ScrapSettings.defaultSettings();

	const result = processProject([
		["dictionary", []],
		[
			["Layer", {
				children: [
					["SymbolItem", {
						matrix: [1, 0, 0, 1, 10, -20],
						data: { therionData: pointSettings },
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
