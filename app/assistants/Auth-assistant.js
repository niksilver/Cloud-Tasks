// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

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
	
	this.authGoModel = { disabled: false };
	this.controller.setupWidget('auth-go', {
			label: 'Go',
			type: Mojo.Widget.activityButton
		},
		this.authGoModel);
	this.controller.listen('auth-go', Mojo.Event.tap, this.handleGoTap.bind(this));
	
	this.authFinishModel = { disabled: true };
	this.controller.setupWidget('auth-finish', {
			label: 'Finish',
			type: Mojo.Widget.activityButton
		},
		this.authFinishModel);
	this.controller.listen('auth-finish', Mojo.Event.tap, this.handleFinishTap.bind(this));
}

AuthAssistant.prototype.handleGoTap = function(event){
	Mojo.Log.info("AuthAssistant.handleGoTap: Entering");
	
	// Get the Go button spinning
	this.updateButtons(false, true, false, false);
	
	var inst = this;
	this.rtm.fetchFrob(
		function(frob){
			Mojo.Log.info("AuthAssistant.handleGoTap: Got frob");
			inst.frob = frob;
			var auth_url = inst.rtm.getAuthURL(frob);
			inst.makeAuthRequest(auth_url);
		}, function(err_msg){
			Mojo.Log.info("AuthAssistant.handleGoTap: Error: " + err_msg);
			ErrorHandler.notify(err_msg);
			// Make the Go button available again
			inst.updateButtons(true, false, false, false);
		}
	);
}

/**
 * Update the auth Go and Finish buttons.
 * @param {Boolean} go_enabled  True if the Go button is enabled.
 * @param {Boolean} go_active  True if the Go button's spinner needs to be spinning.
 * @param {Boolean} finish_enabled  True if the Finish button is enabled.
 * @param {Boolean} finish_active  True if the Finish button's spinner needs to be spinning.
 */
AuthAssistant.prototype.updateButtons = function(go_enabled, go_active, finish_enabled, finish_active) {
	Mojo.Log.info("AuthAssistant.updateButtons: Entering");
	
	var go_disabled = !go_enabled;
	if (go_disabled != this.authGoModel.disabled) {
		this.authGoModel.disabled = go_disabled;
		this.controller.modelChanged(this.authGoModel);
	}
	if (go_active) {
		Mojo.Log.info("AuthAssistant.updateButtons: Activating Go button");
		this.controller.get('auth-go').mojo.activate();
	}
	else {
		this.controller.get('auth-go').mojo.deactivate();
	}
	
	var finish_disabled = !finish_enabled;
	if (finish_disabled != this.authFinishModel.disabled) {
		this.authFinishModel.disabled = finish_disabled;
		this.controller.modelChanged(this.authFinishModel);
	}
	if (finish_active) {
		this.controller.get('auth-finish').mojo.activate();
	}
	else {
		this.controller.get('auth-finish').mojo.deactivate();
	}
}

AuthAssistant.prototype.makeAuthRequest = function(auth_url) {
	Mojo.Log.info("AuthAssistant.makeAuthRequest: Entering with auth_url " + auth_url);
	var inst = this;
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			  id: 'com.palm.app.browser',
			  params: { target: auth_url }
		},
		// On success make the Finish button available
		onSuccess: function() { inst.updateButtons(false, false, true, false) },
		// On failure make the Go button available again
		onFailure: function() { inst.updateButtons(true, false, false, false) }
	});
}

AuthAssistant.prototype.handleFinishTap = function(event){
	Mojo.Log.info("AuthAssistant.handleFinishTap: Entering");
	
	// Have the Finish button start spinning as it fetches the token
	this.updateButtons(false, false, false, true);
	
	var inst = this;
	this.rtm.fetchToken(
		this.frob,
		function(token){
			Mojo.Log.info("AuthAssistant.handleFinishTap: Got token " + token);
			// Have the Finish button stop spinning
			inst.updateButtons(false, false, false, false);
			inst.rtm.setToken(token);
			Mojo.Controller.stageController.popScene();
		}, function(err_msg){
			Mojo.Log.info("AuthAssistant.handleFinishTap: Error: " + err_msg);
			// Make the Finish button available again
			inst.updateButtons(false, false, true, false);
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
