// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

ErrorHandler = {

	lastErrorText: undefined,
	lastErrorLocatoin: undefined,

	notify: function(err_msg, location) {
		Mojo.Log.warn("ErrorHandler.notify: Error: " + err_msg);
		TestUtils.quickLog("ErrorHandler.notify: Error: " + err_msg);
	}
}
