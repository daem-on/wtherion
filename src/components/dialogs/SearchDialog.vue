<script setup lang="ts">
import { DialogData, removeDialog } from '../../modal';

defineProps<{
	data: DialogData<void>;
}>();
</script>

<template>
	<div>
		Search dialog <!-- TODO -->
		<button @click="removeDialog(data.id)">Close</button>
	</div>
</template>