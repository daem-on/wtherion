import { createUndoBuffer } from "grapht/undo";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import paper from "paper";
import { deserializeJSON } from "./document";
import { get } from "./filesio/configManagement";
import { reinitLayers } from "./layer";

export const {
	snapshot,
	undo,
	redo,
	clear,
	moveHeadTo,
	headRef,
	statesRef,
	getHead,
	getStates,
} = createUndoBuffer({
	scope: paper,
	undoBufferSize: get("undoBufferSize"),
	transform: text => compressToUint8Array(text),
	untransform: compressed => decompressFromUint8Array(compressed),
	deserializeJSON: deserializeJSON,
	restoreLayer: data => reinitLayers(data.id)
});
