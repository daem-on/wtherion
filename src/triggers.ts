export const triggers = {
	emit(triggerName: string) {
		document.dispatchEvent(new CustomEvent(triggerName));
	},
	
	on(triggerName: string, callback: () => void) {
		document.addEventListener(triggerName, callback);
	},
	
	off(triggerName: string, callback: () => void) {
		document.removeEventListener(triggerName, callback);
	},

	emitAll(triggerNames: string[]) {
		for (const triggerName of triggerNames) {
			this.emit(triggerName);
		}
	},

	onAny(triggerNames: string[], callback: () => void) {
		for (const triggerName of triggerNames) {
			this.on(triggerName, callback);
		}
	},

	offAny(triggerNames: string[], callback: () => void) {
		for (const triggerName of triggerNames) {
			this.off(triggerName, callback);
		}
	}
};