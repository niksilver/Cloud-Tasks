// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Store data persistently
 */

var Store = {
	
	database: openDatabase("CloudTasks", "1.0", "Cloud Tasks", 20*1024),
	
	isInitialised: false,
	
	/**
	 * Set up the database (if it's not set up already.
	 * @param {Function} onSuccess  Optional function to call when database initialised.
	 */
	initialise: function(onSuccess) {
		if (!Store.database) {
			ErrorHandler.notify("No database available");
			return;
		}
		onSuccess = onSuccess || function(){};
		Store.execute(
			"create table if not exists 'tasks' (id integer primary key, json text)",
			[],
			function(transaction, results) { Store.isInitialised = true; onSuccess(); },
			"Couldn't initialise database"
		);
	},
	
	execute: function(sql, args, onSuccess, onFailureString) {
		var sql_detail = "SQL " + sql + " and args [" + args + "]";
		Mojo.Log.info("Store.execute: Entering with " + sql_detail);
		Store.database.transaction(
			function(transaction) {
				Store.executeInTransaction(transaction, sql, args, onSuccess, onFailureString);
			}.bind(this)
		);
	},
	
	executeInTransaction: function(transaction, sql, args, onSuccess, onFailureString) {
		var sql_detail = "SQL " + sql + " and args [" + args + "]";
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
	}, 

	/**
	 * Persist a task.
	 * @param {TaskModel} task  The task to store.
	 * @param {Function} onSuccess  Optional callback when storage is complete.
	 *     Will be called with parameter of the task saved
	 */
	saveTask: function(task, onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.saveTask: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		var obj = task.toObject();
		onSuccess = onSuccess || function(){};
		Store.execute(
			"insert or replace into tasks (id, json) values (?, ?)",
			[task.localID, Object.toJSON(obj)],
			function() { onSuccess(task) },
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
				Mojo.Log.info("Store.loadTask.onSuccess: Entering");
				if (result.rows.length == 0) {
					Mojo.Log.info("Store.loadTask: Empty result for local ID " + local_id);
					onSuccess(undefined);
				}
				var json = result.rows.item(0).json;
				var obj = json.evalJSON();
				var task = TaskModel.createFromObject(obj);
				Mojo.Log.info("Store.loadTask.onSuccess: Got task " + task.toSummaryString());
				onSuccess(task);
			},
			"Could not load task"
		);
	},
	
	/**
	 * Remove a task from the persistence store.
	 * @param {TaskModel} task  The task to remove.
	 * @param {Function} onSuccess  Optional function to call when removed.
	 */
	removeTask: function(task, onSuccess) {
		Store.removeTaskByLocalID(task.localID, onSuccess);
	},
	
	/**
	 * Remove a task from the persistence store if we know its local ID.
	 * @param {Number} local_id  The local ID of the task to remove.
	 * @param {Function} onSuccess  Optional function to call when removed.
	 */
	removeTaskByLocalID: function(local_id, onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.removeTaskByLocalID: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		onSuccess = onSuccess || function(){};
		Store.execute(
			"delete from tasks where id = ?",
			[local_id],
			onSuccess,
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
	
	/**
	 * Remove all the tasks from the store.
	 * @param {Function} onSuccess  Optional function to call when done.
	 */
	removeAllTasks: function(onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.removeAllTasks: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		onSuccess = onSuccess || function(){};
		Store.execute(
			"delete from tasks",
			[],
			onSuccess,
			"Could not delete tasks"
		);
	},
	
	/**
	 * Replace all the tasks in the store.
	 * @param {Array} task_list  Array of TaskModel objects
	 * @param {Function} onSuccess  Optional function called when all tasks
	 *     have been replaced.
	 */
	replaceAllTasks: function(task_list, onSuccess) {
		if (!Store.isInitialised) {
			Mojo.Log.error("Store.replaceAllTasks: Database not initialised");
			ErrorHandler.notify("Database not initialised");
			return;
		}
		onSuccess = onSuccess || function(){};
		Store.database.transaction(
			// The transaction function
			function(transaction) {
				Mojo.Log.info("Store.replaceAllTasks: Inserting new tasks");
				Store.executeInTransaction(
					transaction,
					"delete from tasks",
					[],
					function() {},
					"Could not delete tasks"
				);
				for (var i = 0; i < task_list.length; i++) {
					var task = task_list[i];
					var obj = task.toObject();
					Store.executeInTransaction(
						transaction,
						"insert or replace into tasks (id, json) values (?, ?)",
						[task.localID, Object.toJSON(obj)],
						function() {},
						"Could not save task"
					);
				}
			},
			// Error callback
			Store.SQLTransactionErrorCallback,
			// Success callback
			{
				handleEvent: function() { onSuccess() }
			}
		);
	},
	
	// As defined at http://dev.w3.org/html5/webdatabase/#sqltransactionerrorcallback
	SQLTransactionErrorCallback: {
		handleEvent: function(error) {
			var str = "Error " + error.code + ": " + error.message;
			Mojo.Log.error("Store.SQLTransactionErrorCallback.handleEvent: " + str);
			ErrorHandler.notify(str);
		}
	}

};
