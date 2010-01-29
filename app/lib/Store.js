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
		if (!all_tasks[task.localID]) {
			all_tasks[task.localID] = true;
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
		if (!all_tasks[local_id]) {
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
		var all_tasks = Store.loadAllTasksHash();
		if (all_tasks[task.localID]) {
			delete all_tasks[task.localID];
			Store.saveAllTasksHash(all_tasks);
		}
	
		var cookie = new Mojo.Model.Cookie('task' + task.localID);
		cookie.remove();
	},
	
	/**
	 * Load a hash that maps (a) each local IDs of a task that is persisted to (b) Boolean true.
	 */
	loadAllTasksHash: function() {
		var all_tasks_cookie = new Mojo.Model.Cookie('allTasks');
		var all_tasks = all_tasks_cookie.get();
		return all_tasks || {};
	},
	
	/**
	 * Save a hash that maps (a) each local IDs of a task that is persisted to (b) Boolean true.
	 * @param {Object} hash  The hash to save.
	 */
	saveAllTasksHash: function(hash) {
		var all_tasks_cookie = new Mojo.Model.Cookie('allTasks');
		all_tasks_cookie.put(hash);
	},
	
	loadAllTasks: function() {
		var tasks = [];
		var hash = Store.loadAllTasksHash();
		for (var local_id in hash) {
			var task = Store.loadTask(local_id);
			tasks.push(task);
		}
		return tasks;
	}

};
