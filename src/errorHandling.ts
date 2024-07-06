import ErrorDialog from "./components/dialogs/ErrorDialog.vue";
import { addDialog } from "grapht/modal";

export function showErrorWindow(e: ErrorEvent) {
	addDialog(ErrorDialog, {
		content: e,
		title: "error.title",
		id: "errorWindow"
	});
}