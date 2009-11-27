/**
 * Test the task list model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testConstructor: function() {
			var model = new TaskListModel();
			Y.Assert.isNotUndefined(model, "Model can't be constructed");
		},
		
		testSetRemoteJSON: function() {
			var model = new TaskListModel();
			model.setRemoteJSON(this.big_remote_json);
			
			var tasks = model.getRemoteTasks();
			Y.Assert.isArray(tasks, "Tasks is not an array");
			Y.assert(tasks.length > 10, "Tasks is not very long, only got " + tasks.length + " items");
			
			var sample_task;
			for (var i = 0; i < tasks.length; i++) {
				var task = tasks[i];
				Y.Assert.isNotUndefined(task.listID, "Task " + i + " does not have a listID");
				Y.Assert.isNotUndefined(task.taskID, "Task " + i + " does not have a taskID");
				Y.Assert.isNotUndefined(task.taskseriesID, "Task " + i + " does not have a taskseriesID");
				Y.Assert.isNotUndefined(task.name, "Task " + i + " does not have a name");
				Y.Assert.isNotUndefined(task.due, "Task " + i + " does not have a due property");
				if (task.taskID == '79139889') {
					sample_task = task;
				}
			}
			
			Y.Assert.areEqual('2637966', sample_task.listID, "List id not correct");
			Y.Assert.areEqual('55274651', sample_task.taskseriesID, "Taskseries id not correct");
			Y.Assert.areEqual('MB, AB - Update on testing companies', sample_task.name, "Task name not correct");
			Y.Assert.areEqual('2009-12-01T00:00:00Z', sample_task.due, "Task due property not correct");			
		},
		
		testSetRemoteJSONWhichUsesArrays: function() {

			var model = new TaskListModel();
			model.setRemoteJSON(this.remote_json_with_two_lists);
			var tasks = model.getRemoteTasks();

			var task_hash = {};
			tasks.each(function(task) {
				task_hash[task.taskID] = task;
			});
			
			Y.Assert.areEqual('11122940', task_hash['79648346'].listID, "Test 1.1");
			Y.Assert.areEqual('55630580', task_hash['79648346'].taskseriesID, "Test 1.2");
			Y.Assert.areEqual('79648346', task_hash['79648346'].taskID, "Test 1.3");
			
			Y.Assert.areEqual('2637966', task_hash['75724449'].listID, "Test 2.1");
			Y.Assert.areEqual('52954009', task_hash['75724449'].taskseriesID, "Test 2.2");
			Y.Assert.areEqual('75724449', task_hash['75724449'].taskID, "Test 2.3");
			
			Y.Assert.areEqual('2637966', task_hash['66459582'].listID, "Test 3.1");
			Y.Assert.areEqual('46489199', task_hash['66459582'].taskseriesID, "Test 3.2");
			Y.Assert.areEqual('66459582', task_hash['66459582'].taskID, "Test 3.3");
		},
		
		testGetRemoteTasksIsSorted: function() {
			var model = new TaskListModel();
			model.setRemoteJSON(this.big_remote_json);
			var tasks = model.getRemoteTasks();
			var last_date = tasks[0].due;
			
			for (var i = 0; i < tasks.length; i++) {
				var this_date = tasks[i].due;
				Y.assert(last_date <= this_date, "Date for task[" + i + "] is " + this_date + " but comes after " + last_date);
				last_date = this_date;
			}
		},

		testDueTasksFlagged: function() {

			var model = new TaskListModel();

			model.setRemoteJSON(this.remote_json_with_overdue_tasks);
			var tasks = model.getRemoteTasks();

			var task_hash = {};			
			tasks.each(function(task) {
				task_hash[task.taskID] = task;
				task.today = function() {
					return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
				};
				task.update();
			});
			
			Y.Assert.areEqual(true, task_hash['79648346'].isDueFlag, "Test 1: No due date");
			Y.Assert.areEqual(true, task_hash['75724449'].isDueFlag, "Test 2: A while back");
			Y.Assert.areEqual(false, task_hash['66459582'].isDueFlag, "Test 3: The future");
			Y.Assert.areEqual(true, task_hash['11223344'].isDueFlag, "Test 4: Today");
		},
		
		testOverdueTasksFlagged: function() {

			var model = new TaskListModel();
			model.today = function() {
				return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
			};

			model.setRemoteJSON(this.remote_json_with_overdue_tasks);
			var tasks = model.getRemoteTasks();

			var task_hash = {};
			tasks.each(function(task) {
				task_hash[task.taskID] = task;
			});
			
			Y.Assert.areEqual(false, task_hash['79648346'].isOverdueFlag, "Test 1: No due date");
			Y.Assert.areEqual(true, task_hash['75724449'].isOverdueFlag, "Test 2: A while back");
			Y.Assert.areEqual(false, task_hash['66459582'].isOverdueFlag, "Test 3: The future");
			Y.Assert.areEqual(false, task_hash['11223344'].isOverdueFlag, "Test 4: Today");
		},
		
		testDueDateFormatter: function() {
			var model = new TaskListModel();
			model.today = function() {
				return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
			};
			
			// Various forms of today (Tue)
			Y.Assert.areEqual('Today', model.dueDateFormatter('2009-12-01T00:00:00Z'), 'Test today 1');
			Y.Assert.areEqual('Today', model.dueDateFormatter('2009-12-01T13:27:08Z'), 'Test today 2');
			
			// Various forms of tomorrow (Wed)
			Y.Assert.areEqual('Tomorrow', model.dueDateFormatter('2009-12-02T00:00:00Z'), 'Test tomorrow 1');
			Y.Assert.areEqual('Tomorrow', model.dueDateFormatter('2009-12-02T14:54:22Z'), 'Test tomorrow 2');
			
			// Dates within the next week (Thu to Mon)
			Y.Assert.areEqual('Thu', model.dueDateFormatter('2009-12-03T14:54:22Z'), 'Test Thu');
			Y.Assert.areEqual('Fri', model.dueDateFormatter('2009-12-04T14:54:22Z'), 'Test Fri');
			Y.Assert.areEqual('Sat', model.dueDateFormatter('2009-12-05T14:54:22Z'), 'Test Sat');
			Y.Assert.areEqual('Sun', model.dueDateFormatter('2009-12-06T14:54:22Z'), 'Test Sun');
			Y.Assert.areEqual('Mon', model.dueDateFormatter('2009-12-07T14:54:22Z'), 'Test Mon');
			
			// Dates with the next 12 months
			Y.Assert.areEqual('Fri 8 Jan', model.dueDateFormatter('2010-01-08T14:54:22Z'), 'Test year 1');
			Y.Assert.areEqual('Mon 12 Jul', model.dueDateFormatter('2010-07-12T14:54:22Z'), 'Test year 2');
			Y.Assert.areEqual('Tue 30 Nov', model.dueDateFormatter('2010-11-30T14:54:22Z'), 'Test year 3');
			
			// Dates beyond next 12 months
			Y.Assert.areEqual('Wed 1 Dec 2010', model.dueDateFormatter('2010-12-01T14:54:22Z'), 'Test over year 1');
			Y.Assert.areEqual('Thu 2 Dec 2010', model.dueDateFormatter('2010-12-02T14:54:22Z'), 'Test over year 2');
			Y.Assert.areEqual('Fri 25 Feb 2011', model.dueDateFormatter('2011-02-25T14:54:22Z'), 'Test over year 3');
			
			// Non-times should give 'None'
			Y.Assert.areEqual('None', model.dueDateFormatter(''), 'Test none-time 1');
			Y.Assert.areEqual('None', model.dueDateFormatter('xxx'), 'Test none-time 2');
			Y.Assert.areEqual('None', model.dueDateFormatter({}), 'Test none-time 3');
			Y.Assert.areEqual('None', model.dueDateFormatter(), 'Test none-time 4');
			
			// Overdue dates
			Y.Assert.areEqual('Sun 22 Nov', model.dueDateFormatter('2009-11-22T14:54:22Z'), 'Test overdue 1');
			Y.Assert.areEqual('Mon 2 Jun', model.dueDateFormatter('2008-06-02T14:54:22Z'), 'Test overdue 2');
		},
		
		setUp: function() {
			this.setUpBigRemoteJSON();
			this.setUpRemoteJSONWithTwoLists();
			this.setUpRemoteJSONWithOverdueTasks();
		},
		
		setUpBigRemoteJSON: function() {
			this.big_remote_json = {
			   "rsp":{
			      "stat":"ok",
			      "tasks":{
			         "list":
					 	// Might be an array of list objects, not just a single list object as here
					 	{
			            "id":"2637966",
			            "taskseries":[
			               {
			                  "id":"52954009",
			                  "created":"2009-10-22T20:49:48Z",
			                  "modified":"2009-10-22T20:49:48Z",
			                  "name":"O2 - Expect deposit credited",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"75724449",
			                     "due":"2010-01-26T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-10-22T20:49:48Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"46489199",
			                  "created":"2009-08-06T08:42:04Z",
			                  "modified":"2009-09-03T13:43:00Z",
			                  "name":"MB - Plans for Richard Pope?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"66459582",
			                     "due":"2010-01-08T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-08-06T08:42:04Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"6",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"55274651",
			                  "created":"2009-11-17T10:34:49Z",
			                  "modified":"2009-11-17T10:34:49Z",
			                  "name":"MB, AB - Update on testing companies",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"0",
			                     "$t":"FREQ=WEEKLY;INTERVAL=2"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"79139889",
			                     "due":"2009-12-01T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-17T10:34:49Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54732974",
			                  "created":"2009-11-11T14:51:28Z",
			                  "modified":"2009-11-11T14:51:28Z",
			                  "name":"MH - At furneral",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78338880",
			                     "due":"2009-11-30T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-11T14:51:28Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54961818",
			                  "created":"2009-11-13T16:37:31Z",
			                  "modified":"2009-11-13T16:37:31Z",
			                  "name":"Roy D'Souza - Progress on DC's remote access?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78667188",
			                     "due":"2009-11-25T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T16:37:31Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"30123455",
			                  "created":"2009-01-06T17:32:51Z",
			                  "modified":"2009-11-18T10:16:41Z",
			                  "name":"PIM - Write up minutes",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"79230748",
			                     "due":"2009-11-25T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-18T00:00:48Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54750411",
			                  "created":"2009-11-11T18:02:25Z",
			                  "modified":"2009-11-11T18:02:25Z",
			                  "name":"Test companies - reject",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78364799",
			                     "due":"2009-11-23T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-11T18:02:25Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"46761347",
			                  "created":"2009-08-10T14:37:54Z",
			                  "modified":"2009-11-16T10:29:52Z",
			                  "name":"Legal - Check updatedoc",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"1",
			                     "$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78909702",
			                     "due":"2009-11-23T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-16T00:01:32Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54961430",
			                  "created":"2009-11-13T16:33:34Z",
			                  "modified":"2009-11-18T16:56:07Z",
			                  "name":"Team - speak to!",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78666784",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T16:33:34Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"2",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"38212211",
			                  "created":"2009-04-15T10:27:42Z",
			                  "modified":"2009-11-13T10:36:34Z",
			                  "name":"Stand-up - Anno unce team catch-up",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"1",
			                     "$t":"FREQ=WEEKLY;INTERVAL=1"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78568998",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T00:01:38Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"32135089",
			                  "created":"2009-01-29T08:16:01Z",
			                  "modified":"2009-11-18T16:58:19Z",
			                  "name":"Misc notes - Update",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"1",
			                     "$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"79230749",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-18T00:00:48Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"1",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"41932927",
			                  "created":"2009-06-03T14:21:01Z",
			                  "modified":"2009-11-18T16:53:56Z",
			                  "name":"Micro-apps - Track",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"59675483",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-06-03T14:21:01Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"48560123",
			                  "created":"2009-09-02T10:55:14Z",
			                  "modified":"2009-11-18T10:37:18Z",
			                  "name":"MH - Roadmap measurements report?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"69463342",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-09-02T10:55:14Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"5",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"27451945",
			                  "created":"2008-11-30T20:32:34Z",
			                  "modified":"2009-11-12T17:38:52Z",
			                  "name":"MB - Report for CDs' meeting",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"1",
			                     "$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=FR"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78531435",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-12T17:38:52Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"51963692",
			                  "created":"2009-10-12T10:55:46Z",
			                  "modified":"2009-11-06T16:22:08Z",
			                  "name":"HI - WorldPay ownership?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"74322972",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-10-12T10:55:46Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54965930",
			                  "created":"2009-11-13T17:29:39Z",
			                  "modified":"2009-11-18T16:55:27Z",
			                  "name":"Gumtree - Prepare presentation",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78671852",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T17:29:39Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"2",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"54937892",
			                  "created":"2009-11-13T11:20:49Z",
			                  "modified":"2009-11-18T16:54:59Z",
			                  "name":"GB - Plan and progress on micro-app envs?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78631928",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T11:20:49Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"27451972",
			                  "created":"2008-11-30T20:33:00Z",
			                  "modified":"2009-11-13T10:51:11Z",
			                  "name":"Data - back up",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "rrule":{
			                     "every":"1",
			                     "$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=FR"
			                  },
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"78568996",
			                     "due":"2009-11-20T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-11-13T00:01:38Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               }
			            ]
			         }
			      }
			   }
			}; // big_remote_json
		},

		setUpRemoteJSONWithTwoLists: function() {
			this.remote_json_with_two_lists = {
			   "rsp":{
			      "stat":"ok",
			      "tasks":{
			         "list": [{
					 	"id": "11122940",
						"taskseries": {
							"id": "55630580",
							"created": "2009-11-20T21:11:26Z",
							"modified": "2009-11-20T21:11:26Z",
							"name": "NS - test the list number 1",
							"source": "js",
							"url": "",
							"location_id": "",
							"tags": [],
							"participants": [],
							"notes": [],
							"task": {
								"id": "79648346",
								"due": "",
								"has_due_time": "0",
								"added": "2009-11-20T21:11:26Z",
								"completed": "",
								"deleted": "",
								"priority": "N",
								"postponed": "0",
								"estimate": ""
							}
						}},
					 	{
			            "id":"2637966",
			            "taskseries":[
			               {
			                  "id":"52954009",
			                  "created":"2009-10-22T20:49:48Z",
			                  "modified":"2009-10-22T20:49:48Z",
			                  "name":"O2 - Expect deposit credited",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"75724449",
			                     "due":"2010-01-26T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-10-22T20:49:48Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"46489199",
			                  "created":"2009-08-06T08:42:04Z",
			                  "modified":"2009-09-03T13:43:00Z",
			                  "name":"MB - Plans for Richard Pope?",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"66459582",
			                     "due":"2010-01-08T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-08-06T08:42:04Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"6",
			                     "estimate":""
			                  }
		           		   } // Close taskseries
	                  	] // Close array of taskseries
		           	 } // Close that list
		          ] // Close all lists
		       } // Close tasks object
	        } // Close rsp
		  }; // remote_json_with_two_lists


		},

		setUpRemoteJSONWithOverdueTasks: function() {
			this.remote_json_with_overdue_tasks = {
			   "rsp":{
			      "stat":"ok",
			      "tasks":{
			         "list": [{
					 	"id": "11122940",
						"taskseries": {
							"id": "55630580",
							"created": "2009-11-20T21:11:26Z",
							"modified": "2009-11-20T21:11:26Z",
							"name": "Do something with no due date",
							"source": "js",
							"url": "",
							"location_id": "",
							"tags": [],
							"participants": [],
							"notes": [],
							"task": {
								"id": "79648346",
								"due": "",
								"has_due_time": "0",
								"added": "2009-11-20T21:11:26Z",
								"completed": "",
								"deleted": "",
								"priority": "N",
								"postponed": "0",
								"estimate": ""
							}
						}},
					 	{
			            "id":"2637966",
			            "taskseries":[
			               {
			                  "id":"52954009",
			                  "created":"2009-10-22T20:49:48Z",
			                  "modified":"2009-10-22T20:49:48Z",
			                  "name":"Do something that's overdue",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"75724449",
			                     "due":"2008-01-26T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-10-22T20:49:48Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"0",
			                     "estimate":""
			                  }
			               },
			               {
			                  "id":"12345678",
			                  "created":"2009-08-06T08:42:04Z",
			                  "modified":"2009-09-03T13:43:00Z",
			                  "name":"Do something today",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"11223344",
			                     "due":"2009-12-01T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-08-06T08:42:04Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"6",
			                     "estimate":""
			                  }
		           		   },
			               {
			                  "id":"46489199",
			                  "created":"2009-08-06T08:42:04Z",
			                  "modified":"2009-09-03T13:43:00Z",
			                  "name":"Do something in the future",
			                  "source":"js",
			                  "url":"",
			                  "location_id":"",
			                  "tags":[
			
			                  ],
			                  "participants":[
			
			                  ],
			                  "notes":[
			
			                  ],
			                  "task":{
			                     "id":"66459582",
			                     "due":"2010-01-08T00:00:00Z",
			                     "has_due_time":"0",
			                     "added":"2009-08-06T08:42:04Z",
			                     "completed":"",
			                     "deleted":"",
			                     "priority":"N",
			                     "postponed":"6",
			                     "estimate":""
			                  }
		           		   } // Close taskseries
	                  	] // Close array of taskseries
		           	 } // Close that list
		          ] // Close all lists
		       } // Close tasks object
	        } // Close rsp
		  }; // remote_json_with_two_lists


		}

	});

} );