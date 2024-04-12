<script setup lang="ts">
import Toolbar from "./Toolbar.vue";
import Sidebar from "./Sidebar.vue";
import { onMounted, ref, watch } from "vue";
import pg from "../init";
import DialogContainer from "./dialogs/DialogContainer.vue";
import { cancelAll, drop } from "../filesio/dropfiles";
import ContextMenu from "./CanvasContextMenu.vue";

onMounted(() => {
	pg.init();
})

const showSidebar = ref(true);

watch(showSidebar, () => {
	window.dispatchEvent(new Event("resize"));
}, { flush: "post" });
</script>

<template>
	<main>
		<DialogContainer />
		<Sidebar v-if="showSidebar" />
		<div class="canvas" id="fileDropzone">
			<div class="floating-ui">
				<Toolbar :showSidebar @toggleSidebar="showSidebar = !showSidebar" />
			</div>
			<ContextMenu>
				<canvas
					id="paperCanvas"
					data-paper-resize="true"
					data-paper-hidpi="off"
					@dragenter="cancelAll($event);"
					@dragover="cancelAll($event);"
					@drop="cancelAll($event); drop($event);"
				></canvas>
			</ContextMenu>
		</div>
	</main>
</template>

<style scoped>
main {
	display: flex;
	height: 100vh;
}

.sidebar {
	max-width: 300px;
	min-width: 250px;
	width: 20vw;
}

main .canvas {
	flex: 1;
	position: relative;
}
</style>