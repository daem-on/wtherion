<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import CustomList from '../../common/CustomList.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import AreaSettings from '../../../objectSettings/model/AreaSettings';
import { wallTypes } from "../../../res/wallTypes";
import areaList from "../../../res/area-list.json";
import PanelFoldable from '../../common/PanelFoldable.vue';
import LineSubtypeSection from '../fragments/LineSubtypeSection.vue';
import { snapshot } from '../../../undo';
import { drawArea } from '../../../objectDefs';
import ArbitrarySettingSection from '../fragments/ArbitrarySettingSection.vue';

const props = defineProps<{
	selection: paper.Path
}>();

const settings = computed(() => getSettings(props.selection) as AreaSettings);
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
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.lineSettings.invisible" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.invisible" />
		</PanelSection>
		<PanelFoldable>
			<template #title>{{ $t("advanced") }}</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.lineSettings.id" />
			</PanelSection>
			<h3>{{ $t(`otherSettings`) }}</h3>
			<ArbitrarySettingSection
				:editing="(settings.lineSettings as any)"
				:exclude="['className', 'type', 'subtype', 'text', 'reverse', 'invisible', 'size', 'outline', 'id', 'clip', 'place', 'visibility']"
			/>
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