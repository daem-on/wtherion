<script setup lang="ts">
import { ref } from 'vue';
import { loadConfig, exists, get, assign } from '../../filesio/configManagement';
import BooleanInput from '../common/BooleanInput.vue';
import IntInput from '../common/IntInput.vue';
import PanelSection from '../common/PanelSection.vue';
import { removeDialog } from '@daem-on/graphite/modal';
import { i18n } from '../../i18n';
import { redrawAll } from '../../objectDefs';
import defaultConfig from "../../res/default-config.json";
import Tabs from '../common/Tabs.vue';
import RangeInput from '../common/RangeInput.vue';
import PanelDetailSection from '../common/PanelDetailSection.vue';
import ToggleButtons from '../common/ToggleButtons.vue';

const options = ref(defaultConfig);

function apply() {
	assign(options.value);
	redrawAll();
	i18n.global.locale = options.value.language as any;
}

function close() {
	removeDialog("configDialog");
}

function save() {
	apply();
	close();
}

loadConfig();

for (const key in options.value) {
	if (exists(key)) {
		options.value[key] = get(key);
	}
}

// workaround for getting wrong context inside tabs
const t = i18n.global.t;
const availableLocales = i18n.global.availableLocales;

</script>

<template>
	<div class="config">
		<Tabs class="flex-content">
			<div :label="t(`config.toolsTab`)">
				<h3>{{ t(`config.inspectSection`) }}</h3>
				<PanelSection :label="t(`config.inspectTolerance`)">
					<RangeInput class="align-end" v-model="options.inspectTolerance" :min="0" :max="20" :step="1"></RangeInput>
				</PanelSection>
				<h3>{{ t(`config.selectSection`) }}</h3>
				<PanelDetailSection :label="t(`config.moveInstantly`)" :hint="t(`config.moveInstantlyHint`)">
					<select class="align-start" v-model="options.moveInstantly">
						<option :value="false">{{ t(`config.moveInstantlyOff`) }}</option>
						<option :value="true">{{ t(`config.moveInstantlyOn`) }}</option>
					</select>
				</PanelDetailSection>
			</div>
			<div :label="t(`config.appearanceTab`)">
				<PanelDetailSection :label="t(`config.colorInactive`)">
					<ToggleButtons class="align-start" v-model="options.colorInactive" :options="[
						{ label: t(`off`), value: false, image: `assets/config/scrap_inactive_off.png` },
						{ label: t(`on`), value: true, image: `assets/config/scrap_inactive_on.png` }
					]"></ToggleButtons>
				</PanelDetailSection>
				<PanelDetailSection :label="t('config.drawSymbols')" :hint="t(`config.drawSymbolsHint`)">
					<ToggleButtons class="align-start" v-model="options.drawSymbols" :options="[
						{ label: t(`config.drawSymbolsOff`), value: false, image: `assets/config/icon_symbol_off.png` },
						{ label: t(`config.drawSymbolsOn`), value: true, image: `assets/config/icon_symbol_on.png` }
					]"></ToggleButtons>
				</PanelDetailSection>
				<PanelSection :label="t(`config.language`)">
					<select v-model="options.language">
						<option v-for="locale in availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
					</select>
				</PanelSection>
			</div>
			<div :label="t(`config.functionalityTab`)">
				<PanelSection :label="t(`config.saveHandler.name`)">
					<select v-model="options.saveHandler">
						<option value="localStorage">{{ t(`config.saveHandler.localStorage`) }}</option>
						<option value="fileSystem">{{ t(`config.saveHandler.fileSystem`) }}</option>
					</select>
				</PanelSection>
				<PanelDetailSection :label="t(`config.asyncClipboard`)" :hint="t(`config.asyncClipboardHint`)">
					<BooleanInput class="align-start" v-model="options.enableAsyncClipboard"></BooleanInput>
				</PanelDetailSection>
				<PanelDetailSection :label="t(`config.undoBufferSize`)" :hint="t(`config.undoBufferSizeHint`)">
					<IntInput class="align-start" v-model="options.undoBufferSize" ></IntInput>
				</PanelDetailSection>
				<PanelDetailSection :label="t(`config.exportFormat.name`)" :hint="t(`config.exportFormat.hint`)">
					<select class="align-start" v-model="options.exportFormat">
						<option value="default">{{ t(`config.exportFormat.default`) }}</option>
						<option value="xtherion">{{ t(`config.exportFormat.xtherion`) }}</option>
					</select>
				</PanelDetailSection>
			</div>
		</Tabs>

		<div class="actions">
			<button @click="save">{{ t(`menu.save`) }}</button>
			<button @click="close">{{ t(`menu.cancel`) }}</button>
		</div>
	</div>
</template>

<style scoped>

.config {
	min-width: 400px;
	width: 50vw;
	max-width: 700px;
	min-height: 300px;
	height: 50vh;

	display: flex;
	flex-direction: column;
}

h3 {
	margin: 16px 0;
	font-size: 1.2em;
	color: var(--text-color-secondary);
}

.flex-content {
	flex: 1;
}

.align-end {
	align-self: end;
}

.align-start {
	align-self: start;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

</style>
