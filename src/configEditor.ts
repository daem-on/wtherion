import { addDialog } from "@daem-on/graphite/modal";
import ConfigDialog from "./components/dialogs/ConfigDialog.vue";

export function show() {
	addDialog(ConfigDialog, { content: undefined, title: "configTitle", id: "configDialog" });
}