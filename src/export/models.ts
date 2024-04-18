// Paper.js export models

export type CornerSegment = [x: number, y: number];
export type CurvedSegment = [center: number[], handleIn: number[], handleOut: number[]];
export type Segment = CornerSegment | CurvedSegment;

export type PathExportData = {
	data: any;
	closed: boolean;
	segments: Segment[];
};
export type PathExportResult = ["Path", PathExportData];

export type Matrix = [number, number, number, number, number, number];

export type SymbolItemExportData = {
	data: any;
	symbol: [string];
	matrix: Matrix;
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
