<script setup lang="ts">
import Toolbar from "./Toolbar.vue";
import Sidebar from "./Sidebar.vue";
import { onMounted, ref, watch } from "vue";
import pg from "../init";
import leftPanelOpenUrl from "../../assets/ui/left_panel_open.svg";
import leftPanelCloseUrl from "../../assets/ui/left_panel_close.svg";
import ToolButton from "./common/ToolButton.vue";

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
		<Sidebar v-if="showSidebar" />
		<div class="canvas" id="fileDropzone">
			<div class="floating-ui">
				<Toolbar />
				<ToolButton class="show-sidebar" @click="showSidebar = !showSidebar">
					<img :src="showSidebar ? leftPanelCloseUrl : leftPanelOpenUrl" />
				</ToolButton>
			</div>
			<canvas
				id="paperCanvas"
				data-paper-resize="true"
				data-paper-hidpi="off"
				ondragenter="pg.dropfiles.cancelAll(event);"
				ondragover="pg.dropfiles.cancelAll(event);"
				ondrop="pg.dropfiles.cancelAll(event); pg.dropfiles.drop(event);"
			></canvas>
		</div>
	</main>
</template>

<style scoped>
main {
	display: flex;
	height: 100vh;

	color: var(--text-color);
	background-color: var(--background-color);
}

.sidebar {
	max-width: 300px;
	min-width: 250px;
	width: 20vw;
	color-scheme: light dark;
}

main .canvas {
	flex: 1;
	position: relative;
}

.floating-ui {
	color-scheme: light dark;
}

.show-sidebar {
	position: absolute;
	bottom: 4px;
	left: 4px;
	z-index: 10;
}

.show-sidebar img {
	width: 32px;
	height: 32px;
}

@media (prefers-color-scheme: dark) {
	img, canvas {
		filter: invert(1);
	}
}
</style>