<script setup lang="ts">
defineProps<{
	label?: string;
	hint?: string;
	column?: boolean;
}>();
</script>

<template>
	<div class="panel-detail-section">
		<div>
			<slot name="label">
				{{ label }}
			</slot>
		</div>
		<slot></slot>
		<div class="hint">
			<slot name="hint">
				{{ hint }}
			</slot>
		</div>
	</div>
</template>

<style scoped>
.panel-detail-section {
	margin: 8px 0;
	display: flex;
	gap: 8px;
	justify-content: space-between;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
}

.hint {
	font-size: 0.8em;
	color: var(--text-color-secondary);
}
</style>