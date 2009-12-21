function AuthAssistant(tools) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	  Mojo.Log.info("AuthAssistant: Entering");	  
	  this.rtm = tools.rtm;
}

AuthAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	Mojo.Log.info("AuthAssistant.setup: Entering");
		
	this.controller.setupWidget('auth-go', {}, { buttonLabel: 'Go' });
	this.controller.listen('auth-go', Mojo.Event.tap, this.handleGoTap.bind(this));
	this.controller.listen('auth-finish', Mojo.Event.tap, this.handleFinishTap.bind(this));
}

AuthAssistant.prototype.handleGoTap = function(event){
	Mojo.Log.info("AuthAssistant.handleGoTap: Entering");
	var auth_assistant = this;
	this.rtm.fetchFrob(
		function(frob){
			Mojo.Log.info("AuthAssistant.handleGoTap: Got frob");
			auth_assistant.frob = frob;
			var auth_url = auth_assistant.rtm.getAuthURL(frob);
			auth_assistant.makeAuthRequest(auth_url);
		}, function(err_msg){
			Mojo.Log.info("AuthAssistant.handleGoTap: Error: " + err_msg);
			ErrorHandler.notify(err_msg);
		}
	);
}

AuthAssistant.prototype.makeAuthRequest = function(auth_url) {
	Mojo.Log.info("AuthAssistant.makeAuthRequest: Entering with auth_url " + auth_url);
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			  id: 'com.palm.app.browser',
			  params: {
			      target: auth_url
			  }
		}
	});
}

AuthAssistant.prototype.handleFinishTap = function(event){
	Mojo.Log.info("AuthAssistant.handleFinishTap: Entering");
	var auth_assistant = this;
	this.rtm.fetchToken(
		this.frob,
		function(token){
			Mojo.Log.info("AuthAssistant.handleFinishTap: Got token " + token);
			auth_assistant.rtm.setToken(token);
			Mojo.Controller.stageController.popScene();
		}, function(err_msg){
			Mojo.Log.info("AuthAssistant.handleFinishTap: Error: " + err_msg);
			ErrorHandler.notify(err_msg);
		}
	);
};

AuthAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


AuthAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

AuthAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
