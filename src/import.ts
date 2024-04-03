import paper from "paper";
import { snapshot } from "./undo";
// functions related to importing

export function importAndAddExternalImage(url){
	const xhr = new XMLHttpRequest();
	xhr.onload = function () {
		const reader = new FileReader();
		reader.onloadend = function () {
			importAndAddImage(reader.result);
		};
		reader.readAsDataURL(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}


export function importAndAddImage(src) {
	new paper.Raster({
		source: src,
		position: paper.view.center
	});
	snapshot('importImage');
}


export function importAndAddSVG(svgString) {
	paper.project.importSVG(svgString, {expandShapes: true});
	snapshot('importAndAddSVG');
	paper.project.view.update();
}