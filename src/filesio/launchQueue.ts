export function setup() {
	if ('launchQueue' in window) {
		console.log('File Handling API is supported!');
	
		(window as any).launchQueue.setConsumer(launchParams => {
			handleFiles(launchParams.files);
		});
	} else {
		console.error('File Handling API is not supported!');
	}
}

async function handleFiles(files: FileSystemFileHandle[]) {
	if (files.length > 0) {
		const file = files[0];
        const blob = await file.getFile();
        const text = await blob.text();

        
    }
}