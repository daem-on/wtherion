export function trimEnclosing(text: string): string {
	text = text.trim();
	const starting = text.charAt(0);
	const ending = text.charAt(text.length - 1);
	if ([`"`, `'`].includes(starting) && starting === ending) {
		return text.substring(1, text.length - 1);
	} else if (starting === `[` && ending === `]`) {
		return text.substring(1, text.length - 1);
	}
	return text;
}

export function wrapIfNeeded(value: string, brackets: boolean): string {
	if (!value.includes(" ")) return value;
	if (brackets) return `[${value}]`;
	return `"${value}"`;
}