<script setup lang="ts">
import { computed, watch } from 'vue';
import CustomList from '../../common/CustomList.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import editTH2 from '../../../editTH2';
import AreaSettings from '../../../objectSettings/model/AreaSettings';
import subtypeList from "../../../res/subtype-list.json";
import { wallTypes } from "../../../res/wallTypes";
import areaList from "../../../res/area-list.json";
import Foldable from '../../common/Foldable.vue';

const props = defineProps<{
	selection: paper.Path
}>();

const settings = computed(() => getSettings(props.selection) as AreaSettings);

const canHaveLineSubtype = computed(() => {
	return ["wall", "border", "water-flow"].includes(settings.value.lineSettings.type);
});

watch(settings, () => {
	editTH2.drawArea(props.selection);
}, { deep: true });
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :options="areaList" :imageRoot="`assets/rendered/area`" />
		</PanelSection>
		<PanelSection :label="$t(`outlineType`)">
			<CustomList v-model="settings.lineSettings.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<PanelSection :label="$t(`lineSubtype`)" v-if="canHaveLineSubtype">
			<CustomList v-model="settings.lineSettings.subtype" v-if="settings.lineSettings.type === `wall`" :options="subtypeList.wall" :imageRoot="`assets/rendered/subtype`" />
			<CustomList v-model="settings.lineSettings.subtype" v-if="settings.lineSettings.type === `border`" :options="subtypeList.border" />
			<CustomList v-model="settings.lineSettings.subtype" v-if="settings.lineSettings.type === `water-flow`" :options="subtypeList[`water-flow`]" :imageRoot="`assets/rendered/subtype`" />
		</PanelSection>
		<PanelSection :label="$t(`areaType`)">
			<CustomList v-model="settings.type" :options="areaList" :imageRoot="`assets/rendered/area`" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.lineSettings.invisible" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.invisible" />
		</PanelSection>
		<Foldable>
			<template #title>{{ $t("advanced") }}</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.lineSettings.id" />
			</PanelSection>
			<PanelSection :label="$t(`otherSettings`)" column>
				<textarea v-model="settings.lineSettings.otherSettings"></textarea>
			</PanelSection>
		</Foldable>
	</PanelContent>
</template>