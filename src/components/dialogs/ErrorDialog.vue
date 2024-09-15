<script setup lang="ts">
import { DialogData } from '@daem-on/graphite/modal';

const props = defineProps<{
	data: DialogData<ErrorEvent>;
}>();

const e = props.data.content;
</script>

<template>
	<div>
		<p v-if="e.message">{{ e.message }}</p>
		<pre v-if="e.filename && e.lineno">{{ e.filename }}:{{ e.lineno }}</pre>
		<template v-if="e.error">
			<pre v-if="'stack' in e.error" class="scrollable">{{ e.error.stack }}</pre>
		</template>

		<a href="https://github.com/daem-on/wtherion/issues/new" target="_blank">{{ $t('error.report') }}</a>
	</div>
</template>

<style scoped>
p {
	user-select: text;
}
pre {
	font-family: monospace;
	user-select: all;
	margin: 16px 0;
}
</style>