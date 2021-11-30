/**
 * This is an empty replacement for the stylebar,
 * while the references to it should still work, we don't
 * want the stylebar to do anything.
 */

function noop() {}

export default {
	setup: noop,
	getFillColor: noop,
	getStrokeColor: noop,
	getOpacity: noop,
	getBlendMode: noop,
	getStrokeWidth: noop,
	areColorsDefault: noop,
	setColorsAreDefault: noop,
	setFillColor: noop,
	setStrokeColor: noop,
	setOpacity: noop,
	setStrokeWidth: noop,
	applyFillColorToSelection: noop,
	applyStrokeColorToSelection: noop,
	applyOpacityToSelection: noop,
	applyBlendModeToSelection: noop,
	applyStrokeWidthToSelection: noop,
	updateFromSelection: noop,
	updateFromItem: noop,
	applyActiveToolbarStyle: a => a,
	switchColors: noop,
	sanitizeSettings: noop,
	blurInputs: noop,
}