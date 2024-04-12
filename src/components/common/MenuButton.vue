<template>
	<button>
		<slot></slot>
	</button>
</template>

<style scoped>
button {
	padding: 8px;
	width: 100%;
	border-radius: 4px;
	border: none;
	background: none;
	text-align: left;
	display: block;
	line-height: inherit;
}

button:hover {
	background-color: var(--hover-color);
}
</style>