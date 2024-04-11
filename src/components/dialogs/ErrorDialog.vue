<script setup lang="ts">
import { DialogData } from '../../modal';

defineProps<{
	data: DialogData<Error>;
}>();
</script>

<template>
	<div>
		<p>{{ data.content.message }}</p>
		<pre class="scrollable">{{ data.content.stack }}</pre>

		<a href="https://github.com/daem-on/wtherion/issues/new" target="_blank">{{ $t('error.report') }}</a>
	</div>
</template>