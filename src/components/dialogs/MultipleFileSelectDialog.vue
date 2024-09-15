<script setup lang="ts">
import { MultipleFileSelectDialogData } from '../../filesio/saveManagement/saveManagement';
import { removeDialog } from '@daem-on/graphite/modal';
import { ref } from 'vue';

const props = defineProps<{
	data: MultipleFileSelectDialogData
}>();

const files = ref(new Map<string, File>());

function getExtension(filename: string) {
	return filename.split('.').pop();
}

function finish() {
	props.data.content.callback(files.value);
	removeDialog(props.data.id);
}
</script>

<template>
	<div>
		<table>
			<tr v-for="filename in props.data.content.filenames" :key="filename">
				<td>{{ filename }}</td>
				<td>
					<input
						type="file"
						@change="files.set(filename, ($event.target as HTMLInputElement).files![0])"
						:accept="'.' + getExtension(filename)"
					/>
				</td>
			</tr>
		</table>
		<button @click="finish">{{ $t('menu.import') }}</button>
	</div>
</template>

<style scoped>
table {
	width: 100%;
}

td {
	padding: 5px;
}

input[type="file"] {
	width: 100%;
}
</style>