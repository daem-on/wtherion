// functions related to exporting
import { saveAs } from "file-saver";
import { resetPan, resetZoom } from "./view";
import paper from "paper";
import { clearHoveredItem } from "./hover";
import { clearSelection } from "./selection";
import { getActiveLayer, getGuideLayer } from "./layer";

let exportRect;
let canvas;

export function setup() {
	canvas = document.getElementById("paperCanvas");
}


export function setExportRect(rect?) {
	exportRect = rect;
}


export function getExportRect() {
	return exportRect;
}


export function clearExportRect() {
	exportRect = null;
}


export function exportAndPromptImage() {
	const fileName = prompt("Name your file", "export");

	if (fileName != null) {
		clearHoveredItem();
		clearSelection();
		const activeLayer = getActiveLayer();
		
		// backup guide layer, then remove it (with all children) before export
		const guideLayer = getGuideLayer() || null;
		const guideLayerBackup = guideLayer.exportJSON();
		guideLayer.remove();
		paper.view.update();
		
		if(exportRect) {
			resetZoom();
			resetPan();
			paper.view.update();
			const offsetX = parseInt(canvas.width)*0.5 + exportRect.x;
			const offsetY = parseInt(canvas.height)*0.5 + exportRect.y;
			
			const fileNameNoExtension = fileName.split(".png")[0];
			const ctx = canvas.getContext("2d");
			const imgData = ctx.getImageData(offsetX, offsetY, exportRect.width, exportRect.height);

			const $tempCanvas = jQuery<HTMLCanvasElement>('<canvas width="'+exportRect.width+'" height="'+exportRect.height+'" style="position: absolute; z-index: -5;">');
			
			jQuery('body').append($tempCanvas);

			const context = $tempCanvas[0].getContext("2d");
			context.putImageData(imgData,0,0);
			$tempCanvas[0].toBlob(function(blob) {
				saveAs(blob, fileNameNoExtension+'.png');
					
				// restore guide layer (with all items) after export
				paper.project.importJSON(guideLayerBackup);
				
				// then reactivate the active layer
				activeLayer.activate();
			});

			
			$tempCanvas.remove();
			
		} else {
			const fileNameNoExtension = fileName.split(".png")[0];
			canvas.toBlob(function(blob) {
				saveAs(blob, fileNameNoExtension+'.png');
				
				// restore guide layer (with all items) after export
				paper.project.importJSON(guideLayerBackup);
				
				// then reactivate the active layer
				activeLayer.activate();
			});
		}
		
		
	}
}


export function exportAndPromptSVG() {
	const fileName = prompt("Name your file", "export");

	if (fileName != null) {
		clearHoveredItem();
		clearSelection();
		
		const activeLayer = getActiveLayer();
		
		const fileNameNoExtension = fileName.split(".svg")[0];
		
		// backup guide layer, then remove it (with all children) before export
		const guideLayer = getGuideLayer() || null;
		const guideLayerBackup = guideLayer.exportJSON();
		guideLayer.remove();
		paper.view.update();
		
		// export data, create blob  and save as file on users device
		const exportData = paper.project.exportSVG({ asString: true, bounds: exportRect });
		const blob = new Blob([exportData.toString()], {type: "image/svg+xml;charset=" + document.characterSet});
		saveAs(blob, fileNameNoExtension+'.svg');
		
		// restore guide layer (with all items) after export
		paper.project.importJSON(guideLayerBackup);
		
		// then reactivate the active layer
		activeLayer.activate();
	}
}
