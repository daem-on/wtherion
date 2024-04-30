import LineSettings from "./objectSettings/model/LineSettings.ts";
import getSettings, { PaperItemType } from "./objectSettings/model/getSettings.ts";
import AreaSettings from "./objectSettings/model/AreaSettings.ts";
import { CustomRenderStyle } from "./render.ts";
import * as config from "./filesio/configManagement.ts";
import colorDefs from "./res/color-defs.json";
import symbolList from "./res/symbol-list.json";
import PointSettings from "./objectSettings/model/PointSettings.ts";
import paper from "paper";

const typeColors
    = generateColors(colorDefs.typeColors);
const categoryColors
    = generateColors(colorDefs.pointColors.categories);
const areaColors
    = generateColors(colorDefs.areaColors);

// we don't want to construct symbols at init, only when needed
type LazySymbolDef = () => paper.SymbolDefinition;
function lazy<T>(fn: () => T): () => T {
    let value: T | undefined;
    return () => {
        if (value === undefined) value = fn();
        return value;
    };
}

const fullSymbolDefs = new Map<string, LazySymbolDef>();
const simpleSymbolDefs = new Map<string, LazySymbolDef>();

for (const category in symbolList) {
    for (const name of symbolList[category]) {
        fullSymbolDefs.set(name, lazy(() => defineFullSymbol(category, name)));
    }
}

const defaultSymbol: LazySymbolDef = lazy(() => defineCircleSymbol(new paper.Color(colorDefs.pointColors.default)));

const categorySybols: Map<string, LazySymbolDef> = new Map(
    Object.keys(categoryColors)
        .map<[string, LazySymbolDef]>(category => [
            category,
            lazy(() => defineCircleSymbol(categoryColors[category]))
        ])
);

for (const category in symbolList) {
    for (const name of symbolList[category]) {
        const def = categorySybols.get(category) ?? defaultSymbol;
        simpleSymbolDefs.set(name, def);
    }
}

simpleSymbolDefs.set("station", () => {
    const triangle = new paper.Path.RegularPolygon({ sides: 3, radius: 5, insert: false });
    triangle.fillColor = new paper.Color(colorDefs.pointColors.station);
    return new paper.SymbolDefinition(triangle);
});

function generateColors(from: Record<string, string>) {
    const r: Record<string, paper.Color> = {};
    for (const entry in from) {
        r[entry] = new paper.Color(from[entry]);
        const inactive = r[entry].clone();
        inactive.saturation = 0.05;
        inactive.brightness = 0.7;
        r[entry + "-inactive"] = inactive;
    }
    return r;
}

export function overrideColors(object: Record<string, Record<string, string>>) {
    if ("lineColors" in object)
        Object.assign(typeColors, generateColors(object.lineColors));
    // TODO point colors
    if ("areaColors" in object)
        Object.assign(areaColors, generateColors(object.areaColors));
    if ("background" in object)
        document.getElementById("paperCanvas").style.backgroundColor = object.background["fill"];
}

export function createPath() {
    const path = new paper.Path();
    path.strokeColor = new paper.Color(0, 0, 0);
    path.strokeWidth = 2;
    path.data = {
        therionData: LineSettings.defaultSettings()
    };
    return path;
}

export function drawArea(a: paper.Path) {
    const settings = getSettings(a) as AreaSettings;
    drawLine(a, settings.lineSettings);
    setColorFromList(a, areaColors, settings.type, true);
}

export function drawPoint(p: paper.SymbolItem) {
    const settings = getSettings(p);
    p.definition = getSymbol(settings.type);
}

export function drawLine(l: paper.Path, lineSettings?: LineSettings) {
    const settings = lineSettings || getSettings(l) as LineSettings;
    l.strokeScaling = true;
    l.fillColor = null;

    switch (settings.type) {
        case "wall":
            l.strokeWidth = 2;
            break;
        case "rock-edge":
            l.strokeWidth = 0.8;
            break;
        case "floor-meander":
        case "ceiling-meander":
            l.strokeWidth = 10;
            break;
        default:
            l.strokeWidth = 1;
            break;
    }

    setColorFromList(l, typeColors, settings.type);

    if (settings.subtype === "presumed")
        l.dashArray = [3, 6];
    else if (settings.type === "ceiling-meander")
        l.dashArray = [10, 5];
    else l.dashArray = null;
    l.strokeColor.alpha = settings.invisible ? 0.3 : 1;

    l.data.customRenderStyle = undefined;
    if (!settings.invisible) {
        if (settings.type === "pit") {
            l.data.customRenderStyle = CustomRenderStyle.Spiky;
        } else if (settings.type === "overhang" || settings.subtype === "pit") {
            l.data.customRenderStyle = CustomRenderStyle.Triangle;
        } else if (settings.type === "slope") {
            l.data.customRenderStyle = CustomRenderStyle.Notched;
        } else if (settings.type === "contour") {
            l.data.customRenderStyle = CustomRenderStyle.Contour;
        }
    }
    if (settings.subtypes && Object.values(settings.subtypes).length) {
        l.data.customRenderStyle = CustomRenderStyle.SegmentDetails;
    }
}

export function drawObject(object: PaperItemType) {
    const settings = getSettings(object);
    if (!settings) return;

    switch (settings.className) {
        case "AreaSettings":
            drawArea(object as paper.Path);
            break;
        case "LineSettings":
            drawLine(object as paper.Path);
            break;
        case "PointSettings":
            drawPoint(object as paper.SymbolItem);
            break;
    }
}

export function setColorFromList(
    object: PaperItemType,
    list: Record<string, paper.Color>,
    name: string,
    fill = false
) {
    if (list[name] == null) name = "default";
    if (config.get("colorInactive"))
        if (paper.project.activeLayer !== object.layer)
            name += "-inactive";

    const color = list[name];
    if (fill) object.fillColor = color;
    else object.strokeColor = color;
}

export function redrawAll() {
    for (const layer of paper.project.layers) {
        for (const item of layer.children) {
            drawObject(item as PaperItemType);
        }
    }
}

export function setupData(item) {
    if (!("therionData" in item.data))
        item.data.therionData = {};
}

function defineFullSymbol(category: string, name: string): paper.SymbolDefinition {
    const group = new paper.Group();
    const symbol = new paper.SymbolDefinition(group);
    fetch(`/assets/rendered/point/${category}/${name}.svg`)
        .then(response => response.text())
        .then(svg => {
            const imported = group.importSVG(svg, { applyMatrix: false });
            imported.scale(40);
        });
    return symbol;
}

function defineCircleSymbol(color: paper.Color): paper.SymbolDefinition {
    const circle = new paper.Path.Circle({ radius: 5, insert: false });
    circle.fillColor = color;
    return new paper.SymbolDefinition(circle);
}

export function getSymbol(name: string): paper.SymbolDefinition {
    const shouldDrawFull = config.get("drawSymbols");
    const set = shouldDrawFull ? fullSymbolDefs : simpleSymbolDefs;

    if (set.has(name)) return set.get(name)();
    return defaultSymbol();
}

export function createPoint(pos: paper.Point = new paper.Point(0, 0)): paper.SymbolItem {
    const item = new paper.SymbolItem(getSymbol(""), pos);
    item.data.fixedScale = true;
    item.data.onlyRotateHandle = true;
    item.data.therionData = PointSettings.defaultSettings();
    return item;
}