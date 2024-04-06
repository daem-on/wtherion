<script setup lang="ts">
import { bezierOptions, showBezierPanel } from "../../tools/bezier";
import subtypeList from "../../res/subtype-list.json";
import { wallTypes } from '../../res/wallTypes';
import CustomList from '../common/CustomList.vue';
import IntInput from '../common/IntInput.vue';
import PanelContent from '../common/PanelContent.vue';

const options = bezierOptions;

</script>

<template>
	<PanelContent v-if="showBezierPanel">
		<div class="panel-section">
			<h2>{{ $t("type") }}</h2>
			<CustomList v-model="options.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</div>
		<div class="panel-section" v-if="[`wall`, `border`, `water-flow`].includes(options.type)">
			<h2>{{ $t("subtype") }}</h2>
			<CustomList v-model="options.subtype" :options="subtypeList.wall" :imageRoot="`assets/rendered/subtype`" />
		</div>
		<div class="panel-section" v-if="options.type === `slope`">
			<h2>{{ $t("size") }}</h2>
			<IntInput v-model="options.size" />
		</div>
	</PanelContent>
</template>