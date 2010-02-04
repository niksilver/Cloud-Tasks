<<<<<<< HEAD
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
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + task.localID]) {
			// Needs to be prefixed with a letter, as pure digits don't work
			all_tasks["i" + task.localID] = 1;
			Store.saveAllTasksHash(all_tasks);
		}
	
		var cookie = new Mojo.Model.Cookie('task' + task.localID);
		cookie.put(task.toObject());
	},
	
	/**
	 * Load a previously-persisted TaskModel and return it.
	 * @param {String} local_id  The local ID of the task when it was persisted.
	 */
	loadTask: function(local_id) {
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + local_id]) {
			return undefined;
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		var obj = cookie.get();
		return TaskModel.createFromObject(obj);
	},
	
	/**
	 * Remove a task from the persistence store.
	 */
	removeTask: function(task) {
		Store.removeTaskByLocalID(task.localID);
	},
	
	/**
	 * Remove a task from the persistence store if we know its local ID.
	 */
	removeTaskByLocalID: function(local_id) {
		var all_tasks = Store.loadAllTasksHash();
		if (all_tasks["i" + local_id]) {
			delete all_tasks["i" + local_id];
			Store.saveAllTasksHash(all_tasks);
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		cookie.remove();
	},
	
	/**
	 * Clear locally-cached properties.
	 */
	clearCache: function() {
		Store.all_tasks_cookie = undefined;
		Store.all_tasks = undefined;
	},
	
	getAllTasksCookie: function() {
		if (!Store.all_tasks_cookie) {
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
		if (!Store.all_tasks) {
			Store.all_tasks = Store.getAllTasksCookie().get();
		}
		var hash = Store.all_tasks || {};
		return hash;
	},
	
	/**
	 * Save a hash that maps (a) each local IDs of a task that is persisted to (b) Boolean true.
	 * @param {Object} hash  The hash to save.
	 */
	saveAllTasksHash: function(hash) {
		Store.getAllTasksCookie().put(hash);
	},
	
	loadAllTasks: function() {
		var tasks = [];
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			var task = Store.loadTask(local_id);
			tasks.push(task);
		}
		return tasks;
	},
	
	removeAllTasks: function() {
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			Store.removeTaskByLocalID(local_id);
		}
	}

};
=======
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
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + task.localID]) {
			// Needs to be prefixed with a letter, as pure digits don't work
			all_tasks["i" + task.localID] = 1;
			Store.saveAllTasksHash(all_tasks);
			Mojo.Log.info("Store.saveTask: Re-saved all-tasks hash");
		}
	
		var cookie = new Mojo.Model.Cookie('task' + task.localID);
		cookie.put(task.toObject());
	},
	
	/**
	 * Load a previously-persisted TaskModel and return it.
	 * @param {String} local_id  The local ID of the task when it was persisted.
	 */
	loadTask: function(local_id) {
		var all_tasks = Store.loadAllTasksHash();
		if (!all_tasks["i" + local_id]) {
			return undefined;
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		var obj = cookie.get();
		return TaskModel.createFromObject(obj);
	},
	
	/**
	 * Remove a task from the persistence store.
	 */
	removeTask: function(task) {
		Store.removeTaskByLocalID(task.localID);
	},
	
	/**
	 * Remove a task from the persistence store if we know its local ID.
	 */
	removeTaskByLocalID: function(local_id) {
		var all_tasks = Store.loadAllTasksHash();
		if (all_tasks["i" + local_id]) {
			delete all_tasks["i" + local_id];
			Store.saveAllTasksHash(all_tasks);
		}
	
		var cookie = new Mojo.Model.Cookie('task' + local_id);
		cookie.remove();
	},
	
	/**
	 * Clear locally-cached properties.
	 */
	clearCache: function() {
		Store.all_tasks_cookie = undefined;
		Store.all_tasks = undefined;
	},
	
	getAllTasksCookie: function() {
		if (!Store.all_tasks_cookie) {
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
		if (!Store.all_tasks) {
			Store.all_tasks = Store.getAllTasksCookie().get();
		}
		var hash = Store.all_tasks || {};
		return hash;
	},
	
	/**
	 * Save a hash that maps (a) each local IDs of a task that is persisted to (b) Boolean true.
	 * @param {Object} hash  The hash to save.
	 */
	saveAllTasksHash: function(hash) {
		Store.getAllTasksCookie().put(hash);
	},
	
	loadAllTasks: function() {
		var tasks = [];
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			var task = Store.loadTask(local_id);
			tasks.push(task);
		}
		return tasks;
	},
	
	removeAllTasks: function() {
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			Store.removeTaskByLocalID(local_id);
		}
	}

};
>>>>>>> 498edb28b89346d0c652a32cc5111cad07cada7f
