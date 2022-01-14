import "jquery-ui/ui/widgets/selectmenu";

export function constructSelect(element: HTMLDivElement, imageRoot?: string) {
	element.classList.add("act-as-input")
	let selectElement = element.getElementsByTagName("select")[0];
	let selectButtonDiv = document.createElement("div");
	selectButtonDiv.setAttribute("class", "select-button");
	selectButtonDiv.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML;
	element.appendChild(selectButtonDiv);
	let selectOptionsDiv = document.createElement("div");
	selectOptionsDiv.setAttribute("class", "select-options");
	for (let option of selectElement.options) {
		let optionItemDiv = constructOptionItem(option, imageRoot);
		selectOptionsDiv.appendChild(optionItemDiv);
	}
	element.appendChild(selectOptionsDiv);
	selectButtonDiv.addEventListener("click", function(e) {
		e.stopPropagation();
		closeAllSelect(this.parentElement);
		this.parentElement.classList.toggle("open");
	});
}

function constructOptionItem(option: HTMLOptionElement, imageRoot?: string) {
	let container = document.createElement("div");
	container.setAttribute("select-val", option.value);

	let previewImg = document.createElement("img");
	previewImg.src = (imageRoot ?? "assets/rendered") + `/${option.value}.svg`;
	previewImg.onerror = function () { this.src = "assets/rendered/fallback.svg"; };
	previewImg.classList.add("crop-svg");

	let label = document.createElement("p");
	label.innerHTML = option.innerHTML;

	container.appendChild(previewImg);
	container.appendChild(label);

	container.addEventListener("click", function (e) {
		let s = this.parentElement.parentElement.getElementsByTagName("select")[0];
		let sl = s.length;
		let h = this.parentElement.previousElementSibling as HTMLDivElement;
		for (let i = 0; i < sl; i++) {
			if (s.options[i].value == this.getAttribute("select-val")) {
				s.selectedIndex = i;
				jQuery(s).trigger("change");
				h.innerHTML = this.getAttribute("select-val");
				let y = this.parentElement.getElementsByClassName("same-as-selected");
				for (let k = 0; k < y.length; k++)
					y[k].removeAttribute("class");
				this.setAttribute("class", "same-as-selected");
				break;
			}
		}
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