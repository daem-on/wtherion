import { expect, test } from "vitest";
import { getEntryRef, reactiveMap } from "../../src/objectSettings/reactiveMap";

test("reactiveMap", () => {
	const test = reactiveMap({
		name: "test",
		value: 10,
	});

	expect(test.name).toBe("test");
	expect(test.value).toBe(10);

	test.name = "test2";
	test.value = 20;
	expect(Array.from(test.map.entries())).toEqual([
		["name", "test2"],
		["value", 20],
	]);
});

test("reactiveMap reactivity", () => {
	const test = reactiveMap({
		name: "test",
		value: 10,
	});

	const ref1 = getEntryRef(test, "name");

	expect(ref1.value).toBe("test");
	
	test.map.set("name", "test2");
	expect(ref1.value).toBe("test2");

	ref1.value = "test3";
	expect(ref1.value).toBe("test3");
	expect(test.map.get("name")).toBe("test3");
});

test("reactiveMap delete", () => {
	const test = reactiveMap<{ optional?: string }>({ optional: "test" });

	expect(test.optional).toBe("test");

	delete test.optional;
	expect(test.optional).toBe(undefined);
});

test("reactiveMap serialization", () => {
	const initial = reactiveMap({
		"key": "value",
	});
	const serialized = JSON.stringify(initial);
	expect(serialized).toBe(`{"key":"value"}`);
	const deserialized = JSON.parse(serialized);
	expect(deserialized).toEqual({ key: "value" });
});