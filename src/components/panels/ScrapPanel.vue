<script setup lang="ts">
import paper from "paper";
import { triggers } from '../../triggers';
import { Raw, markRaw, onUnmounted, ref } from 'vue';
import { addNewLayer, deleteLayer, isActiveLayer, setActiveLayer } from "../../layer";
import MenuButton from "../common/MenuButton.vue";

const layers = ref<{ name: string, raw: Raw<paper.Layer> }[]>([]);

function handleLayerChange() {
	layers.value.length = 0;
	for (const layer of paper.project?.layers ?? []) {
		if (layer.data.isGuideLayer) continue;
		layers.value.push({ name: layer.name, raw: markRaw(layer) });
	}
}
handleLayerChange();

triggers.onAny(["LayerAdded", "LayerRemoved", "LayersChanged"], handleLayerChange);

onUnmounted(() => {
	triggers.offAny(["LayerAdded", "LayerRemoved", "LayersChanged"], handleLayerChange);
});

function setVisibility(visible: boolean, layer: paper.Layer) {
	layer.visible = visible;
	triggers.emit("LayersChanged");
}

function deleteCurrentLayer(message: string) {
	if (!confirm(message)) return;
	const layer = paper.project.activeLayer;
	deleteLayer(layer);
	triggers.emit("LayersChanged");
}
</script>

<template>
	<div class="scrap-panel">
		<div class="header">
			<h2>{{ $t("scraps") }}</h2>
			<button @click="deleteCurrentLayer($t(`scraps.delete.confirm`))">{{ $t("delete") }}</button>
			<button @click="addNewLayer()">{{ $t("scraps.add") }}</button>
		</div>
		<ul class="scrap-list">
			<MenuButton
				v-for="entry in layers"
				:key="entry.name"
				@click="setActiveLayer(entry.raw)"
				:class="{ active: isActiveLayer(entry.raw) }"
				class="scrap-entry">
				
				<input type="checkbox" :checked="entry.raw.visible" @change="setVisibility(!entry.raw.visible, entry.raw)">
				{{ entry.name }}
			</MenuButton>
		</ul>
	</div>
</template>

<style scoped>
.scrap-panel {
	height: 20em;
	max-height: 30vh;
	overflow-y: auto;
	padding: 8px;
}

.scrap-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.header {
	margin-bottom: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

h2 {
	font-weight: bold;
}

.active {
	outline: 2px solid;
	outline-offset: -2px;
	outline-color: var(--primary-color);
}

.scrap-entry {
	display: flex;
	align-items: center;
}
</style>