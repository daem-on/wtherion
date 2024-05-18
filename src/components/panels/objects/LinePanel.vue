<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelFoldable from '../../common/PanelFoldable.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import { computed, onUnmounted, ref, watch } from 'vue';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import { LineSettings } from '../../../objectSettings/model/LineSettings';
import { wallTypes } from "../../../res/wallTypes";
import LineSubtypeSection from '../fragments/LineSubtypeSection.vue';
import { snapshot } from '../../../undo';
import { drawLine } from '../../../objectDefs';
import { ReactiveMap } from '../../../objectSettings/reactiveMap';
import ArbitrarySettingSection from '../fragments/ArbitrarySettingSection.vue';

const props = defineProps<{
	selection: paper.Path
}>();

const settings = computed(() => getSettings(props.selection) as ReactiveMap<LineSettings>);
const dirty = ref(false);

watch(settings, () => {
	drawLine(props.selection);
	dirty.value = true;
}, { deep: true });

onUnmounted(() => {
	if (dirty.value) snapshot("editLine");
});
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<LineSubtypeSection :type="settings.type" v-model="settings.subtype" />
		<PanelSection :label="$t(`text`)" v-if="settings.type === `label`">
			<input type="text" v-model="settings.text" />
		</PanelSection>
		<PanelSection :label="$t(`reverse`)">
			<BooleanInput v-model="settings.reverse" />
		</PanelSection>
		<PanelSection :label="$t(`invisible`)">
			<BooleanInput v-model="settings.invisible" />
		</PanelSection>
		<PanelSection :label="$t(`size`)" v-if="settings.type === `slope`">
			<input type="text" v-model="settings.size" />
		</PanelSection>
		<PanelSection :label="$t(`outline.name`)">
			<select v-model="settings.outline">
				<option :value="undefined">{{ $t(`default`) }}</option>
				<option value="in">{{ $t(`outline.in`) }}</option>
				<option value="out">{{ $t(`outline.out`) }}</option>
				<option value="none">{{ $t(`outline.none`) }}</option>
			</select>
		</PanelSection>

		<PanelFoldable>
			<template #title>
				{{ $t(`advanced`) }}
			</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.id" />
			</PanelSection>
			<PanelSection :label="$t(`clip.name`)">
				<select v-model="settings.clip">
					<option value="undefined">{{ $t(`default`) }}</option>
					<option value="on">{{ $t(`clip.on`) }} ✂</option>
					<option value="off">{{ $t(`clip.off`) }}</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`place.name`)">
				<select v-model="settings.place">
					<option :value="undefined">{{ $t(`default`) }} ⦿</option>
					<option value="bottom">{{ $t(`bottom`) }} ▼</option>
					<option value="top">{{ $t(`top`) }} ▲</option>
				</select>
			</PanelSection>
			<h3>{{ $t(`otherSettings`) }}</h3>
			<ArbitrarySettingSection
				:editing="settings"
				:exclude="['className', 'type', 'subtype', 'text', 'reverse', 'invisible', 'size', 'outline', 'id', 'clip', 'place', 'subtypes', 'segmentSettings', 'visibility']"
			/>
		</PanelFoldable>
	</PanelContent>
</template>

<style scoped>
h3 {
	margin: 8px 0;
}
</style>