// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Class to help us space out events with a timer.
 */

/**
 * Set up a new event spacer, defining the minimum spacing between events.
 * Initially it will say it's ready to fire an event.
 * @param {Number} spacing_ms  The spacing between events, in milliseconds.
 */
function EventSpacer(spacing_ms) {
	this._spacing_ms = spacing_ms;
	this._is_ready = true;
}

/**
 * See if it's time enough to fire another event.
 */
EventSpacer.prototype.isReady = function() {
	return this._is_ready;
}

EventSpacer.prototype.haveFired = function() {
	this._is_ready = false;
	var inst = this;
	setTimeout(function() {
			inst._is_ready = true;
		},
		this._spacing_ms);
}
