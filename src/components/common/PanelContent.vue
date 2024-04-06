<template>
	<div class="panel-content">
		<slot></slot>
	</div>
</template>

<style>
.panel-content {
	display: flex;
	flex-direction: column;
}

.panel-content h2 {
	font-size: 14px;
	text-wrap: nowrap;
}

.panel-content .panel-section {
	margin: 8px 0;
	display: flex;
	flex-direction: row;
	gap: 8px;
	justify-content: space-between;
	align-items: center;
}
</style>