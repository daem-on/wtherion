<script setup lang="ts">
import { ref } from 'vue';

const model = defineModel<string>();

defineProps<{
	options: string[];
	imageRoot?: string;
}>();

const open = ref(false);

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Enter" || e.key === "Escape") open.value = false;
};

const select = (option: string) => {
	model.value = option;
	open.value = false;
};

</script>

<template>
	<div class="custom-list" :class="{ open }">
		<input type="text" v-model="model" @click="open = !open" @keydown="onKeydown" />
		<div class="select-options">
			<div v-for="option in options" :key="option" @click="select(option)">
				<img v-if="imageRoot" :src="`${imageRoot}/${option || 'empty'}.svg`" class="crop-svg" />
				<p>{{ option || '(none)' }}</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.custom-list {
	position: relative;
	font-family: Arial;
	font-size: 0.85em;
	max-width: 50ch;
	min-width: 20ch;
	width: fit-content;
	user-select: none;
}

.select-options div {
	padding: 1px 3px;
	border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
	cursor: default;
	display: flex;
    flex-direction: column;
    align-items: center;
}

.custom-list.open .select-options {
	display: unset;
	position: absolute;
	background-color: rgb(255, 255, 255);
	border-radius: 2px;
	border: rgb(112, 112, 112) 1px solid;
	box-shadow: #0000006b 0px 3px 8px;
	top: 100%;
	left: 0;
	right: 0;
	z-index: 99;
	max-height: 50vh;
	overflow-y: auto;
}

.custom-list .select-options {
	display: none;
}
</style>