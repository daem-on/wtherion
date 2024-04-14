<script setup lang="ts">
import paper from "paper";
import { triggers } from '../../triggers';
import { Raw, markRaw, onUnmounted, ref } from 'vue';
import { addNewLayer, deleteLayer, isActiveLayer, moveLayer, setActiveLayer } from "../../layer";
import MenuButton from "../common/MenuButton.vue";
import PopoutScaffold from "../common/PopoutScaffold.vue";
import Card from "../common/Card.vue";

type LayerEntry = {
	name: string,
	active: boolean,
	raw: Raw<paper.Layer>,
	xvi: boolean,
}

const layers = ref<LayerEntry[]>([]);

function handleLayerChange() {
	layers.value.length = 0;
	const layersArray = Array.from(paper.project?.layers ?? []);
	for (const layer of layersArray.reverse()) {
		if (layer.data.isGuideLayer) continue;
		layers.value.push({
			name: layer.name,
			active: isActiveLayer(layer),
			raw: markRaw(layer),
			xvi: layer.data.xviLayer ?? false,
		});
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
	deleteLayer(layer.data.id);
	triggers.emit("LayersChanged");
}

function renameCurrentLayer(message: string) {
	const layer = paper.project.activeLayer;
	const name = prompt(message, layer.name);
	if (!name) return;
	layer.name = name;
	triggers.emit("LayersChanged");
}
</script>

<template>
	<div class="scrap-panel">
		<div class="header">
			<h2>{{ $t("scraps.title") }}</h2>
			<button @click="addNewLayer()">{{ $t("scraps.add") }}</button>
		</div>
		<ul class="scrap-list">
			<PopoutScaffold
				v-for="entry in layers"
				:key="entry.name">
				<template #source="{ openBelow, open }">
					<MenuButton
						@click.left="setActiveLayer(entry.raw)"
						@contextmenu.stop.prevent="open"
						:class="{ active: entry.active, xvi: entry.xvi }"
						class="scrap-entry">
						
						<input type="checkbox" :checked="entry.raw.visible" @change="setVisibility(!entry.raw.visible, entry.raw)">
						<span class="scrap-name">{{ entry.name }}</span>
						<div class="spacer"></div>
						<button @click="openBelow($event.target as HTMLElement)">•••</button>
					</MenuButton>
				</template>
				<Card column>
					<MenuButton @click="deleteCurrentLayer($t(`scraps.deleteConfirm`))">{{ $t("delete") }}</MenuButton>
					<MenuButton @click="renameCurrentLayer($t(`scraps.renamePrompt`))">{{ $t("rename") }}</MenuButton>
					<MenuButton @click="moveLayer(entry.raw, +1)">{{ $t(`scraps.moveUp`) }}</MenuButton>
					<MenuButton @click="moveLayer(entry.raw, -1)">{{ $t(`scraps.moveDown`) }}</MenuButton>
				</Card>
			</PopoutScaffold>
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

.xvi {
	font-style: italic;
}

.scrap-entry {
	display: flex;
	align-items: center;
	gap: 4px;
	overflow-x: hidden;
}

.scrap-name {
	word-wrap: break-word;
	min-width: 0;
}

.layer-actions {
	display: flex;
	gap: 4px;
	background-color: var(--background-color);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 4px;
}

.spacer {
	flex: 1;
}
</style>