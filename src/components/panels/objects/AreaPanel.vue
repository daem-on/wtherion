<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import CustomList from '../../common/CustomList.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import { AreaSettings } from '../../../objectSettings/model/AreaSettings';
import { wallTypes } from "../../../res/wallTypes";
import areaList from "../../../res/area-list.json";
import PanelFoldable from '../../common/PanelFoldable.vue';
import LineSubtypeSection from '../fragments/LineSubtypeSection.vue';
import { snapshot } from '../../../undo';
import { drawArea } from '../../../objectDefs';
import ArbitrarySettingSection from '../fragments/ArbitrarySettingSection.vue';
import { ReactiveMap } from 'src/objectSettings/reactiveMap';
import { LineSettings } from 'src/objectSettings/model/LineSettings';

const props = defineProps<{
	selection: paper.Path
}>();

const settings = computed(() => getSettings(props.selection) as ReactiveMap<AreaSettings>);
const dirty = ref(false);

watch(settings, () => {
	drawArea(props.selection);
	dirty.value = true;
}, { deep: true });

onUnmounted(() => {
	if (dirty.value) snapshot("editArea");
});
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :options="areaList" :imageRoot="`assets/rendered/area`" />
		</PanelSection>
		<PanelSection :label="$t(`outlineType`)">
			<CustomList v-model="settings.lineSettings.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<LineSubtypeSection :type="settings.lineSettings.type" v-model="settings.lineSettings.subtype" />
		<PanelSection>
			<template #label>{{ $t(`invisible`) }} - {{ $t(`areaOptions.outline`) }}</template>
			<BooleanInput v-model="settings.lineSettings.invisible" />
		</PanelSection>
		<PanelSection>
			<template #label>{{ $t(`invisible`) }} - {{ $t(`areaOptions.area`) }}</template>
			<BooleanInput v-model="settings.invisible" />
		</PanelSection>
		<PanelFoldable>
			<template #title>{{ $t("advanced") }}</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.lineSettings.id" />
			</PanelSection>
			<h3>{{ $t(`otherSettings`) }} - {{ $t(`areaOptions.outline`) }}</h3>
			<ArbitrarySettingSection
				:editing="(settings.lineSettings as ReactiveMap<LineSettings>)"
				:exclude="['className', 'type', 'subtype', 'text', 'reverse', 'invisible', 'size', 'outline', 'id', 'clip', 'place', 'visibility']"
			/>
			<h3>{{ $t(`otherSettings`) }} - {{ $t(`areaOptions.area`) }}</h3>
			<ArbitrarySettingSection
				:editing="settings"
				:exclude="['className', 'type', 'lineSettings', 'invisible']"
			/>
		</PanelFoldable>
	</PanelContent>
</template>

<style scoped>
h3 {
	margin: 8px 0;
}
</style>