<script setup lang="ts">
import { DialogData, removeDialog } from '@daem-on/graphite/modal';
import { hideGetStartedDialogKey } from '../../getStarted';
import { ref, watch } from 'vue';
import BooleanInput from '../common/BooleanInput.vue';
import { processFileInput } from '../../helper';
import addBoxUrl from '../../../assets/ui/add_box.svg';
import archiveUrl from '../../../assets/ui/archive.svg';
import folderOpenUrl from '../../../assets/ui/folder_open.svg';

const props = defineProps<{
	data: DialogData<{
		onPressOpen: () => void;
		onPressNew: () => void;
		onPressImportTh2: (data: any) => void;
		fileList?: {
			names: [];
			onPress: (name: string) => void;
		};
	}>;
}>();

const content = props.data.content;

const showAtStartup = ref(!localStorage.getItem(hideGetStartedDialogKey));

watch(showAtStartup, (value) => {
	if (value) {
		localStorage.removeItem(hideGetStartedDialogKey);
	} else {
		localStorage.setItem(hideGetStartedDialogKey, 'true');
	}
});

function close() {
	removeDialog(props.data.id);
}

function fileUploadTH2(event: Event) {
	close();
	processFileInput('text', event.target, content.onPressImportTh2);
};

</script>

<template>
	<div>
		<p>{{ $t(`getStarted.description`) }}</p>
		<div class="actions">
			<button @click="close(); content.onPressNew()">
				<div class="icon-layout">
					<img :src="addBoxUrl" height="48" />
					{{ $t(`getStarted.new`) }}
				</div>
			</button>
			<button @click="close(); content.onPressOpen()">
				<div class="icon-layout">
					<img :src="folderOpenUrl" height="48" />
					{{ $t(`getStarted.open`) }}
				</div>
			</button>
			<button class="input-wrapper">
				<div class="icon-layout">
					<img :src="archiveUrl" height="48" />
					{{ $t(`getStarted.importTh2`) }}
				</div>
				<input type="file" @change="fileUploadTH2" accept=".th2" />
			</button>
		</div>
		<ul v-if="content.fileList">
			<li v-for="name in content.fileList.names" :key="name">
				<button @click="content.fileList.onPress(name)">{{ name }}</button>
			</li>
		</ul>
		<div class="bottom-layout">
			<a :href="$t(`getStarted.docsHref`)" target="_blank">
				{{ $t(`getStarted.docs`) }}
			</a>
			<label class="checkbox-wrapper">
				<BooleanInput v-model="showAtStartup" />
				{{ $t(`getStarted.showAtStartup`) }}
			</label>
		</div>
	</div>
</template>


<style scoped>
.actions {
	margin: 16px 0;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 8px;
}

button {
	flex: 1;
	flex-basis: 100px;
	min-width: 100px;
	padding: 8px;
}

button.input-wrapper {
	display: grid;
	grid-template-columns: 1fr;
	padding: 0;
}

button.input-wrapper div, button.input-wrapper input {
	grid-column-start: 1;
	grid-row-start: 1;
}

button.input-wrapper div {
	padding: 8px;
}

button.input-wrapper input {
	min-width: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
}

.icon-layout {
	display: flex;
	align-items: center;
	flex-direction: column;
}

.bottom-layout {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16px;
	flex-wrap: wrap;
}

label.checkbox-wrapper {
	display: flex;
	align-items: center;
}
</style>
