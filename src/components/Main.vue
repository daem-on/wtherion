<script setup>
import Toolbar from "./Toolbar.vue";
import { onMounted } from "vue";
import pg from "../init";

onMounted(() => {
	pg.init();
})
</script>

<template>
	<div class="ui">
		Main works!
		<Toolbar />
	</div>

	<div id="fileDropzone">
		<canvas
			id="paperCanvas"
			data-paper-resize="true"
			data-paper-hidpi="off"
			ondragenter="pg.dropfiles.cancelAll(event);"
			ondragover="pg.dropfiles.cancelAll(event);"
			ondrop="pg.dropfiles.cancelAll(event); pg.dropfiles.drop(event);"
		></canvas>
	</div>
</template>

<style scoped>
	.ui {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
	}
</style>