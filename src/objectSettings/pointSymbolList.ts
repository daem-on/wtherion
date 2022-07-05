import symbolList from "Res/symbol-list.json";

export const pointTypes: string[] = [];
for (const category in symbolList) {
	pointTypes.push(`**${category}`, ...symbolList[category]);
}