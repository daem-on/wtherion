declare const __BUILD_DATE__: string;

interface HitOptions {
	segments?: boolean,
	stroke?: boolean,
	curves?: boolean,
	handles?: boolean,
	fill?: boolean,
	guides?: boolean,
	bounds?: boolean,
	selected?: boolean,
	tolerance?: number,
	class?: new () => paper.Item,
	match?: (hit: paper.HitResult) => boolean,
}