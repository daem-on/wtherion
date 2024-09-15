import useSelection from "@daem-on/graphite/selection";
import paper from "paper";
import { deserializeJSON } from "./document";
import { triggers } from "./triggers";
import { snapshot } from "./undo";

export const {
	clearSelection,
	cloneSelection,
	deleteItemSelection,
	focusItem,
	getSelectedItems,
	getSelectedPaths,
	invertItemSelection,
	invertSegmentSelection,
	processRectangularSelection,
	removeSelectedSegments,
	selectAllItems,
	selectAllSegments,
	setItemSelection,
	smoothHandles,
	splitPathAtSelectedSegments,
	switchSelectedHandles
} = useSelection(paper, snapshot, deserializeJSON);

triggers.onAny(["LayerAdded", "LayersChanged"], () => clearSelection());
