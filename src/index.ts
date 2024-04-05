import jQuery from "jquery";
import * as exporter from "./export/exportTH2";
import "./styles.ts";
import { showErrorWindow } from "./errorHandling";
import { createApp } from "vue";
import MainComponent from "./components/Main.vue";
import { i18n } from "./i18n.ts";

window["jQuery"] = jQuery;
window["exporter"] = exporter;

const app = createApp(MainComponent);
app.use(i18n);
app.mount("#vue-app");

addEventListener("error", (e) => {
	showErrorWindow(e.error);
	console.error(e.error);
});
