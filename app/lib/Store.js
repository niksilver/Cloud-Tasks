// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Store data persistently
 */

var Store = {
	
	database: openDatabase("CloudTasks", "1.0", "Cloud Tasks", 20*1024),
	
	isInitialised: false,
	
	initialise: function() {
		if (!Store.database) {
			ErrorHandler.notify("No database available");
			return;
		}
		Store.execute(
			"create table if not exists 'tasks' (id integer primary key, json text)",
			[],
			function(transaction, results) { Store.isInitialised = true; },
			"Couldn't initialise database"
		);
	},
	
	execute: function(sql, args, onSuccess, onFailureString) {
		var sql_detail = "SQL " + sql + " and args [" + args + "]";
		Mojo.Log.info("Store.execute: Entering with " + sql_detail);
		Store.database.transaction(
			function(transaction) {
				Mojo.Log.info("Store.execute: Executing " + sql_detail);
				transaction.executeSql(
					sql,
					args,
					function(transaction, result) {
						Mojo.Log.info("Store.execute: Success for " + sql_detail);
						onSuccess(transaction, result);
					}.bind(this),
					function(transaction, error) {
						Mojo.Log.error("Store.execute: Failed " + sql_detail
							+ " with db message '" + error.message + "', user message '"
							+ onFailureString + "'");
						ErrorHandler.notify(onFailureString);
					}.bind(this)
				);
			}.bind(this)
		);
	},

	/**
	 * Persist a task.
	 * @param {TaskModel} task  The task to store.
	 */
	saveTask: function(task) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.saveTask: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.execute(
			"insert or replace into tasks (id, json) values (?, ?)",
			[task.localID, Object.toJSON(task)],
			function() {},
			"Could not save task"
		);
	},
	
	_saveTask: function(task) {
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
	 * @param {Function} onSuccess  Function to call when the task is retrieved.
	 *     Function will be called either with parameter of the TaskModel
	 *     or undefined if the corresponding task was not present.
	 */
	loadTask: function(local_id, onSuccess) {
		Mojo.Log.info("Store.loadTask: Entering with local ID " + local_id);
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.loadTask: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.execute(
			"select json from tasks where id = ?",
			[local_id],
			function(transaction, result) {
				if (result.rows.length == 0) {
					Mojo.Log.info("Store.loadTask: Empty result for local ID " + local_id);
					onSuccess(undefined);
				}
				var json = result.rows.item(0).json;
				var obj = json.evalJSON();
				var task = TaskModel.createFromObject(obj);
				onSuccess(task);
			},
			"Could not load task"
		);
	},
	
	_loadTask: function(local_id) {
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
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.removeTaskByLocalID: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.execute(
			"delete from tasks where id = ?",
			[local_id],
			function() {},
			"Could not delete task"
		);
	},
	_removeTaskByLocalID: function(local_id) {
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
	
	/**
	 * Load all the tasks from the store and return them (via a callback) as an array of
	 * TaskModel objects.
	 * @param {Array} onSuccess  A callback function which will be called
	 *     with an array of TaskModel objects.
	 */
	loadAllTasks: function(onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.loadAllTasks: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.execute(
			"select json from tasks",
			[],
			function(transaction, result) {
				var tasks = [];
				var count = result.rows.length;
				for (var i = 0; i < count; i++) {
					var json = result.rows.item(i).json;
					var obj = json.evalJSON();
					var task = TaskModel.createFromObject(obj);
					tasks.push(task);
				}
				Mojo.Log.info("Store.loadAllTasks: Loaded " + i + " tasks");
				onSuccess(tasks);
			},
			"Could not load tasks"
		);
	},
	_loadAllTasks: function() {
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
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.removeAllTasks: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.execute(
			"delete from tasks",
			[],
			function() {},
			"Could not delete tasks"
		);
	},
	_removeAllTasks: function() {
		var hash = Store.loadAllTasksHash();
		for (var i_local_id in hash) {
			var local_id = i_local_id.substr(1);
			Store.removeTaskByLocalID(local_id);
		}
	}

};
