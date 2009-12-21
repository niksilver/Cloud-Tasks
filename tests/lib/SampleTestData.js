SampleTestData = {
	
	ajax_hello_world_response: {
		status: 200,
		responseJSON: {
			"rsp": {
				"stat": "ok",
				"api_key": "1234abcd",
				"format": "json",
				"method": "rtm.test.echo",
				"param1": "Hello",
				"param2": "World"
			}
		}
	},
	
	simple_good_response: {
		status: 200,
		responseJSON: {
			"rsp": {
				"stat": "ok",
				// Other data omitted
			}
		}
	},
	
	big_remote_json: {
	   "rsp":{
	      "stat":"ok",
	      "tasks":{
	         "list":
			 	// Might be an array of list objects, not just a single list object as here
			 	{
	            "id":"2637966",
	            "taskseries":[
	               {
	                  "id":"52954009", // Task 1
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
	                  "id":"46489199", // Task 2
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
	                  "id":"55274651", // Task 3
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
	                  "id":"54732974", // Task 4
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
	                  "id":"54961818", // Task 5
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
	                  "id":"30123455", // Task 6
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
	                  "id":"54750411", // Task 7
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
	                  "id":"46761347", // Task 8
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
	                  "id":"54961430", // Task 9
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
	                  "id":"38212211", // Task 10
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
	                  "id":"32135089", // Task 11
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
	                  "id":"41932927", // Task 12
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
	                  "id":"48560123", // Task 13
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
	                  "id":"27451945", // Task 14
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
	                  "id":"51963692", // Task 15
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
	                  "id":"54965930", // Task 16
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
	                  "id":"54937892", // Task 17
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
	                  "id":"27451972", // Task 18
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
	}, // big_remote_json

	remote_json_with_two_lists: {
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
  }, // remote_json_with_two_lists

	remote_json_with_overdue_tasks: {
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
  }, // remote_json_with_overdue_tasks
  
  last_sync_response: {
   "rsp":{
      "stat":"ok",
      "tasks":{
         "list":{
            "id":"11122940",
            "current":"2009-12-19T23:45:24Z",
            "taskseries":[
               {
                  "id":"58274353", // Task 1
                  "created":"2009-12-19T23:48:11Z",
                  "modified":"2009-12-19T23:48:11Z",
                  "name":"Sixth task",
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
                     "id":"83601522",
                     "due":"",
                     "has_due_time":"0",
                     "added":"2009-12-19T23:48:11Z",
                     "completed":"",
                     "deleted":"",
                     "priority":"N",
                     "postponed":"0",
                     "estimate":""
                  }
               }, // taskseries 58274353
               {
                  "id":"58274350", // Task 2
                  "created":"2009-12-19T23:48:07Z",
                  "modified":"2009-12-19T23:48:07Z",
                  "name":"Fifth task",
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
                     "id":"83601519",
                     "due":"",
                     "has_due_time":"0",
                     "added":"2009-12-19T23:48:07Z",
                     "completed":"",
                     "deleted":"",
                     "priority":"N",
                     "postponed":"0",
                     "estimate":""
                  }
               } // taskseries 58274350
            ], // Array of taskseries
            "deleted":{
               "taskseries":[
                  {
                     "id":"58274252", // Task 3, deleted
                     "task":{
                        "id":"83601413",
                        "deleted":"2009-12-19T23:48:18Z"
                     }
                  },
                  {
                     "id":"58274238", // Task 4, deleted
                     "task":{
                        "id":"83601399",
                        "deleted":"2009-12-19T23:48:14Z"
                     }
                  }
               ] // Array of deleted taskseries
            } // deleted
         } // list 11122940
      } // tasks
   } // rsp
  },// last_sync_response

  last_sync_response_with_just_one_deletion: {
	   "rsp":{
	      "stat":"ok",
	      "tasks":{
	         "list":{
	            "id":"11122940",
	            "deleted":{
	               "taskseries":{
	                  "id":"58274350",
	                  "task":{
	                     "id":"83601519",
	                     "deleted":"2009-12-20T22:21:19Z"
	                  }
	               }
	            }
	         }
	      }
	   }
	}, // last_sync_response_with_just_one_deletion

  last_sync_response_deleting_task_5: {
	   "rsp":{
	      "stat":"ok",
	      "tasks":{
	         "list":{
	            "id":"2637966",
	            "deleted":{
	               "taskseries":{
	                  "id":"54961818",
	                  "task":{
	                     "id":"78667188",
	                     "deleted":"2009-12-20T22:21:19Z"
	                  }
	               }
	            }
	         }
	      }
	   }
	} // last_sync_response_deleting_task_5

}		
