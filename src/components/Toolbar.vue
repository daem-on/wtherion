<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { activeToolRef, duckedToolRef, switchTool } from "../tools";
import { toolsRef } from "../tools";
import ToolButton from "./common/ToolButton.vue";
import compareUrl from "../../assets/ui/compare.svg";
import { setCustomRender } from "../render";
import ToolMenu from "./ToolMenu.vue";

const toolList = computed(() => {
	if (!toolsRef.value) return [];
	return Object.values(toolsRef.value).filter(tool => tool.definition.type !== "hidden");
});

const enableCustomRender = ref(true);

watch(() => enableCustomRender.value, value => {
	setCustomRender(value);
});
</script>

<template>
	<div class="toolbar">
		<ToolButton
			v-for="tool in toolList"
			:key="tool.definition.id"
			@click="switchTool(tool)"
			:title="$t(tool.definition.name)"
			:class="{
				active: activeToolRef === tool,
				ducked: duckedToolRef === tool,
			}">

			<img :src="`assets/tools/tool_${tool.definition.id}.svg`">
		</ToolButton>

		<hr>

		<ToolButton
			@click="enableCustomRender = !enableCustomRender"
			:title="$t('enableCustomRender')"
			:class="{ active: enableCustomRender }">
			<img :src="compareUrl" width="28" height="28">
		</ToolButton>

		<hr>

		<ToolMenu v-if="activeToolRef" />
	</div>
</template>

<style scoped>

.toolbar {
	position: absolute;
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 8px;
	top: 0px;
	left: 0px;
	background-color: var(--background-color);
	border-radius: 4px;
	z-index: 20;
	max-height: calc(100vh - 30px);
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-width: thin;
}

@media (prefers-color-scheme: dark) {
	img {
		filter: invert(1);
	}
}

.tool.ducked {
	outline: 1px solid var(--primary-color);
}

hr {
	width: 100%;
}
</style>