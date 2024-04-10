<script setup lang="ts">
import { ref } from 'vue';
import { loadConfig, exists, get, assign } from '../../filesio/configManagement';
import BooleanInput from '../common/BooleanInput.vue';
import IntInput from '../common/IntInput.vue';
import PanelSection from '../common/PanelSection.vue';
import { removeDialog } from '../../modal';

const options = ref({
	detailSelectGuides: false,
	showSegmentOptionPanel: false,
	lockLayerNames: false,
	githubToken: "",
	inspectTolerance: 8,
	colorInactive: false,
	saveHandler: "localStorage",
	enableAsyncClipboard: false,
});

function save() {
	assign(options.value);
	removeDialog("configDialog");
}

loadConfig();

for (const key in options.value) {
	if (exists(key)) {
		options.value[key] = get(key);
	}
}

</script>

<template>
	<div>
		<PanelSection :label="$t(`config.detailSelectGuides`)">
			<BooleanInput v-model="options.detailSelectGuides" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.showSegmentOptionPanel`)">
			<BooleanInput v-model="options.showSegmentOptionPanel" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.lockLayerNames`)">
			<BooleanInput v-model="options.lockLayerNames" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.githubToken`)">
			<input type="text" v-model="options.githubToken" />
		</PanelSection>
		<PanelSection :label="$t(`config.inspectTolerance`)">
			<IntInput v-model="options.inspectTolerance" ></IntInput>
		</PanelSection>
		<PanelSection :label="$t(`config.colorInactive`)">
			<BooleanInput v-model="options.colorInactive" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.saveHandler`)">
			<select v-model="options.saveHandler">
				<option value="localStorage">{{ $t(`config.saveHandler.localStorage`) }}</option>
				<option value="fileSystem">{{ $t(`config.saveHandler.fileSystem`) }}</option>
			</select>
		</PanelSection>
		<PanelSection :label="$t(`config.asyncClipboard`)">
			<BooleanInput v-model="options.enableAsyncClipboard" ></BooleanInput>
		</PanelSection>

		<button @click="save">{{ $t(`save`) }}</button>
	</div>
</template>