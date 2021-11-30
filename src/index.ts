import pg from "./init";
import jQuery from "jquery";

import spectrumSetup from "../js/lib/spectrum.js";

declare global {
    interface Window { pg: any; }
}

window["pg"] = pg;
spectrumSetup(window, jQuery);
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
