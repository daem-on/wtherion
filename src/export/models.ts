// Paper.js export models

export type CornerSegment = [x: number, y: number];
export type CurvedSegment = [center: number[], handleIn: number[], handleOut: number[]];
export type Segment = CornerSegment | CurvedSegment;

export type PathExportData = {
	closed: boolean;
	segments: Segment[];
};
export type PathExportResult = ["Path", PathExportData];

export type SymbolItemExportData = {
	data: any;
	symbol: [string];
	matrix: [number, number, number, number, number, number];
};
export type SymbolItemExportResult = ["SymbolItem", SymbolItemExportData];

export type ShapeExportData = {
	data: any;
}
export type ShapeExportResult = ["Shape", ShapeExportData];

export type CompoundPathExportData = {
	children: PathExportData[];
};
export type CompoundPathExportResult = ["CompoundPath", CompoundPathExportData];

export type ItemExportResult = 
	| PathExportResult 
	| SymbolItemExportResult 
	| GroupExportResult
	| CompoundPathExportResult
	| ShapeExportResult;

export type GroupExportData = {
	children: ItemExportResult[];
	data: any;
};
export type GroupExportResult = ["Group", GroupExportData];

export type LayerExportData = {
	children: ItemExportResult[];
	data: any;
	name: string;
};
export type LayerExportResult = ["Layer", LayerExportData];

type Layers = LayerExportResult[];
export type ProjectExportResult = Layers | [["dictionary", unknown], Layers];
