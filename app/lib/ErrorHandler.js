ErrorHandler = {
	notify: function(err_msg) {
		Mojo.Log.info("ErrorHandler.notify: Error: " + err_msg);
		Mojo.Controller.getAppController().showBanner(err_msg, {}, 'org.pigsaw.simplertm');
	}
}
