import { LineSettings, defaultLineSettings } from "./objectSettings/model/LineSettings.ts";
import getSettings, { PaperItemType } from "./objectSettings/model/getSettings.ts";
import { AreaSettings } from "./objectSettings/model/AreaSettings.ts";
import { CustomRenderStyle, setCustomRenderStrokeStyle } from "./render.ts";
import * as config from "./filesio/configManagement.ts";
import symbolList from "./res/symbol-list.json";
import { PointSettings, defaultPointSettings } from "./objectSettings/model/PointSettings.ts";
import paper from "paper";
import { isDarkMode } from "./darkMode.ts";

type ThemeDef = {
    lineColors?: Record<string, string> & { default: string };
    pointColors?: {
        default: string,
        station?: string;
        categories: Record<string, string>;
    };
    areaColors?: Record<string, string> & { default: string };
    backgroundColor?: string;
    customRender?: string;
};

type PaletteDef = {
    light?: ThemeDef;
    dark?: ThemeDef;
};

type EffectiveColor = {
    active: paper.Color;
    inactive: paper.Color;
}

type EffectivePalette = {
    line: Map<string, EffectiveColor>;
    area: Map<string, EffectiveColor>;
    point: {
        fullSymbolDefs: Map<string, LazySymbolDef>;
        simpleSymbolDefs: Map<string, LazySymbolDef>;
        default: LazySymbolDef;
        inactive: LazySymbolDef;
    }
};

let currentDef: PaletteDef;
let effective: EffectivePalette;

// we don't want to construct symbols at init, only when needed
type LazySymbolDef = () => paper.SymbolDefinition;
function lazy<T>(fn: () => T): () => T {
    let value: T | undefined;
    return () => {
        if (value === undefined) value = fn();
        return value;
    };
}

function getInactiveColor(color: paper.Color, isDark: boolean): paper.Color {
    const inactive = color.clone();
    if (isDark) {
        inactive.saturation = 0.05;
        inactive.brightness = 0.3;
    } else {
        inactive.saturation = 0.05;
        inactive.brightness = 0.7;
    }
    return inactive;
}

function getActiveInactive(color: string): EffectiveColor {
    const active = new paper.Color(color);
    const inactive = getInactiveColor(active, isDarkMode.value);
    return { active, inactive };
}

function generateColors(
    from: Record<string, string> & { default: string }
): Map<string, EffectiveColor> {
    if (!from.default)
        throw new Error("Palette must have a default color");
    const map = new Map<string, EffectiveColor>();
    for (const entry in from) {
        map.set(entry, getActiveInactive(from[entry]));
    }
    return map;
}

export function initColors(definition: PaletteDef) {
    const isDark = isDarkMode.value;
    const themeDef = isDark ? definition.dark : definition.light;

    if (themeDef.backgroundColor)
        document.getElementById("paperCanvas").style.backgroundColor = themeDef.backgroundColor;
    if (themeDef.customRender)
        setCustomRenderStrokeStyle(themeDef.customRender);

    const fullSymbolDefs = new Map<string, LazySymbolDef>();
    const simpleSymbolDefs = new Map<string, LazySymbolDef>();

    for (const category in symbolList) {
        for (const name of symbolList[category]) {
            fullSymbolDefs.set(name, lazy(() => defineFullSymbol(category, name)));
        }
    }

    const defaultSymbol: LazySymbolDef = lazy(() => defineCircleSymbol(new paper.Color(themeDef.pointColors.default)));
    const inactiveSymbol: LazySymbolDef = lazy(() => defineCircleSymbol(getInactiveColor(new paper.Color(themeDef.pointColors.default), isDark)));

    const categorySybols: Map<string, LazySymbolDef> = new Map(
        Object.entries(themeDef.pointColors.categories)
            .map<[string, LazySymbolDef]>(([category, color]) => [
                category,
                lazy(() => defineCircleSymbol(new paper.Color(color)))
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
        triangle.fillColor = new paper.Color(themeDef.pointColors.station);
        return new paper.SymbolDefinition(triangle);
    });
    
    effective = {
        line: generateColors(themeDef.lineColors),
        point: {
            fullSymbolDefs,
            simpleSymbolDefs,
            inactive: inactiveSymbol,
            default: defaultSymbol,
        },
        area: generateColors(themeDef.areaColors),
    };
    currentDef = definition;
}

export function reinitColors() {
    initColors(currentDef);
}

export function createPath() {
    const path = new paper.Path();
    path.strokeColor = new paper.Color(0, 0, 0);
    path.strokeWidth = 2;
    path.data = {
        therionData: defaultLineSettings()
    };
    return path;
}

export function drawArea(a: paper.Path) {
    const settings = getSettings(a) as AreaSettings;
    drawLine(a, settings.lineSettings);
    a.fillColor = getColor(a, effective.area, settings.type);
}

export function drawPoint(p: paper.SymbolItem) {
    const settings = getSettings(p);
    const inactive = config.get("colorInactive") && isInactive(p);
    p.definition = getSymbol(settings.type, inactive);
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

    l.strokeColor = getColor(l, effective.line, settings.type);

    if (settings.subtype === "presumed")
        l.dashArray = [3, 6];
    else if (settings.type === "ceiling-meander")
        l.dashArray = [10, 5];
    else l.dashArray = null;
    l.strokeColor.alpha = settings.invisible ? 0.3 : 1;

    l.data.customRenderStyle = undefined;
    if (!settings.invisible) {
        if (settings.type === "pit" || settings.type === "floor-step") {
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

function isInactive(object: PaperItemType): boolean {
    return paper.project.activeLayer !== object.layer;
}

export function getColor(
    object: PaperItemType,
    map: Map<string, EffectiveColor>,
    name: string,
): paper.Color {
    if (!map.has(name)) name = "default";
    const colors = map.get(name);

    if (config.get("colorInactive") && isInactive(object))
        return colors.inactive;

    return colors.active;
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

export function getSymbol(name: string, inactive: boolean): paper.SymbolDefinition {
    const shouldDrawFull = config.get("drawSymbols");
    if (!shouldDrawFull && inactive) return effective.point.inactive();

    const set = shouldDrawFull ? effective.point.fullSymbolDefs : effective.point.simpleSymbolDefs;

    if (set.has(name)) return set.get(name)();
    return effective.point.default();
}

export function createPoint(
    pos: paper.Point = new paper.Point(0, 0),
    settings: PointSettings = defaultPointSettings()
): paper.SymbolItem {
    const item = new paper.SymbolItem(getSymbol("", false), pos);
    item.data.fixedScale = true;
    item.data.onlyRotateHandle = true;
    item.data.therionData = settings;
    return item;
}