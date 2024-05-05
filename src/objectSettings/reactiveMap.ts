import { WritableComputedRef, computed, reactive } from "vue";

export type ReactiveMap<T> = T & { readonly map: Map<keyof T, T[keyof T]> };

export function reactiveMap<T extends Record<string, any>>(initial: T): ReactiveMap<T> {
	const map = reactive(new Map(Object.entries(initial)));
	return new Proxy({}, {
		get: (_, key) => {
			if (key === "map") return map;
			return map.get(key as string);
		},
		set: (_, key, value) => {
			map.set(key as string, value);
			return true;
		},
		deleteProperty: (_, key) => {
			map.delete(key as string);
			return true;
		},
		ownKeys: () => {
			return [...map.keys()];
		},
		getOwnPropertyDescriptor: (_, key) => {
			if (map.has(key as string)) {
				return {
					configurable: true,
					enumerable: true,
				};
			}
			return undefined;
		},
	}) as ReactiveMap<T>;
}

export function getEntryRef<T, K extends keyof T>(rm: ReactiveMap<T>, key: K): WritableComputedRef<T[K]> {
	return computed<T[K]>({
		get: () => rm.map.get(key) as T[K],
		set: value => rm.map.set(key, value),
	});
}
