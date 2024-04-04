// view pan tool
// adapted from http://sketch.paperjs.org/
import paper from "paper";
import { defineTool } from "../tools";

export const viewgrab = defineTool({
	definition: {
		id: 'viewgrab',
		name: 'View grab',
		type: 'hidden',
		options: {},
	},
	setup(on) {
		let lastPoint: paper.Point;
		let currentCursor = "";
		
		on("activate", () => {			
			setCursor('grab');
		});

		on("mousedown", (event) => {
			if (event.event.button > 0) return; // only first mouse button
			lastPoint = paper.view.projectToView(event.point);
			setCursor('grabbing'); 
		});
		
		on("mousedrag", (event) => {
			if (event.event.button > 0) return; // only first mouse button
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
		});
		
		on("mouseup", (event) => {
			setCursor('grab');
		});
		
		let keyDownFired = false;
		on("keydown", (event) => {
			if (keyDownFired) return;
			keyDownFired = true;
			
			if (event.key === 'space') {
				setCursor('grab');
			}
		});
	
		on("keyup", (event) => {
			keyDownFired = false;
			
			if (event.key === 'space') {
				setCursor();
			}
		});
		
		const setCursor = function(cursorString?: string) {
			if (cursorString === currentCursor) return;
			const $body = jQuery('body');
			$body.removeClass('grab');
			$body.removeClass('grabbing');
			
			currentCursor = cursorString;
			if (cursorString && cursorString.length > 0) {
				$body.addClass(cursorString);
			}
		};
	},
});