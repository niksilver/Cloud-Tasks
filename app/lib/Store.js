// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Store data persistently
 */

var Store = {

	/**
	 * Persist a task.
	 * @param {TaskModel} task  The task to store.
	 */
	saveTask: function(task) {
		Mojo.Log.info("Store.saveTask: Entering");
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + task.localID]) {
			// Needs to be prefixed with a letter, as pure digits don't work
			all_tasks["i" + task.localID] = 1;
			Store.saveAllTasksHash(all_tasks);
			Mojo.Log.info("Store.saveTask: Re-saved all-tasks hash");
		}
	
		var cookie = new Mojo.Model.Cookie('task' + task.localID);
		cookie.put(task.toObject());
		Mojo.Log.info("Store.saveTask: Saved " + task.toSummaryString());
	},
	
	/**
	 * Load a previously-persisted TaskModel and return it.
	 * @param {String} local_id  The local ID of the task when it was persisted.
	 */
	loadTask: function(local_id) {
		Mojo.Log.info("Store.loadTask: Entering");
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + local_id]) {
			Mojo.Log.info("Store.loadTask: No task, returning undefined");
			return undefined;
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		var obj = cookie.get();
		Mojo.Log.info("Store.loadTask: Loaded " + Object.toJSON(obj));
		return TaskModel.createFromObject(obj);
	},
	
	/**
	 * Remove a task from the persistence store.
	 */
	removeTask: function(task) {
		Mojo.Log.info("Store.removeTask: Entering with task " + task.toSummaryString());
		Store.removeTaskByLocalID(task.localID);
	},
	
	/**
	 * Remove a task from the persistence store if we know its local ID.
	 */
	removeTaskByLocalID: function(local_id) {
		Mojo.Log.info("Store.removeTask: Entering with local ID " + local_id);
		var all_tasks = Store.loadAllTasksHash();
		if (all_tasks["i" + local_id]) {
			delete all_tasks["i" + local_id];
			Store.saveAllTasksHash(all_tasks);
			Mojo.Log.info("Store.removeTask: Re-saved all-tasks hash");
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		cookie.remove();
	},
	
	/**
	 * Clear locally-cached properties.
	 */
	clearCache: function() {
		Mojo.Log.info("Store.clearCache: Entering");
		Store.all_tasks_cookie = undefined;
		Store.all_tasks = undefined;
	},
	
	getAllTasksCookie: function() {
		Mojo.Log.info("Store.getAllTasksCookie: Entering");
		if (!Store.all_tasks_cookie) {
			Mojo.Log.info("Store.getAllTasksCookie: Creating new cookie");
			Store.all_tasks_cookie = new Mojo.Model.Cookie('allTasks');
		}
		return Store.all_tasks_cookie;
	},
	
	/**
	 * Load a hash that maps a local ID string to 1.
	 * The local ID string is "i" + the local ID.
	 * The presence of something in this hash indicates that the task with that local ID
	 * has been persisted.
	 */
	loadAllTasksHash: function() {
		Mojo.Log.info("Store.loadAllTasksHash: Entering");
		if (!Store.all_tasks) {
			Mojo.Log.info("Store.loadAllTasksHash: Getting all_tasks cookie");
			Store.all_tasks = Store.getAllTasksCookie().get();
		}
		Mojo.Log.info("Store.loadAllTasksHash: Got data " + Object.toJSON(Store.all_tasks));
		var hash = Store.all_tasks || {};
		Mojo.Log.info("Store.loadAllTasksHash: Hash is " + Object.toJSON(hash));
		return hash;
	},
	
	/**
	 * Save a hash that maps (a) each local IDs of a task that is persisted to (b) Boolean true.
	 * @param {Object} hash  The hash to save.
	 */
	saveAllTasksHash: function(hash) {
		Mojo.Log.info("Store.saveAllTasksHash: Entering with hash " + Object.toJSON(hash));
		Store.getAllTasksCookie().put(hash);
		Mojo.Log.info("Store.saveAllTasksHash: Check: hash is " + Object.toJSON(Store.getAllTasksCookie().get()));
	},
	
	loadAllTasks: function() {
		Mojo.Log.info("Store.loadAllTasks: Entering");
		var tasks = [];
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			var task = Store.loadTask(local_id);
			tasks.push(task);
			Mojo.Log.info("Store.loadAllTasks: Loaded " + task.toSummaryString());
		}
		return tasks;
	},
	
	removeAllTasks: function() {
		Mojo.Log.info("Store.removeAllTasks: Entering");
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			Store.removeTaskByLocalID(local_id);
			Mojo.Log.info("Store.removeAllTasks: Removed task with local ID " + local_id);
		}
	}

};
