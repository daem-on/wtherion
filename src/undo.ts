// undo functionality
// slightly modifed from https://github.com/memononen/stylii
import paper from "paper";
import { Ref, computed, ref } from "vue";
import * as layer from "./layer";
import { updateWindow } from "./objectSettings/objectOptionPanel";
import { triggers } from "./triggers";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import { get } from "./filesio/configManagement";
import { activeToolRef } from "./tools";

type UndoState = {
	type: string,
	data: Uint8Array,
	hash: string,
}
const states: Ref<UndoState[]> = ref([]);
const head = ref(-1);
export const undoBufferSize = ref(40);

export const statesRef = computed(() => states.value);
export const headRef = computed(() => head.value);

async function getDigest(source: string): Promise<string> {
	const buffer = new TextEncoder().encode(source);
	const digest = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(digest));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}

export function setup() {
	undoBufferSize.value = get("undoBufferSize") ?? 40;
	snapshot("init");
}

export async function snapshot(type: string) {
	const text = paper.project.exportJSON();
	const hash = await getDigest(text);

	if (head.value >= 0 && states.value[head.value].hash === hash) return;

	const data = compressToUint8Array(text);
	
	// remove all states after the current head
	if (head.value + 1 < states.value.length) {
		states.value.length = head.value + 1;
	}
	
	// add the new states
	states.value.push({ type, hash, data });
	
	// limit states to maxUndos by shifing states (kills first state)
	if (states.value.length > undoBufferSize.value) {
		states.value.shift();
	}
	
	// set the head to the states length
	head.value = states.value.length-1;
	
	triggers.emit("Snapshot");
}

export function undo() {
	if (head.value > 0) {
		head.value--;
		restore(states.value[head.value]);
		triggers.emitAll(["Undo", "HistoryChanged"]);
	}
}

export function redo() {
	if (head.value < states.value.length-1) {
		head.value++;
		restore(states.value[head.value]);
		triggers.emitAll(["Redo", "HistoryChanged"]);
	}
}

export function moveHeadTo(position: number) {
	if (position < 0 || position >= states.value.length) {
		return;
	}
	if (position === head.value) return;
	head.value = position;
	restore(states.value[head.value]);
}

function restore(entry: UndoState) {
	const activeLayerID = paper.project.activeLayer.data.id;
	paper.project.clear();
	paper.view.update();
	const text = decompressFromUint8Array(entry.data);
	paper.project.importJSON(text);
	layer.reinitLayers(activeLayerID);
	updateWindow(true);
	activeToolRef.value.emit("restore", undefined);
}

export function clear() {
	states.value = [];
	head.value = -1;
}

export function getStates() {
	return states.value;
}

export function getHead() {
	return head.value;
}