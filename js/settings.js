// functions related to settings / localstorage

module.exports = function () {
	var config;
	
	var setup = function() {
		config = {"appVersion": "0.42"};
		var storageVersionNumber = localStorage.getItem("pg.version");
		if(storageVersionNumber && storageVersionNumber !== config.appVersion) {
			console.warn('Settings version mismatch. Reverting all settings to default for now.');
			// version mismatch. removing old settings for now...
			// some sort of version mismatch handling is needed here
			clearSettings();

		} else if(!storageVersionNumber) {
			setVersionNumber();
		}
		
		document.title = 'wtherion '+config.appVersion;
	};
	
	
	var getVersionNumber = function() {
		return config.appVersion;
	};
	
	
	var setVersionNumber = function() {
		// save version number in localStorage
		localStorage.setItem("pg.version", config.appVersion);
	};
	
	
	var clearSettings = function() {
		localStorage.clear();
		setVersionNumber();
	};

	
	return {
		getVersionNumber: getVersionNumber,
		setup: setup,
		clearSettings: clearSettings
	};

}();