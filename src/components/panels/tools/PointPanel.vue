<script setup lang="ts">
import { pointTypes } from "../../../objectSettings/pointSymbolList";
import CustomList from "../../common/CustomList.vue";
import PanelContent from "../../common/PanelContent.vue";
import { pointOptions } from "../../../tools/point";

const options = pointOptions;
</script>

<template>
	<PanelContent>
		<label class="panel-section">
			<h2>{{ $t("type") }}</h2>
			<CustomList v-model="options.type" :options="pointTypes" />
		</label>
		<label class="panel-section" v-if="options.type === `station`">
			<h2>{{ $t("stationName") }}</h2>
			<input type="text" v-model="options.stationName" />
		</label>
	</PanelContent>
</template>