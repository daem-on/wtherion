// view pan tool
// adapted from http://sketch.paperjs.org/
import paper from "paper";
import { correctToolEvent } from "./select";

export default function() {
	let tool: paper.Tool;
	let lastPoint: paper.Point;
	
	const options = {};
	let currentCursor = "";
	
	const activateTool = function() {
		tool = new paper.Tool();
		
		setCursor('grab');
		
		tool.onMouseDown = function(event: correctToolEvent) {
			if(event.event.button > 0) return; // only first mouse button
			lastPoint = paper.view.projectToView(event.point);
			setCursor('grabbing'); 
		};
		
		tool.onMouseDrag = function(event: correctToolEvent) {
			if(event.event.button > 0) return; // only first mouse button
			setCursor('grabbing'); 
			
			// In order to have coordinate changes not mess up the
			// dragging, we need to convert coordinates to view space,
			// and then back to project space after the view space has
			// changed.
			const point = paper.view.projectToView(event.point);
			const  last = paper.view.viewToProject(lastPoint);
			// uuuuh I guess they left it out of the docs??
			(paper.view as any).scrollBy(last.subtract(event.point));
			lastPoint = point;
		};
		
		tool.onMouseUp = function(event: correctToolEvent) {
			setCursor('grab');
		};
		
		let keyDownFired = false;
		tool.onKeyDown = function(event: paper.KeyEvent) {
			if(keyDownFired) return;
			keyDownFired = true;
			
			if (event.key === 'space') {
				setCursor('grab');
			}
		};
	
		tool.onKeyUp = function(event: paper.KeyEvent) {
			keyDownFired = false;
			
			if (event.key === 'space') {
				setCursor();
			}
		};
		
		tool.activate();
	
	};
	
	
	const setCursor = function(cursorString?: string) {
		if (cursorString === currentCursor) return;
		const $body = jQuery('body');
		$body.removeClass('grab');
		$body.removeClass('grabbing');
		
		currentCursor = cursorString;
		if(cursorString && cursorString.length > 0) {
			$body.addClass(cursorString);
		}
	};
	
	
	return {
		options:options,
		activateTool : activateTool
	};
}