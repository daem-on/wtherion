<script setup lang="ts">
import { ValidationResult } from '../../validation/validate.ts';
import { DialogData } from '@daem-on/graphite/modal';
import { clearSelection, focusItem } from '../../selection';
import { setActiveLayer } from '../../layer';
import { computed } from 'vue';

const props = defineProps<{
	data: DialogData<ValidationResult>;
}>();

const results = computed(() => Array.from(props.data.content));

function select(item: paper.Item) {
	if (item.className === "Layer") {
		clearSelection();
		setActiveLayer(item as paper.Layer);
	} else {
		focusItem(item);
	}
}
</script>

<template>
	<div>
		<template v-if="!results.length">
			<p>{{ $t('edit.validationSuccess') }}</p>
		</template>
		<template v-else>
			<a v-for="[error, item] of results" @click="select(item)">
				[{{ error.settings.className }}
				{{ error.name }}]:
				{{ error.message }}
			</a>
		</template>
	</div>
</template>