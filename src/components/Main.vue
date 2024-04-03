<script setup>
import { onMounted } from "vue";
import pg from "../init";

onMounted(() => {
	pg.init();
})
</script>

<template>
Main works!

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