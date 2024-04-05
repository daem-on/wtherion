import { createI18n } from "vue-i18n";
import messagesEn from "../lang/en-us.json";
import messagesHu from "../lang/hu-hu.json";

export const i18n = createI18n({
	locale: "en",
	messages: {
		en: messagesEn,
		hu: messagesHu,
	}
});
