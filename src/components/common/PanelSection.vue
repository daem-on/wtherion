<script setup lang="ts">
defineProps<{
	label?: string;
	column?: boolean;
}>();
</script>

<template>
	<label class="panel-section" :class="{ column }">
		<span>
			<slot name="label">
				{{ label }}
			</slot>
		</span>
		<slot></slot>
	</label>
</template>

<style scoped>
.panel-section {
	margin: 8px 0;
	display: flex;
	flex-direction: row;
	gap: 8px;
	justify-content: space-between;
	align-items: center;
}
.panel-section.column {
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
}
.panel-section.column .span {
	align-self: flex-start;
}
.panel-section > :not(span) {
	flex-shrink: 1;
}
</style>