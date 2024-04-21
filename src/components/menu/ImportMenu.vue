<script setup lang="ts">
import { processFileInput } from "../../helper";
import { importAndAddImage, importAndAddSVG } from "../../import";
import { loadJSONDocument } from "../../document";
import { importTH2 } from "../../import/importWrapper.ts";
import { importXVI } from "../../import/importXVI";
import MenuButton from "../common/MenuButton.vue";

function fileUploadSVG(event) {
	processFileInput('text', event.target, function(data) {
		importAndAddSVG(data);
	});
};
function fileUploadJSON(event) {
	processFileInput('text', event.target, function(data) {
		loadJSONDocument(data);
	});
};
function fileUploadTH2(event) {
	processFileInput('text', event.target, function(data) {
		importTH2(data);
	});
};
function fileUploadXVI(event) {
	const filename = (event.target as HTMLInputElement).files[0].name;
	processFileInput('text', event.target, function(data) {
		importXVI(data, filename);
	});
};

function fileUploadImage(event) {
	processFileInput('dataURL', event.target, function(dataURL) {
		importAndAddImage(dataURL);
	});
};
</script>

<template>
	<ul class="sub-sub-menu">
		<MenuButton>
			<span>{{ $t("menu.json") }}</span>
			<input type="file" @change="fileUploadJSON" accept=".json" />
		</MenuButton>
		<MenuButton>
			<span>{{ $t("menu.image") }}</span>
			<input type="file" @change="fileUploadImage" accept=".gif, .jpg, .jpeg, .png" />
		</MenuButton>
		<MenuButton>
			<span>{{ $t("menu.svg") }}</span>
			<input type="file" @change="fileUploadSVG" accept=".svg" />
		</MenuButton>
		<MenuButton>
			<span>{{ $t("menu.th2") }}</span>
			<input type="file" @change="fileUploadTH2" accept=".th2" />
		</MenuButton>
		<MenuButton>
			<span>{{ $t("menu.xvi") }}</span>
			<input type="file" @change="fileUploadXVI" accept=".xvi" />
		</MenuButton>
	</ul>
</template>

<style scoped>
button {
	display: grid;
	grid-template-columns: 1fr;
	padding: 0;
}

button span, button input {
	grid-column-start: 1;
	grid-row-start: 1;
}

button span {
	padding: 8px;
}

button input {
	width: 100%;
	height: 100%;
	opacity: 0;
}
</style>