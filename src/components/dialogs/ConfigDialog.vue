<script setup lang="ts">
import { ref } from 'vue';
import { loadConfig, exists, get, assign } from '../../filesio/configManagement';
import BooleanInput from '../common/BooleanInput.vue';
import IntInput from '../common/IntInput.vue';
import PanelSection from '../common/PanelSection.vue';
import { removeDialog } from '../../modal';
import { i18n } from '../../i18n';
import { redrawAll } from '../../objectDefs';
import { undoBufferSize } from '../../undo';

const options = ref({
	showSegmentOptionPanel: false,
	lockLayerNames: false,
	githubToken: "",
	inspectTolerance: 8,
	colorInactive: false,
	saveHandler: "localStorage",
	enableAsyncClipboard: false,
	language: i18n.global.locale,
	drawSymbols: false,
	undoBufferSize: undoBufferSize.value,
});

function save() {
	assign(options.value);
	removeDialog("configDialog");
	redrawAll();
	i18n.global.locale = options.value.language;
	undoBufferSize.value = options.value.undoBufferSize;
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
		<PanelSection :label="$t(`config.showSegmentOptionPanel`)">
			<BooleanInput v-model="options.showSegmentOptionPanel" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.lockLayerNames`)">
			<BooleanInput v-model="options.lockLayerNames" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.githubToken.name`)">
			<input type="text" v-model="options.githubToken" />
		</PanelSection>
		<PanelSection :label="$t(`config.inspectTolerance`)">
			<IntInput v-model="options.inspectTolerance" ></IntInput>
		</PanelSection>
		<PanelSection :label="$t(`config.colorInactive`)">
			<BooleanInput v-model="options.colorInactive" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t('config.drawSymbols')">
			<BooleanInput v-model="options.drawSymbols" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.saveHandler.name`)">
			<select v-model="options.saveHandler">
				<option value="localStorage">{{ $t(`config.saveHandler.localStorage`) }}</option>
				<option value="fileSystem">{{ $t(`config.saveHandler.fileSystem`) }}</option>
			</select>
		</PanelSection>
		<PanelSection :label="$t(`config.asyncClipboard`)">
			<BooleanInput v-model="options.enableAsyncClipboard" ></BooleanInput>
		</PanelSection>
		<PanelSection :label="$t(`config.undoBufferSize`)">
			<IntInput v-model="options.undoBufferSize" ></IntInput>
		</PanelSection>
		<PanelSection :label="$t(`config.language`)">
			<select v-model="options.language">
				<option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
			</select>
		</PanelSection>

		<button @click="save">{{ $t(`menu.save`) }}</button>
	</div>
</template>