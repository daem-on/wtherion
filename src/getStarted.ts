import { addDialog, removeDialog } from "@daem-on/graphite/modal";
import GetStartedDialog from "./components/dialogs/GetStartedDialog.vue";
import { handlers } from "./menu";
import { importTH2 } from "./import/importWrapper";

export const hideGetStartedDialogKey = "wt.hidegetstarted";

export function maybeShowGetStartedDialog() {
	if (localStorage.getItem(hideGetStartedDialogKey) == null) {
		addDialog(GetStartedDialog, {
			id: "getStarted",
			title: "getStarted.title",
			content: {
				onPressNew() {
					// is already showing empty document
				},
				onPressOpen() {
					handlers.open();
				},
				onPressImportTh2(data) {
					importTH2(data);
				},
			},
		});
	}
}