<template>
	<div class="panel-content">
		<slot></slot>
	</div>
</template>

<style>
.panel-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.panel-content h2 {
	font-size: 16px;
	margin-bottom: 8px;
}
</style>