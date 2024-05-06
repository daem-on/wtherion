<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelFoldable from '../../common/PanelFoldable.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import symbolList from "../../../res/symbol-list.json";
import { computed, onUnmounted, ref, watch } from 'vue';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import PointSubtypeSection from '../fragments/PointSubtypeSection.vue';
import { snapshot } from '../../../undo';
import { drawPoint } from '../../../objectDefs';
import ArbitrarySettingSection from '../fragments/ArbitrarySettingSection.vue';

const props = defineProps<{
	selection: paper.SymbolItem
}>();

const settings = computed(() => getSettings(props.selection));
const dirty = ref(false);

const canHaveValue = computed(() => {
	return ["height", "passage-height", "altitude", "dimensions"].includes(settings.value.type);
});

const canHaveText = computed(() => {
	return ["label", "remark", "continuation"].includes(settings.value.type);
});

watch(settings, () => {
	drawPoint(props.selection);
	dirty.value = true;
}, { deep: true });

const symbolCategories = new Map<string, string[]>(Object.entries(symbolList));

onUnmounted(() => {
	if (dirty.value) snapshot("editPoint");
});
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :categories="symbolCategories" imageRoot="assets/rendered/point" />
		</PanelSection>
		<PointSubtypeSection :type="settings.type" v-model="settings.subtype" />
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
					<option :value="undefined">{{ $t("default") }}</option>
					<option value="on">{{ $t("clip.on") }}</option>
					<option value="off">{{ $t("clip.off") }}</option>
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
					<option value="top">{{ $t("top") }}</option>
					<option value="bottom">{{ $t("bottom") }}</option>
					<option :value="undefined">{{ $t("default") }}</option>
				</select>
			</PanelSection>
			<h3>{{ $t(`otherSettings`) }}</h3>
			<ArbitrarySettingSection
				:editing="settings"
				:exclude="['className', 'type', 'subtype', 'invisible', 'value', 'text', 'name', 'id', 'clip', 'scale', 'place', 'visibility']"
			/>
		</PanelFoldable>
	</PanelContent>
</template>

<style scoped>
h3 {
	margin: 8px 0;
}
</style>