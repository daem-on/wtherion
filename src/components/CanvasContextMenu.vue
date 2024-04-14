<script setup lang="ts">
import { activeToolRef } from "../tools";
import { computed } from "vue";
import Foldable from "./common/Foldable.vue";
import MenuButton from "./common/MenuButton.vue";
import PopoutScaffold from "./common/PopoutScaffold.vue";
import Card from "./common/Card.vue";

const toolMenuContent = computed(() => {
	return activeToolRef.value?.menu;
});
</script>

<template>
	<PopoutScaffold ref="popoutRef">
		<template #source="{ open }">
			<div @contextmenu.prevent="open" class="canvas-context">
				<slot></slot>
			</div>
		</template>
		<template #default="{ close }">
			<Card shadow scroll class="context-menu">
				<template v-if="toolMenuContent">
					<Foldable v-for="subMenu in toolMenuContent" :key="subMenu.name" fullWidth noMargin noBorder>
						<template #title>
							{{ $t(subMenu.name) }}
						</template>
						<ul>
							<MenuButton
								v-for="action in subMenu.actions"
								:key="action.name"
								@click="action.callback(); close()">
								{{
									$t(action.label?? `${activeToolRef.definition.id}.menu.${action.name}`)
								}}
							</MenuButton>
						</ul>
					</Foldable>
				</template>
			</Card>
		</template>
	</PopoutScaffold>
</template>

<style scoped>
.context-menu {
	min-width: 200px;
	max-height: 80vh;
}

div.card.context-menu {
	padding: 0;
}

.foldable:not(:last-child) {
	border-bottom: 1px solid var(--border-color);
}
</style>