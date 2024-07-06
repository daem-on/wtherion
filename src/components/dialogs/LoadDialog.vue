<script setup lang="ts">
import { ref } from 'vue';
import { deleteFromStorage } from '../../filesio/saveManagement/localStorageSaves';
import { DialogData, removeDialog } from 'grapht/modal';

const props = defineProps<{
	data: DialogData<{
		filenames: string[],
		callback: (name: string) => void,
	}>;
}>();

const filenames = ref(props.data.content.filenames);

function close() {
	removeDialog(props.data.id);
}

function deleteFile(filename: string) {
	if (deleteFromStorage(filename))
		filenames.value = filenames.value.filter((f) => f !== filename);
}
</script>
<template>
	<ul>
		<li v-for="save in filenames" :key="save">
			<a @click="data.content.callback(save); close()">
				{{ save }}
			</a>
			<button @click="deleteFile(save)">&times;</button>
		</li>
	</ul>
</template>

<style scoped>
li {
	display: flex;
	justify-content: space-between;
	padding: 4px;
}

a:hover {
	cursor: pointer;
	color: var(--primary-color);
}
</style>