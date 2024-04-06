<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import Foldable from '../../common/Foldable.vue';
import PanelContent from '../../common/PanelContent.vue';
import getSettings from '../../../objectSettings/model/getSettings';
import { pointTypes } from '../../../objectSettings/pointSymbolList';
import { computed } from 'vue';
import BooleanInput from '../../common/BooleanInput.vue';

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
</script>

<template>
	<PanelContent>
		<label class="panel-section">
			<h2>{{ $t("type") }}</h2>
			<CustomList v-model="settings.type" :options="pointTypes" />
		</label>
		<label class="panel-section">
			<h2>{{ $t("invisible") }}</h2>
			<BooleanInput v-model="settings.invisible" />
		</label>
		<label class="panel-section" v-if="canHaveValue">
			<h2>{{ $t("value") }}</h2>
			<input type="text" v-model="settings.value" />
		</label>
		<label class="panel-section" v-if="canHaveText">
			<h2>{{ $t("text") }}</h2>
			<input type="text" v-model="settings.text" />
		</label>
		<label class="panel-section" v-if="settings.type === `station`">
			<h2>{{ $t("stationName") }}</h2>
			<input type="text" v-model="settings.name" />
		</label>
		<Foldable>
			<template #title>
				{{ $t("advanced") }}
			</template>
			<label class="panel-section">
				<h2>{{ $t("id") }}</h2>
				<input type="text" v-model="settings.id" />
			</label>
			<label class="panel-section">
				<h2>{{ $t("clip") }}</h2>
				<select v-model="settings.clip">
					<option :value="0">{{ $t("clip.default") }}</option>
					<option :value="1">{{ $t("clip.on") }}</option>
					<option :value="2">{{ $t("clip.off") }}</option>
				</select>
			</label>
			<label class="panel-section">
				<h2>{{ $t("scale") }}</h2>
				<select v-model="settings.scale">
					<option value="xs">XS</option>
					<option value="s">S</option>
					<option value="m">M</option>
					<option value="l">L</option>
					<option value="xl">XL</option>
				</select>
			</label>
			<label class="panel-section">
				<h2>{{ $t("place") }}</h2>
				<select v-model="settings.place">
					<option :value="2">{{ $t("top") }}</option>
					<option :value="1">{{ $t("bottom") }}</option>
					<option :value="0">{{ $t("default") }}</option>
				</select>
			</label>
			<label class="panel-section">
				<h2>{{ $t("otherSettings") }}</h2>
				<textarea v-model="settings.otherSettings" />
			</label>
		</Foldable>
	</PanelContent>
</template>