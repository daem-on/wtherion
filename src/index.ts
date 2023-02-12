import initPG from "./init";
import jQuery from "jquery";
import * as exporter from "./export/exportTH2";
import "./styles.ts";
import { showErrorWindow } from "./errorHandling";

// import spectrumSetup from "../js/lib/spectrum.js";
// spectrumSetup(window, jQuery);

declare global {
    interface Window { pg: any; }
}

window["pg"] = initPG;
window["exporter"] = exporter;
// set pg up on window load
jQuery(window).on("load", function() {
	initPG.init();
	
	// fade out loading screen and reveal ui
	jQuery('#loadingScreen').addClass('disabled').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
		function () {
			jQuery(this).remove();
		});
	
});

if (module.hot) {
	// window["pg"] = pg;
	module.hot.accept();
}

addEventListener("error", (e) => {
	showErrorWindow(e.error);
	console.error(e.error);
});
