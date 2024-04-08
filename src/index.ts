import jQuery from "jquery";
import "./styles.ts";
import { showErrorWindow } from "./errorHandling";
import { createApp } from "vue";
import MainComponent from "./components/Main.vue";
import { i18n } from "./i18n.ts";

window["jQuery"] = jQuery;

const app = createApp(MainComponent);
app.use(i18n);
app.mount("#vue-app");

addEventListener("error", (e) => {
	showErrorWindow(e.error);
	console.error(e.error);
});
