<script setup lang="ts">
import CustomList from '../../common/CustomList.vue';
import PanelSection from '../../common/PanelSection.vue';
import pointSubtypeList from "../../../res/point-subtype-list.json";
import { computed } from 'vue';

const model = defineModel<string>();

const props = defineProps<{
	type: string;
}>();

const canHaveSubtype = computed(() => {
	return Object.keys(pointSubtypeList).includes(props.type);
});

const options = computed(() => {
	return pointSubtypeList[props.type];
});
</script>

<template>
	<PanelSection :label="$t(`subtype.name`)" v-if="canHaveSubtype">
		<CustomList v-model="model" :options :placeholder="`(${$t('none')})`" :imageRoot="`assets/rendered/point/subtype`" />
	</PanelSection>
</template>