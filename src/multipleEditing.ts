import { ref, Ref } from "vue";

export const empty = Symbol("empty");

export function useMultipleEditing<T>(defaults: T) {
	const optionsCache: Ref<T | undefined> = ref(undefined);
	const wasEmpty: Ref<Record<keyof T, boolean> | undefined> = ref(undefined);

	return {
		optionsCache,
		wasEmpty,
		createDefaultOptions(from: T[]): void {
			const first = from[0];
			const result: Partial<T> = {};
			for (const key in defaults)
				result[key] = from.every(p => p[key] === first[key]) ? first[key] : defaults[key];
			optionsCache.value = result as T;
			const empties = {} as Record<keyof T, boolean>;
			for (const key in defaults)
				empties[key] = result[key] === defaults[key];
			wasEmpty.value = empties;
		},
		modifyItems(items: T[]) {
			const options = optionsCache.value;
			if (!options) return;
			for (const key in defaults) {
				if (options[key] !== defaults[key]) {
					for (const item of items)
						item[key] = options[key];
				}
			}
		},
	};
}