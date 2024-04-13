<script setup lang="ts">
import PanelContent from "../../common/PanelContent.vue";
import BooleanInput from "../../common/BooleanInput.vue";
import FloatInput from "../../common/FloatInput.vue";
import IntInput from "../../common/IntInput.vue";
import CustomList from "../../common/CustomList.vue";
import { drawOptions } from "../../../tools/draw";
import { wallTypes } from "../../../res/wallTypes";
import PanelFoldable from "../../common/PanelFoldable.vue";
import PanelSection from "../../common/PanelSection.vue";
import LineSubtypeSection from "../fragments/LineSubtypeSection.vue";

const options = drawOptions;
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="options.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<LineSubtypeSection :type="options.type" v-model="options.subtype" />
		<PanelSection :label="$t(`size`)" v-if="options.type === `slope`">
			<IntInput v-model="options.size" />
		</PanelSection>
		<PanelFoldable>
			<template #title>{{ $t("toolOptions") }}</template>
			<PanelSection :label="$t(`draw.pointDistance`)">
				<IntInput v-model="options.pointDistance" :min="1" />
			</PanelSection>
			<PanelSection :label="$t(`draw.drawParallelLines`)">
				<BooleanInput v-model="options.drawParallelLines" />
			</PanelSection>
			<PanelSection :label="$t(`draw.lines`)" v-if="options.drawParallelLines">
				<IntInput v-model="options.lines" :min="1" />
			</PanelSection>
			<PanelSection :label="$t(`draw.lineDistance`)" v-if="options.drawParallelLines">
				<FloatInput v-model="options.lineDistance" :min="0" />
			</PanelSection>
			<PanelSection :label="$t(`draw.closePath`)">
				<select v-model="options.closePath">
					<option value="near start">{{ $t("draw.nearStart") }}</option>
					<option value="always">{{ $t("draw.always") }}</option>
					<option value="never">{{ $t("draw.never") }}</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`draw.smoothPath`)">
				<BooleanInput v-model="options.smoothPath" />
			</PanelSection>
			<PanelSection :label="$t(`draw.simplifyPath`)">
				<BooleanInput v-model="options.simplifyPath" />
			</PanelSection>
		</PanelFoldable>
	</PanelContent>
</template>