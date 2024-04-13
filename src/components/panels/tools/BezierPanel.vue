<script setup lang="ts">
import { bezierOptions, showBezierPanel } from "../../../tools/bezier";
import { wallTypes } from "../../../res/wallTypes";
import CustomList from "../../common/CustomList.vue";
import IntInput from "../../common/IntInput.vue";
import PanelContent from "../../common/PanelContent.vue";
import PanelSection from "../../common/PanelSection.vue";
import LineSubtypeSection from "../fragments/LineSubtypeSection.vue";

const options = bezierOptions;

</script>

<template>
	<PanelContent v-if="showBezierPanel">
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="options.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<LineSubtypeSection :type="options.type" v-model="options.subtype" />
		<PanelSection :label="$t(`size`)" v-if="options.type === `slope`">
			<IntInput v-model="options.size" />
		</PanelSection>
	</PanelContent>
</template>