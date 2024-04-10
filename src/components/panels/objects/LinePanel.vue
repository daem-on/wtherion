<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelFoldable from '../../common/PanelFoldable.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import { computed, watch } from 'vue';
import BooleanInput from '../../common/BooleanInput.vue';
import PanelSection from '../../common/PanelSection.vue';
import editTH2 from '../../../editTH2';
import LineSettings from '../../../objectSettings/model/LineSettings';
import subtypeList from "../../../res/subtype-list.json";
import { wallTypes } from "../../../res/wallTypes";

const props = defineProps<{
	selection: paper.Path
}>();

const settings = computed(() => getSettings(props.selection) as LineSettings);

const canHaveSubtype = computed(() => {
	return ["wall", "border", "water-flow"].includes(settings.value.type);
});

watch(settings, () => {
	editTH2.drawLine(props.selection);
}, { deep: true });
</script>

<template>
	<PanelContent>
		<PanelSection :label="$t(`type`)">
			<CustomList v-model="settings.type" :options="wallTypes" :imageRoot="`assets/rendered`" />
		</PanelSection>
		<PanelSection :label="$t(`subtype`)" v-if="canHaveSubtype">
			<CustomList v-model="settings.subtype" v-if="settings.type === `wall`" :options="subtypeList.wall" :imageRoot="`assets/rendered/subtype`" />
			<CustomList v-model="settings.subtype" v-if="settings.type === `border`" :options="subtypeList.border" />
			<CustomList v-model="settings.subtype" v-if="settings.type === `water-flow`" :options="subtypeList[`water-flow`]" :imageRoot="`assets/rendered/subtype`" />
		</PanelSection>
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
		<PanelSection :label="$t(`outline`)">
			<select v-model="settings.outline">
				<option :value="0">{{ $t(`default`) }}</option>
				<option :value="1">{{ $t(`outline.in`) }}</option>
				<option :value="2">{{ $t(`outline.out`) }}</option>
				<option :value="3">{{ $t(`outline.none`) }}</option>
			</select>
		</PanelSection>

		<PanelFoldable>
			<template #title>
				{{ $t(`advanced`) }}
			</template>
			<PanelSection :label="$t(`id`)">
				<input type="text" v-model="settings.id" />
			</PanelSection>
			<PanelSection :label="$t(`clip`)">
				<select v-model="settings.clip">
					<option :value="0">{{ $t(`default`) }}</option>
					<option :value="1">{{ $t(`clip.on`) }} ✂</option>
					<option :value="2">{{ $t(`clip.off`) }}</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`place`)">
				<select v-model="settings.place">
					<option :value="0">{{ $t(`default`) }} ⦿</option>
					<option :value="1">{{ $t(`bottom`) }} ▼</option>
					<option :value="2">{{ $t(`top`) }} ▲</option>
				</select>
			</PanelSection>
			<PanelSection :label="$t(`otherSettings`)" column>
				<textarea v-model="settings.otherSettings" />
			</PanelSection>
		</PanelFoldable>
	</PanelContent>
</template>

<style scoped>
textarea {
	min-width: 100%;
    max-width: 100%;
	font-family: monospace;
}
</style>