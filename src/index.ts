import "./styles.ts";
import { showErrorWindow } from "./errorHandling";
import { createApp } from "vue";
import MainComponent from "./components/Main.vue";
import { i18n } from "./i18n.ts";

const app = createApp(MainComponent);
app.use(i18n);
app.mount("#vue-app");

addEventListener("error", (e) => {
	showErrorWindow(e);
	console.error(e);
});

addEventListener("unhandledrejection", (e) => {
	showErrorWindow(new ErrorEvent("Unhandled Rejection", { message: e.reason }));
	console.error(e.reason);
});