import pg from "./init";
import jQuery from "jquery";
import * as exporter from "./export/exportTH2";

// import spectrumSetup from "../js/lib/spectrum.js";
// spectrumSetup(window, jQuery);

declare global {
    interface Window { pg: any; }
}

window["pg"] = pg;
window["exporter"] = exporter;
// set pg up on window load
jQuery(window).on("load", function() {
	pg.init();
	
	// fade out loading screen and reveal ui
	jQuery('#loadingScreen').addClass('disabled').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
		function () {
			jQuery(this).remove();
		});
	;
});

if (module.hot) {
	window["pg"] = pg;
	module.hot.accept()
}
