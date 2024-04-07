<script setup lang="ts">
import { pointTypes } from "../../../objectSettings/pointSymbolList";
import CustomList from "../../common/CustomList.vue";
import PanelContent from "../../common/PanelContent.vue";
import { pointOptions } from "../../../tools/point";
import PanelSection from "../../common/PanelSection.vue";

const options = pointOptions;
</script>

<template>
	<PanelContent>
		<PanelSection>
			<template #label>{{ $t("type") }}</template>
			<CustomList v-model="options.type" :options="pointTypes" />
		</PanelSection>
		<PanelSection v-if="options.type === `station`">
			<template #label>{{ $t("stationName") }}</template>
			<input type="text" v-model="options.stationName" />
		</PanelSection>
	</PanelContent>
</template>