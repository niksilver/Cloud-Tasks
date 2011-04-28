// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

ErrorHandler = {
	
	lastErrorText: undefined,
	lastErrorLocation: undefined,
		
	notify: function(err_msg, location) {
		Mojo.Log.info("ErrorHandler.notify: Error: " + err_msg);
		this.lastErrorText = err_msg;
		this.lastErrorLocation = location;
		Mojo.Controller.getAppController().showBanner(err_msg, {}, 'org.pigsaw.cloudtasks');
	}
}
