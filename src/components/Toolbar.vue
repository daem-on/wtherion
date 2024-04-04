<script setup>
	import { getToolList } from "../tools";
	import { switchTool } from "../toolbar";

	const toolList = getToolList().filter(tool => tool.type !== "hidden");
</script>
<template>
	<div>
		<button v-for="tool in toolList" :key="tool.id" @click="switchTool(tool.id)">
			{{ tool.name }}
		</button>
	</div>
</template>