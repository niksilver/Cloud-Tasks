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
	 * @param {Function} onSuccess  Optional callback when storage is complete.
	 */
	saveTask: function(task, onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.saveTask: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		var obj = task.toObject();
		var onSuccess = onSuccess || function(){};
		Store.execute(
			"insert or replace into tasks (id, json) values (?, ?)",
			[task.localID, Object.toJSON(obj)],
			onSuccess,
			"Could not save task"
		);
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
	
	/**
	 * Load all the tasks from the store and return them (via a callback) as an array of
	 * TaskModel objects.
	 * @param {Function} onSuccess  A callback function which will be called
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
	
	/**
	 * Replace all the tasks in the store.
	 * @param {Array} task_list  Array of TaskModel objects
	 */
	replaceAllTasks: function(task_list) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.replaceAllTasks: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		Store.database.transaction(
			function(transaction) {
				Mojo.Log.info("Store.replaceAllTasks: Inserting new tasks");
				transaction.executeSql(
					"delete from tasks",
					[],
					function() {},
					"Could not delete tasks"
				);
				for (var i = 0; i < task_list.length; i++) {
					var task = task_list[i];
					var obj = task.toObject();
					transaction.executeSql(
						"insert or replace into tasks (id, json) values (?, ?)",
						[task.localID, Object.toJSON(obj)],
						function() {},
						"Could not save task"
					);
				}
			}
		);
	}

};
