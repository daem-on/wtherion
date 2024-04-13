<script setup lang="ts">
import symbolList from "../../../res/symbol-list.json";
import CustomList from "../../common/CustomList.vue";
import PanelContent from "../../common/PanelContent.vue";
import { pointOptions } from "../../../tools/point";
import PanelSection from "../../common/PanelSection.vue";
import PointSubtypeSection from "../fragments/PointSubtypeSection.vue";

const options = pointOptions;

const symbolCategories = new Map<string, string[]>(Object.entries(symbolList));
</script>

<template>
	<PanelContent>
		<PanelSection>
			<template #label>{{ $t("type") }}</template>
			<CustomList v-model="options.type" :categories="symbolCategories" imageRoot="assets/rendered/point" />
		</PanelSection>
		<PointSubtypeSection :type="options.type" v-model="options.subtype" />
		<PanelSection v-if="options.type === `station`">
			<template #label>{{ $t("stationName") }}</template>
			<input type="text" v-model="options.stationName" />
		</PanelSection>
	</PanelContent>
</template>