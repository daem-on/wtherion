import helper from "../js/helper";
import { floater } from "../js/modal";
import getSettings from "./objectSettings/model/getSettings";
import paper from "paper";
import { focusItem } from "./selection";

const results: paper.Item[] = [];
let currentIndex = 0;

export function openSearchDialog() {
	jQuery("#searchWindow").remove();
	results.length = 0;

	const content = jQuery("<div class='search-ui'>");
	const searchInput = jQuery<HTMLInputElement>("<input type='text'>")
		.attr("placeholder", "RegEx");
	const searchButton = jQuery("<button>%search.search%</button>");
	const searchResults = jQuery("<div>0/0</div>");
	const previousButton = jQuery("<button>&lt</button>")
		.attr("title", "%search.previous%");
	const nextButton = jQuery("<button>&gt</button>")
		.attr("title", "%search.next%");

	content.append(
		searchInput, searchButton, searchResults, previousButton, nextButton
	);

	function updateResultsText() {
		if (results.length === 0) {
			searchResults.text("0/0").attr("title", "%search.noResults%");
		} else {
			searchResults.text(
				`${currentIndex + 1}/${results.length}`
			).attr("title", null);
		}
	}

	searchButton.on("click", () => {
		if (searchInput.val() === "") return;
		search(searchInput.val() as string);
		updateResultsText();
	});

	nextButton.on("click", () => {
		currentIndex = (currentIndex + 1) % results.length;
		updateResultsText();
		focusSelection();
	});

	previousButton.on("click", () => {
		currentIndex = (currentIndex - 1 + results.length) % results.length;
		updateResultsText();
		focusSelection();
	});

	floater("searchWindow", "%search.search%", content, 400, 200);
}

function search(query: string) {
	const re = new RegExp(query, "i");
	results.length = 0;

	for (const item of paper.project.getItems({ recursive: true })) {
		const s = getSettings(item as any);

		const match = (
			("id" in s && s.id.match(re)) ||
			("name" in s && s.name.match(re)) ||
			("text" in s && s.text.match(re)) ||
			("value" in s && s.value.match(re))
		);

		if (match) results.push(item);
	}

	currentIndex = 0;
}

function focusSelection() {
	if (results.length > 0) {
		focusItem(results[currentIndex]);
	}
}