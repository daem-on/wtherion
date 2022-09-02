import { test, expect, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	await page.waitForLoadState();
});

test("clicking open in the main menu shows open dialog", async ({ page }) => {
	const mainMenu = page.locator(".topMenuButton:first-child");

	await mainMenu.click();

	const openButton = page.locator("text=Open");

	await expect(openButton).toBeVisible();
	await openButton.click();

	const openDialog = page.locator("#loadWindow");
	await expect(openDialog).toBeVisible();
	await expect(openDialog).toContainText(/Saved Files/i);

});

test("line can be drawn", async ({ page }) => {
	await drawSingleLine(page);

	expect(await page
		.locator(".layerInfo")
		.getAttribute("title")
	).toContain("1 Total");

	expect(
		await page.evaluate("pg.helper.getAllPaperItems().length")
	).toEqual(1);
});

test("point can be put", async ({ page }) => {
	await putSinglePoint(page);

	expect(await page
		.locator(".layerInfo")
		.getAttribute("title")
	).toContain("1 Total");
});

test("tool can be selected", async ({ page }) => {
	await switchTool(page, "draw");
	await expect(page.locator(".tool_draw")).toHaveClass(/active/);
});

test("tool option panel visible, requirements work", async ({ page }) => {
	await switchTool(page, "draw");
	const nameInput = page.locator("input[name=type]");
	const subtypeDiv = page.locator("div[data-id=subtype]");
	
	await expect(page.locator(".toolOptionPanel")).toBeVisible();
	await nameInput.fill("wall");
	await expect(subtypeDiv).toBeVisible();
	
	await nameInput.fill("pit");
	await nameInput.press("Enter");
	await expect(subtypeDiv).not.toBeVisible();
});

test("line can be drawn and selected", async ({ page }) => {
	await drawSingleLine(page);

	const selectionLabel = (page.locator(".selectionTypeLabel"));
	await expect(selectionLabel).toContainText("No selection");

	await switchTool(page, "select");
	await page.mouse.move(450, 450);
	await page.mouse.down();
	await page.mouse.move(550, 550);
	await page.mouse.up();

	await expect(selectionLabel).toContainText("Line");
});

test("inspect shows correct names", async ({ page }) => {
	await drawSingleLine(page);
	await putSinglePoint(page);

	const selectionLabel = (page.locator(".selectionTypeLabel"));
	await expect(selectionLabel).toContainText("No selection");

	await switchTool(page, "inspect");
	await page.mouse.move(500, 500);
	await expect(selectionLabel).toHaveText("Line wall");
	await page.mouse.move(500, 400);
	await expect(selectionLabel).toHaveText("Point station");
});

test("scale, translate don't throw", async ({ page }) => {
	page.on("pageerror", exception => {throw exception;});
	await switchTool(page, "bezier");

	await clickPoints(page, [
		[500, 500],
		[700, 500],
		[700, 600],
	]);

	await switchTool(page, "select");
	// scale
	await page.mouse.move(700, 600);
	await page.mouse.down();
	await page.mouse.move(800, 600);
	await page.mouse.up();

	// rotate
	// TODO: test this

	// translate
	await page.mouse.move(520, 500);
	await page.mouse.down();
	await page.mouse.move(520, 600);
	await page.mouse.up();
});

async function drawSingleLine(page: Page) {
	await switchTool(page, "bezier");

	await clickPoints(page, [[500, 500], [700, 500]]);
	await page.press("canvas", "Enter");
}

async function putSinglePoint(page: Page) {
	await switchTool(page, "point");

	await page.mouse.move(500, 400);
	await page.mouse.down();
	await page.mouse.up();
}

async function switchTool(page: Page, name: string) {
	const tool = page.locator(`.tool_${name}`);
	await tool.click();
}

async function clickPoints(page: Page, points: [number, number][]) {
	for (const [x, y] of points) {
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.up();
	}
}