<script setup lang="ts">
defineProps<{
	label?: string;
}>();
</script>

<template>
	<label class="panel-section">
		<span>
			<slot name="label">
				{{ label }}
			</slot>
		</span>
		<slot></slot>
	</label>
</template>
