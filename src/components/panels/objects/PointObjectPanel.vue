<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelFoldable from '../../common/PanelFoldable.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import symbolList from "../../../res/symbol-list.json";
import { computed, watch } from 'vue';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import editTH2 from '../../../editTH2';

const props = defineProps<{
	selection: paper.Shape
}>();

const settings = computed(() => getSettings(props.selection));

const canHaveValue = computed(() => {
	return ["height", "passage-height", "altitude", "dimensions"].includes(settings.value.type);
});

const canHaveText = computed(() => {
	return ["label", "remark", "continuation"].includes(settings.value.type);
});

watch(settings, () => {
	editTH2.drawPoint(props.selection);
}, { deep: true });

const symbolCategories = new Map<string, string[]>(Object.entries(symbolList));
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :categories="symbolCategories" imageRoot="assets/rendered/point" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.invisible" />
		</PanelSection>
		<PanelSection :label="$t(`value`)" v-if="canHaveValue">
			<input type="text" v-model="settings.value" />
		</PanelSection>
		<PanelSection :label="$t(`text`)" v-if="canHaveText">
			<input type="text" v-model="settings.text" />
		</PanelSection>
		<PanelSection :label="$t(`stationName`)" v-if="settings.type === `station`">
			<input type="text" v-model="settings.name" />
		</PanelSection>
		<PanelFoldable>
			<template #title>
				{{ $t("advanced") }}
			</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.id" />
			</PanelSection>
			<PanelSection :label="$t(`clip.name`)">
				<select v-model="settings.clip">
					<option :value="0">{{ $t("default") }}</option>
					<option :value="1">{{ $t("clip.on") }}</option>
					<option :value="2">{{ $t("clip.off") }}</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`scale`)">
				<select v-model="settings.scale">
					<option value="xs">XS</option>
					<option value="s">S</option>
					<option value="m">M</option>
					<option value="l">L</option>
					<option value="xl">XL</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`place.name`)">
				<select v-model="settings.place">
					<option :value="2">{{ $t("top") }}</option>
					<option :value="1">{{ $t("bottom") }}</option>
					<option :value="0">{{ $t("default") }}</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`otherSettings`)" column>
				<textarea rows="2" v-model="settings.otherSettings" />
			</PanelSection>
		</PanelFoldable>
	</PanelContent>
</template>

<style scoped>
textarea {
	min-width: 100%;
    max-width: 100%;
	font-family: monospace;
	height: auto;
}
</style>