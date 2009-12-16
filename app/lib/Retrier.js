/**
 * Class which allows the various dependent events to be retried.
 * The events are run in the following independent sequences...
 * 
 * - Connection manager
 *   - Only do this if connection manager not yet defined
 *   - Set up connection manager
 *   
 * - Other
 *   - Have an internet connection
 *   - Make sure no other network requests on-going
 *   - Be authorised to access the user's Remember The Milk data.
 *   - Have a timeline
 *   - Push local changes
 */

/**
 * Create a new retrier.
 * @param {RTM} rtm  The RTM client.
 */
function Retrier(rtm) {
	this.rtm = rtm;
}

/**
 * The constructor function used to create a service request.
 * By default Mojo.Service.Request, but override for testing if needed.
 */
Retrier.prototype.serviceRequestConstructor = Mojo.Service.Request;

/**
 * Set this so that the Retrier has tasks to push.
 */
Retrier.prototype.taskListModel = undefined;

/**
 * Fire the next event where possible.
 * Won't do anything if there is ongoing network activity.
 */
Retrier.prototype.fire = function() {
	Mojo.Log.info("Retrier.fire: Entering");
	
	this.fireSetUpConnectionManagerSequence();
	this.fireOtherSequence();
}

/**
 * Do necessary work to set up connection manager.
 * Won't do anything if connection manager already set up.
 */
Retrier.prototype.fireSetUpConnectionManagerSequence = function() {
	if (this.rtm.connectionManager) {
		return;
	}
	Mojo.Log.info("Retrier.fire: Setting up connection manager");
	this.rtm.setUpConnectionManager(this.serviceRequestConstructor);
}

Retrier.prototype.fireOtherSequence = function() {
	if (!this.rtm.haveNetworkConnectivity) {
		// Can't do anything about this, just have to wait for a connection
		Mojo.Log.info("Retrier.fire: Need an internet connection, but can't take action");
	}
	else if (this.rtm.networkRequests() > 0) {
		Mojo.Log.info("Retrier.fire: Network requests ongoing, so won't take action");
		return;
	}
	else if (!this.rtm.getToken()) {
		Mojo.Log.info("Retrier.fire: No auth token, can't go further");
	}
	else if (!this.rtm.timeline) {
		Mojo.Log.info("Retrier.fire: Getting timeline");
		this.rtm.createTimeline();
	}
	else if (this.taskListModel) {
		Mojo.Log.info("Retrier.fire: Can push local changes");
		this.rtm.pushLocalChanges(this.taskListModel);
	}
	else {
		Mojo.Log.info("Retrier.fire: No actions to take");
	}
}
