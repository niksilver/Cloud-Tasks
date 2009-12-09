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
	pos = Math.round(pos) % 10;
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
	var inst = this;
	this.animation = Mojo.Animation.animateValue(queue,
		'linear',
		this.display.bind(this),
		{
			from: 0,
			to: 10*1000*1000,
			duration: 1.0 * (1000*1000), // 1.0s per 10-frame loop
			onComplete: inst.onAnimationComplete.bind(inst)
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

/**
 * On animation complete consider that it has to be restarted.
 * @param {Object} was_cancelled  Whether the animation was cancelled
 */
NetworkIndicator.prototype.onAnimationComplete = function(was_cancelled){
	Mojo.Log.info("NetworkIndicator.onAnimationComplete: Entering");
	delete this.animation;
	if (!was_cancelled) {
		Mojo.Log.info("NetworkIndicator.onAnimationComplete: Animation not cancelled so will restart it");
		this.startAnimation();
	}
}
