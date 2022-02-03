import "jquery-ui/ui/widgets/selectmenu";

export function constructSelect(element: HTMLDivElement, selectedVal: string, imageRoot?: string) {
	element.classList.add("act-as-input")

	let input = element.getElementsByTagName("input")[0];
	
	// element.getElementsByClassName("customListOptions")[0].classList.add("hidden")

	let selectOptionsDiv = document.createElement("div");
	selectOptionsDiv.setAttribute("class", "select-options");
	
	for (let option of element.getElementsByTagName("option")) {
		let optionItemDiv = constructOptionItem(option, imageRoot);
		selectOptionsDiv.appendChild(optionItemDiv);
	}
	element.appendChild(selectOptionsDiv);

	input.addEventListener("click", function(e) {
		e.stopPropagation();
		closeAllSelect(this.parentElement);
		this.parentElement.classList.toggle("open");
	});
}

function constructOptionItem(option: HTMLOptionElement, imageRoot?: string) {
	let container = document.createElement("div");
	container.setAttribute("select-val", option.value);

	let previewImg = document.createElement("img");
	previewImg.src = (imageRoot ?? "assets/rendered") + `/${option.value || "empty"}.svg`;
	previewImg.onerror = function () { this.src = "assets/rendered/fallback.svg"; };
	previewImg.classList.add("crop-svg");

	let label = document.createElement("p");
	label.innerHTML = option.innerHTML || "(none)";

	container.appendChild(previewImg);
	container.appendChild(label);

	container.addEventListener("click", function (e) {
		let s = this.parentElement.parentElement.getElementsByTagName("input")[0];
		s.value = this.getAttribute("select-val");
		jQuery(s).trigger("change");
		let h = this.parentElement.previousElementSibling as HTMLDivElement;
		h.click();
	});

	return container;
}

function closeAllSelect(origin) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  let x = document.getElementsByClassName("custom-select");
  for (let e of x) if (e !== origin) e.classList.remove("open");
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);