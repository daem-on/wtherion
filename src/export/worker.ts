self.onmessage = ({ data: { question } }) => {
	self.setTimeout(() => {
		self.postMessage({
			answer: 42,
		});
	}, 3000);
};
