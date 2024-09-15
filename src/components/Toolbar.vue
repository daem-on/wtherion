<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { activeToolRef, switchTool, duckedToolRef } from "@daem-on/graphite/tools";
import { toolsRef } from "@daem-on/graphite/tools";
import ToolButton from "./common/ToolButton.vue";
import compareUrl from "../../assets/ui/compare.svg";
import { setCustomRender } from "../render";
import ToolMenu from "./ToolMenu.vue";
import leftPanelOpenUrl from "../../assets/ui/left_panel_open.svg";
import leftPanelCloseUrl from "../../assets/ui/left_panel_close.svg";

const toolList = computed(() => {
	if (!toolsRef.value) return [];
	return Object.values(toolsRef.value).filter(tool => tool.definition.type !== "hidden");
});

const enableCustomRender = ref(true);

watch(() => enableCustomRender.value, value => {
	setCustomRender(value);
});

const emit = defineEmits(["toggleSidebar"]);

defineProps<{ showSidebar: boolean }>();
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

		<div class="spacer"></div>

		<ToolButton class="show-sidebar" @click="emit(`toggleSidebar`)" :title="$t(`showSidebar`)">
			<img :src="showSidebar ? leftPanelCloseUrl : leftPanelOpenUrl" width="28" height="28" />
		</ToolButton>
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
	height: 100vh;
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

.spacer {
	flex: 1;
}

hr {
	width: 100%;
}
</style>