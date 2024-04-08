<script setup lang="ts">
import MenuScaffold from "../common/MenuScaffold.vue";
import MenuButton from "../common/MenuButton.vue";
import { handlers } from "../../menu";
import ImportMenu from "./ImportMenu.vue";
import editTH2 from "../../editTH2";
import Foldable from "../common/Foldable.vue";
</script>

<template>
	<div class="main-menu">
		<MenuScaffold>
			<template #label="{ toggle }">
				<!-- <svg class="burgerButton" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><line stroke-width="12" x1="0" y1="9.5" x2="100" y2="9.5"/><line stroke-width="12" x1="0" y1="50.5" x2="100" y2="50.5"/><line stroke-width="12" x1="0" y1="90.5" x2="100" y2="90.5"/></svg> -->
				<button class="top-button" @click="toggle()">Main</button>
			</template>
			<ul class="sub-menu">
				<MenuButton @click="handlers.clearDocument()">{{ $t(`menu.new`) }}</MenuButton>
				<li class="space"></li>
				<MenuButton @click="handlers.open()">{{ $t(`menu.open`) }}</MenuButton>
				<li class="space"></li>
				<div class="horizontal">
					<MenuButton @click="handlers.saveJSON()">{{ $t(`menu.save`) }}</MenuButton>
					<MenuButton @click="handlers.saveJSON(true)">{{ $t(`menu.saveAs`) }}</MenuButton>
				</div>
				<li class="space"></li>
				<MenuButton @click="handlers.historyPanel()">{{ $t(`menu.historyPanel`) }}</MenuButton>
				<MenuButton @click="handlers.openKeybindEditor()">{{ $t(`keybinds.title`) }}</MenuButton>
				<li class="space"></li>
				<Foldable>
					<template #title>{{ $t("menu.import") }}</template>
					<ImportMenu />
				</Foldable>
				<li class="space"></li>
				<div class="horizontal">
					<MenuButton @click="handlers.exportTH2()">{{ $t(`menu.export`) }}</MenuButton>
					<MenuButton @click="handlers.exportTH2(true)">{{ $t(`menu.exportAs`) }}</MenuButton>
				</div>
				<li class="space"></li>
				<Foldable>
					<template #title>{{ $t(`menu.otherExports`) }}</template>
					<ul class="sub-sub-menu">
						<MenuButton @click="handlers.exportImage()">{{ $t(`menu.image`) }}</MenuButton>
						<MenuButton @click="handlers.exportSVG()">{{ $t(`menu.svg`) }}</MenuButton>
						<MenuButton @click="handlers.downloadJSON()">{{ $t(`menu.downloadSave`) }}</MenuButton>
					</ul>
				</Foldable>
				<li class="space"></li>
				<Foldable>
					<template #title>{{ $t(`menu.view`) }}</template>
					<ul class="sub-sub-menu">
						<MenuButton @click="handlers.panToScrap()">{{ $t(`menu.center`) }}</MenuButton>
						<MenuButton @click="handlers.zoomIn()" title="Ctrl-ScrollUp">{{ $t(`menu.zoomIn`) }}</MenuButton>
						<MenuButton @click="handlers.zoomOut()" title="Ctrl-ScrollDown">{{ $t(`menu.zoomOut`) }}</MenuButton>
						<MenuButton @click="handlers.resetZoom()" title="Ctrl-1">{{ $t(`menu.resetZoom`) }}</MenuButton>
						<MenuButton @click="handlers.resetPan()">{{ $t(`menu.resetPan`) }}</MenuButton>
					</ul>
				</Foldable>
				<li class="space"></li>
				<MenuButton @click="handlers.resetSettings()">{{ $t(`menu.resetSettings`) }}</MenuButton>
				<li class="space"></li>
				<MenuButton @click="handlers.showConfigEditor()">{{ $t(`menu.showConfigEditor`) }}</MenuButton>
				<li class="space"></li>
				<MenuButton @click="handlers.about()" title="About">{{ $t(`menu.about`) }}</MenuButton>
			</ul>
		</MenuScaffold>
		<MenuScaffold>
			<template #label="{ toggle }">
				<button class="top-button" @click="toggle()">{{ $t(`edit`) }}</button>
			</template>
			<ul class="sub-menu">
				<MenuButton @click="editTH2.changeStationsNamespace()">{{ $t(`menu.changeNamespace`) }}</MenuButton>
				<li class="space"></li>
				<MenuButton @click="handlers.searchDialog()">{{ $t(`menu.search`) }}</MenuButton>
				<li class="space"></li>
				<MenuButton @click="handlers.validate()">{{ $t(`menu.validate`) }}</MenuButton>
				<li class="space"></li>
				<div class="horizontal">
					<MenuButton @click="handlers.undo()">{{ $t(`menu.undo`) }}</MenuButton>
					<MenuButton @click="handlers.redo()">{{ $t(`menu.redo`) }}</MenuButton>
				</div>
			</ul>
		</MenuScaffold>
		<MenuScaffold>
			<template #label="{ toggle }">
				<button class="top-button" @click="toggle()">{{ $t(`menu.scraps`) }}</button>
			</template>
			<ul class="sub-menu">
				<MenuButton @click="handlers.layerPanel()" title="Scrap Panel">{{ $t(`menu.scrapPanel`) }}</MenuButton>
				<MenuButton @click="editTH2.showScrapOptionsPanel()">{{ $t(`menu.editScrap`) }}</MenuButton>
				<MenuButton @click="handlers.xviMode()">{{ $t(`menu.xviEdit`) }}</MenuButton>
			</ul>
		</MenuScaffold>
	</div>
</template>

<style scoped>
.main-menu {
	display: flex;
	flex-direction: row;
}

@media (prefers-color-scheme: dark) {
	.main-menu {
		background-color: #e7e7e7;
		color: #000;
	}
}

@media not (prefers-color-scheme: dark) {
	.main-menu {
		background-color: #111111;
		color: #fff;
	}
}

h3 {
	margin: 8px 0;
}

button.top-button {
	border: none;
	background: none;
	color: inherit;
	padding: 4px 8px;
	margin: 4px;
	border-radius: 4px;
}

button.top-button:hover {
	background-color: var(--hover-color);
}

.sub-menu {
	display: flex;
	flex-direction: column;
	background-color: var(--background-color);
	color: var(--text-color);
	border: var(--border-color) solid 1px;
	border-radius: 4px;
	padding: 8px;
	width: 200px;
	max-height: 90vh;
	overflow-y: auto;
}
</style>