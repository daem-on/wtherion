<script setup lang="ts">
import { ref, watch } from 'vue';
import { DialogData, removeDialog } from '../../modal';
import { searchResults, search } from '../../search';
import { focusItem } from '../../selection';

const currentIndex = ref(0);
const searchQuery = ref("");

defineProps<{
	data: DialogData<void>;
}>();

function startSearch() {
	search(searchQuery.value);
	currentIndex.value = 0;
}

watch(currentIndex, () => {
	if (searchResults.value.length > 0) {
		focusItem(searchResults.value[currentIndex.value]);
	}
});

function next() {
	if (searchResults.value.length === 0) return;
	currentIndex.value = (currentIndex.value + 1) % searchResults.value.length;
}

function previous() {
	if (searchResults.value.length === 0) return;
	currentIndex.value = (currentIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
}
</script>

<template>
	<div>
		<form @submit.prevent="startSearch">
			<input type="text" v-model="searchQuery" placeholder="RegEx" />
			<button @click="startSearch">Search</button>
		</form>
		<div v-if="searchResults.length > 0">
			<div>{{ currentIndex + 1 }}/{{ searchResults.length }}</div>
			<button @click="previous">&lt;</button>
			<button @click="next">&gt;</button>
		</div>
		<button @click="removeDialog(data.id)">Close</button>
	</div>
</template>