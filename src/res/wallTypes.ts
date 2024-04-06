import wallList from "./walls-list.json";

export const wallTypes: string[] = wallList.labels
	.concat(wallList.passages)
	.concat(wallList["passage fills"])
	.concat(wallList.special);
