<script setup lang="ts">
import PanelContent from "../../common/PanelContent.vue";
import BooleanInput from "../../common/BooleanInput.vue";
import FloatInput from "../../common/FloatInput.vue";
import IntInput from "../../common/IntInput.vue";
import CustomList from "../../common/CustomList.vue";
import { drawOptions } from "../../../tools/draw";
import { wallTypes } from "../../../res/wallTypes";
import subtypeList from "../../../res/subtype-list.json";
import Foldable from "../../common/Foldable.vue";

const options = drawOptions;
</script>

<template>
	<PanelContent>
		<label class="panel-section">
			<h2>{{ $t("type") }}</h2>
			<CustomList v-model="options.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</label>
		<label class="panel-section" v-if="[`wall`, `border`, `water-flow`].includes(options.type)">
			<h2>{{ $t("subtype") }}</h2>
			<CustomList v-model="options.subtype" :options="subtypeList.wall" :imageRoot="`assets/rendered/subtype`" />
		</label>
		<label class="panel-section" v-if="options.type === `slope`">
			<h2>{{ $t("size") }}</h2>
			<IntInput v-model="options.size" />
		</label>
		<Foldable>
			<template #title>{{ $t("toolOptions") }}</template>
			<label class="panel-section">
				<h2>{{ $t("draw.pointDistance") }}</h2>
				<IntInput v-model="options.pointDistance" :min="1" />
			</label>
			<label class="panel-section">
				<h2>{{ $t("draw.drawParallelLines") }}</h2>
				<BooleanInput v-model="options.drawParallelLines" />
			</label>
			<label class="panel-section" v-if="options.drawParallelLines">
				<h2>{{ $t("draw.lines") }}</h2>
				<IntInput v-model="options.lines" :min="1" />
			</label>
			<label class="panel-section" v-if="options.drawParallelLines">
				<h2>{{ $t("draw.lineDistance") }}</h2>
				<FloatInput v-model="options.lineDistance" :min="0" />
			</label>
			<label class="panel-section">
				<h2>{{ $t("draw.closePath") }}</h2>
				<select v-model="options.closePath">
					<option value="near start">{{ $t("draw.nearStart") }}</option>
					<option value="always">{{ $t("draw.always") }}</option>
					<option value="never">{{ $t("draw.never") }}</option>
				</select>
			</label>
			<label class="panel-section">
				<h2>{{ $t("draw.smoothPath") }}</h2>
				<BooleanInput v-model="options.smoothPath" />
			</label>
			<label class="panel-section">
				<h2>{{ $t("draw.simplifyPath") }}</h2>
				<BooleanInput v-model="options.simplifyPath" />
			</label>
		</Foldable>
	</PanelContent>
</template>