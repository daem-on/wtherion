<script setup lang="ts">
import { bezierOptions, showBezierPanel } from "../../../tools/bezier";
import subtypeList from "../../../res/subtype-list.json";
import { wallTypes } from "../../../res/wallTypes";
import CustomList from "../../common/CustomList.vue";
import IntInput from "../../common/IntInput.vue";
import PanelContent from "../../common/PanelContent.vue";
import PanelSection from "../../common/PanelSection.vue";

const options = bezierOptions;

</script>

<template>
	<PanelContent v-if="showBezierPanel">
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="options.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<PanelSection :label="$t(`subtype.name`)" v-if="[`wall`, `border`, `water-flow`].includes(options.type)">
			<CustomList v-model="options.subtype" :options="subtypeList.wall" :imageRoot="`assets/rendered/subtype`" />
		</PanelSection>
		<PanelSection :label="$t(`size`)" v-if="options.type === `slope`">
			<IntInput v-model="options.size" />
		</PanelSection>
	</PanelContent>
</template>