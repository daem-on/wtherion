<template>
	<li>
		<slot></slot>
	</li>
</template>

<style scoped>
li {
	padding: 8px;
	width: 100%;
	border-radius: 4px;
}

li:hover {
	background-color: var(--hover-color);
}
</style>