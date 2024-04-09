import { KeySpec } from "./input";

export type ToolAction = {
	name: string;
	callback: () => void;
	category?: string;
	icon?: string;
	defaultKey?: KeySpec;
	label?: string;
};

export type ToolMenuEntry = {
	name?: string;
	actions: ToolAction[];
};

export function compileToolMenu(list?: ToolAction[]): ToolMenuEntry[] {
	if (!list) return [];
	const categories = new Map<string, ToolMenuEntry>();
	for (const action of list) {
		const category = action.category || "Other";
		if (!categories.has(category)) {
			categories.set(category, { name: category, actions: [] });
		}
		categories.get(category).actions.push(action);
	}
	return Array.from(categories.values());
}