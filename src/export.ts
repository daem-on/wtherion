// functions related to exporting
import { saveAs } from "file-saver";
import { resetPan, resetZoom } from "./view";
import paper from "paper";
import { clearHoveredItem } from "./hover";
import { clearSelection } from "./selection";
import { getActiveLayer, getGuideLayer } from "./layer";

let exportRect;
let canvas: HTMLCanvasElement;

export function setup() {
	canvas = document.getElementById("paperCanvas") as any;
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
		
		if (exportRect) {
			resetZoom();
			resetPan();
			paper.view.update();
			const offsetX = canvas.width*0.5 + exportRect.x;
			const offsetY = canvas.height*0.5 + exportRect.y;
			
			const fileNameNoExtension = fileName.split(".png")[0];
			const ctx = canvas.getContext("2d");
			const imgData = ctx.getImageData(offsetX, offsetY, exportRect.width, exportRect.height);

			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = exportRect.width;
			tempCanvas.height = exportRect.height;
			tempCanvas.style.position = "absolute";
			tempCanvas.style.zIndex = "-5";
			document.body.appendChild(tempCanvas);

			const context = tempCanvas.getContext("2d");
			context.putImageData(imgData,0,0);
			tempCanvas.toBlob(blob => {
				saveAs(blob, fileNameNoExtension+'.png');
					
				// restore guide layer (with all items) after export
				paper.project.importJSON(guideLayerBackup);
				
				// then reactivate the active layer
				activeLayer.activate();
			});

			
			tempCanvas.remove();
			
		} else {
			const fileNameNoExtension = fileName.split(".png")[0];
			canvas.toBlob(blob => {
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
