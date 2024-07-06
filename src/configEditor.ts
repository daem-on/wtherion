import { addDialog } from "grapht/modal";
import ConfigDialog from "./components/dialogs/ConfigDialog.vue";

export function show() {
	addDialog(ConfigDialog, { content: undefined, title: "configTitle", id: "configDialog" });
}