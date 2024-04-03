import { floater } from "./modal";

export function showErrorWindow(e: Error) {
	const content = jQuery(document.createElement("div"));
	content.append(jQuery(`<p>${e.message}</p>`));
	content.append(jQuery(`<pre class="scrollable">${e.stack}</pre>`));

	const report = jQuery(`<a>%error.report%</a>`);
	report.attr("href", "https://github.com/daem-on/wtherion/issues/new");
	report.attr("target", "_blank");
	content.append(report);

	floater("errorWindow", "%error.title%", content, 400, 200);
}