<script setup lang="ts">
import { computed } from "vue";
import { activeToolRef, duckedToolRef, switchTool } from "../tools";
import { toolsRef } from "../tools";

const toolList = computed(() => {
	if (!toolsRef.value) return [];
	return Object.values(toolsRef.value).filter(tool => tool.definition.type !== "hidden");
});
</script>

<template>
	<div class="toolbar">
		<button
			class="tool"
			v-for="tool in toolList"
			:key="tool.definition.id"
			@click="switchTool(tool)"
			:title="$t(tool.definition.name)"
			:class="{
				active: activeToolRef === tool,
				ducked: duckedToolRef === tool,
			}">

			<img :src="`assets/tools/tool_${tool.definition.id}.svg`">
		</button>
	</div>
</template>

<style scoped>

.toolbar {
	position: absolute;
	padding: 14px 5px 8px 8px;
	top: 30px;
	left:0px;
	background-color: #fff;
	border-radius: 0 0 3px 0;
	z-index: 20;
	max-height: calc(100vh - 30px);
	overflow-y: auto;
	overflow-x: hidden;
}

.tool {
	position: relative;
	display:inline-block;
	background-color: #fff;
	line-height: 0;
	text-align: center;
	font-size: 0;
	padding: 0;
	width: 36px;
	height: 36px;
	margin: 0 0 2px 0;
	cursor:pointer;
	border-radius: 3px;
	overflow: hidden;
	background-repeat:no-repeat;
	background-size: 28px;
	border: none;
}

.tool:hover,
.tool.active {
	background-color: #e2e2e2;
}

.tool.ducked {
	outline: 1px solid var(--primary-color);
}
</style>