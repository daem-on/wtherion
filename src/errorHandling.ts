import ErrorDialog from "./components/dialogs/ErrorDialog.vue";
import { addDialog } from "./modal";

export function showErrorWindow(e: Error) {
	addDialog(ErrorDialog, {
		content: e,
		title: "error.title",
		id: "errorWindow"
	});
}