import { Component, StyleValue, computed, markRaw, ref } from "vue";

export type DialogData<T> = { id: string, title: string, style?: StyleValue, content: T };
export type DialogComponent<T> = Component<{ data: DialogData<T> }>;

const activeDialogs = ref(new Map<string, { component: DialogComponent<any>, data: DialogData<any> }>());
export const activeDialogList = computed(() => Array.from(activeDialogs.value.values()));

export function addDialog<T>(component: DialogComponent<T>, data: DialogData<T>): void {
	component = markRaw(component);
	activeDialogs.value.set(data.id, { component, data });
}

export function removeDialog(id: string): void {
	activeDialogs.value.delete(id);
}