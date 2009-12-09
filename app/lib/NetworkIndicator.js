/**
 * A spinning indicator of network activity.
 */

NetworkIndicator = function(rtm, controller) {
	this.rtm = rtm;
	this.controller = controller;
	//this.animation = undefined;
}

NetworkIndicator.prototype.getElement = function() {
	return this.controller.get('NetworkIndicator');
}

NetworkIndicator.prototype.display = function(pos) {
	pos = Math.round(pos);
	var element = this.getElement();
	var img_value = "url('images/activity-loop-white-26x26.png')";
	var img_pos_y = -26 * pos;
	if (pos == -1) {
		img_value = 'none';
		img_pos_y = 0;
	}
	element.setStyle("background-image: " + img_value);
	element.setStyle("background-position-y: " + img_pos_y + "px");
}

NetworkIndicator.prototype.onNetworkRequestsChange = function(count) {
	Mojo.Log.info("NetworkIndicator.onNetworkRequestsChange: Entering with count = " + count);
	// Cases:
	//   Have activity, and already have animation
	//   Have no activity, and have no animation
	//   Have activity, but don't have animation
	//   Have no activity, but do have animation
	
	var activity = (count > 0);
	if (activity && this.animation) {
		// Do nothing
	}
	else if (!activity && !this.animation) {
		// Do nothing
	}
	else if (activity && !this.animation) {
		this.startAnimation();
	}
	else {
		this.stopAnimation();
	}
}

NetworkIndicator.prototype.startAnimation = function() {
	Mojo.Log.info("NetworkIndicator.startAnimation: Entering");
	if (this.animation) {
		Mojo.Log.warn("NetworkIndicator.startAnimation: Tried to start while animation already running");
		return;
	}
	
	var queue = Mojo.Animation.queueForElement(this.getElement());
	this.animation = Mojo.Animation.animateValue(queue,
		'linear',
		this.display.bind(this),
		{
			from: 0,
			to: 9.99,
			duration: 1.5
		});
}

NetworkIndicator.prototype.stopAnimation = function() {
	Mojo.Log.info("NetworkIndicator.stopAnimation: Entering");
	if (!this.animation) {
		Mojo.Log.warn("NetworkIndicator.stopAnimation: Tried to stop but no animation running");
		return;
	}
	
	this.display(-1);
	this.animation.cancel();
	delete this.animation;
}
