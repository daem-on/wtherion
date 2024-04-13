<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelSection from '../../common/PanelSection.vue';
import subtypeList from "../../../res/subtype-list.json";
import { computed } from 'vue';

const model = defineModel<string>();

const props = defineProps<{
	type: string;
}>();

const canHaveSubtype = computed(() => {
	return Object.keys(subtypeList).includes(props.type);
});

const options = computed(() => {
	return subtypeList[props.type];
});
</script>

<template>
	<PanelSection :label="$t(`subtype.name`)" v-if="canHaveSubtype">
		<CustomList v-model="model" :options :placeholder="`(${$t('none')})`" :imageRoot="`assets/rendered/subtype`" />
	</PanelSection>
</template>