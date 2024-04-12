import { createI18n } from "vue-i18n";
import messagesEn from "../lang/en-us.json";
import messagesHu from "../lang/hu-hu.json";
import { get } from "./filesio/configManagement";

export const i18n = createI18n({
	locale: "en",
	messages: {
		en: messagesEn,
		hu: messagesHu,
	}
});

export function setup() {
	const lang = get("language");
	if (lang) {
		i18n.global.locale = lang;
	}
}