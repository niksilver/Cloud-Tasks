// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

ErrorHandler = {
	notify: function(err_msg) {
		Mojo.Log.warn("ErrorHandler.notify: Error: " + err_msg);
		TestUtils.quickLog("ErrorHandler.notify: Error: " + err_msg);
	}
}
