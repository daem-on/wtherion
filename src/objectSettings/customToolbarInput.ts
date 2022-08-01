import "jquery-ui/ui/widgets/selectmenu";

export function constructSelect(element: HTMLDivElement, selectedVal: string, imageRoot?: string) {
	element.classList.add("act-as-input");

	const input = element.getElementsByTagName("input")[0];
	
	// element.getElementsByClassName("customListOptions")[0].classList.add("hidden")

	const selectOptionsDiv = document.createElement("div");
	selectOptionsDiv.setAttribute("class", "select-options");
	
	for (const option of element.getElementsByTagName("option")) {
		const optionItemDiv = constructOptionItem(option, imageRoot);
		selectOptionsDiv.appendChild(optionItemDiv);
	}
	element.appendChild(selectOptionsDiv);

	input.addEventListener("click", function(e) {
		e.stopPropagation();
		closeAllSelect(this.parentElement);
		this.parentElement.classList.toggle("open");
	});

	input.addEventListener("keypress", e => {
		if (e.key === "Enter") element.classList.remove("open");
	})
	input.addEventListener("blur", e => element.classList.remove("open"));
}

function constructOptionItem(option: HTMLOptionElement, imageRoot?: string) {
	const container = document.createElement("div");
	container.setAttribute("select-val", option.value);

	const previewImg = document.createElement("img");
	previewImg.src = (imageRoot ?? "assets/rendered") + `/${option.value || "empty"}.svg`;
	previewImg.onerror = function () { this.src = "assets/rendered/fallback.svg"; };
	previewImg.classList.add("crop-svg");

	const label = document.createElement("p");
	label.innerHTML = option.innerHTML || "(none)";

	container.appendChild(previewImg);
	container.appendChild(label);

	container.addEventListener("click", function (e) {
		const s = this.parentElement.parentElement.getElementsByTagName("input")[0];
		s.value = this.getAttribute("select-val");
		jQuery(s).trigger("change");
		const h = this.parentElement.previousElementSibling as HTMLDivElement;
		h.click();
	});

	return container;
}

function closeAllSelect(origin) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  const x = document.getElementsByClassName("custom-select");
  for (const e of x) if (e !== origin) e.classList.remove("open");
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);