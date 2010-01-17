// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

ErrorHandler = {
	notify: function(err_msg) {
		Mojo.Log.info("ErrorHandler.notify: Error: " + err_msg);
		Mojo.Controller.getAppController().showBanner(err_msg, {}, 'org.pigsaw.cloudtasks');
	}
}
