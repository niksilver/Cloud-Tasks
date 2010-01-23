// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testUpdateSetsHasRRuleFlags: function() {
			var task;
			
			task = new TaskModel({ name: 'Do something once' });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly to false");
			
			task = new TaskModel({ rrule: {every: '0', '$t': 'something'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly to true");
			
			task = new TaskModel({ rrule: '' });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when empty");
			
			task = new TaskModel({ rrule: undefined });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when undefined");
			
			task = new TaskModel({ rrule: {every: '1', '$t': ''} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when 1/empty");
			
			task = new TaskModel({ rrule: {every: '0', '$t': ''} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when 0/empty");
			
			task = new TaskModel({ rrule: {every: '', '$t': ''} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when empty/empty");
			
			task = new TaskModel({ rrule: {every: undefined, '$t': undefined} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when undefined/undefined");
			
			task = new TaskModel({ rrule: {every: '', '$t': 'something'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when empty/contentful");
			
			task = new TaskModel({ rrule: {every: '', '$t': '0'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when empty/0");
			
			task = new TaskModel({ rrule: {every: 0, '$t': 0} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when 0/0");
			
			task = new TaskModel({ rrule: {every: '0', '$t': 'something'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when 0/contentful");
			
			task = new TaskModel({ rrule: {userText: 'Every day'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when unconfirmed userText set");
			Y.Assert.areEqual(false, task.hasRRuleProblemFlag, "hasRRuleProblem property not set correctly when unconfirmed userText set");
			
			task = new TaskModel({ rrule: {userText: 'Every day', problem: true} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when confirmed problematic userText set");
			Y.Assert.areEqual(true, task.hasRRuleProblemFlag, "hasRRuleProblem property not set correctly when confirmed problematic userText set");
			
			task = new TaskModel({ rrule: {every: undefined, '$t': undefined, userText: 'Every day', problem: false} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when okay userText set and undefined every/$t");
			
			task = new TaskModel({ rrule: {every: '0', '$t': 'something', userText: '', problem: false} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when empty okay userText set but some every/$t");
			
			task = new TaskModel({ rrule: {userText: '', problem: false} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when okay userText empty");
		},
		
		testGetRecurrenceDisplayTextForNoRecurrence: function() {
			var task;
			
			task = new TaskModel(); // No recurrence
			Y.Assert.areEqual('No recurrence', task.getRecurrenceDisplayText(), "undefined rrule gives wrong display text");

			task = new TaskModel({ rrule: {userText: ''} });
			Y.Assert.areEqual('No recurrence', task.getRecurrenceDisplayText(), "Empty userText in rrule gives wrong display text");
		},
		
		testGetRecurrenceDisplayTextForSomeRecurrence: function() {
			task = new TaskModel({
				"rrule": {
                	"every":"1",
                	"$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
                 }
			});
			Y.Assert.areEqual('Recurring', task.getRecurrenceDisplayText(), "Some non-empty rrule gives wrong display text");
		},
		
		testGetRecurrenceEditTextForNoRecurrence: function() {
			var task;
			
			task = new TaskModel(); // No recurrence
			Y.Assert.areEqual('', task.getRecurrenceEditText(), "undefined rrule gives wrong edit text");

			task = new TaskModel({ rrule: {userText: ''} });
			Y.Assert.areEqual('', task.getRecurrenceEditText(), "Empty userText in rrule gives wrong edit text");
		},
		
		testGetRecurrenceEditTextForSomeRecurrence: function() {
			task = new TaskModel({
				"rrule": {
                	"every":"1",
                	"$t":"FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
                 }
			});
			Y.Assert.areEqual('To be defined!', task.getRecurrenceEditText(), "Some non-empty rrule gives wrong edit text");
		},
		
		testSetRecurrenceUserTextForPush: function() {
			var task = new TaskModel({rrule: {problem: true}}); // Pretend there was a problem before
			task.setRecurrenceUserTextForPush('');
			Y.Assert.areEqual('', task.rrule.userText, "rrule.userText not set correctly");
			Y.Assert.areEqual('rrule', task.localChanges[0], "rrule not marked to be pushed");
			Y.Assert.areEqual(false, task.rrule.problem, "rrule userText should be marked with no problem");
		},
		
		testHandleRRuleResponseBasicCase: function() {
			var task = new TaskModel({ rrule: { userText: 'Every 2nd Wednesday' }});
			var rrule_response = {"every":"1","$t":"FREQ=WEEKLY;INTERVAL=2;BYDAY=WE"};
			task.handleRRuleResponse(rrule_response);
			
			Y.Assert.areEqual('1', task.rrule.every, "Didn't set rrule.every");
			Y.Assert.areEqual("FREQ=WEEKLY;INTERVAL=2;BYDAY=WE", task.rrule['$t'], "Didn't set rrule['$t']");
			Y.Assert.areEqual('Every 2nd Wednesday', task.rrule.userText, "Didn't preserve rrule.userText");
			Y.Assert.areEqual(false, !!task.rrule.problem, "Shouldn't be a problem");
		},
		
		testHandleRRuleResponseDealsWithNoInitialRRule: function() {
			
			// No initial rrule and a detailed response
			
			var task = new TaskModel(); // RRule property not set
			var rrule_response = {"every":"1","$t":"FREQ=WEEKLY;INTERVAL=2;BYDAY=WE"};
			task.handleRRuleResponse(rrule_response);
			
			Y.Assert.areEqual('1', task.rrule.every, "Didn't set rrule.every");
			Y.Assert.areEqual("FREQ=WEEKLY;INTERVAL=2;BYDAY=WE", task.rrule['$t'], "Didn't set rrule['$t']");
			Y.Assert.areEqual(false, !!task.rrule.problem, "Shouldn't be a problem");
			
			// No initial rrule and an undefined response (indicating no rrule)
			
			task = new TaskModel(); // RRule property not set
			task.handleRRuleResponse(undefined);
			
			Y.Assert.isUndefined(task.rrule, "Should be no rrule");
		},
		
		testHandleRRuleResponseDealsWithUndefinedInput: function() {
			
			// No rrule and no defined input, which should all be okay
			
			var task = new TaskModel();
			task.handleRRuleResponse(); // No rrule response defined here
			
			Y.Assert.isUndefined(task.rrule, "RRule should not be defined");
			
			// An rrule set up but no defined input, indicating a problem parsing
			
			task = new TaskModel({ rrule: { userText: 'Every 2nd Wednesday' }});
			task.handleRRuleResponse();
			
			Y.Assert.areEqual('Every 2nd Wednesday', task.rrule.userText, "Didn't preserve userText");
			Y.Assert.areEqual(true, task.rrule.problem, "Problem not identified");
		},
		
		testTakeLocalChangesPicksUpLocalRRuleData: function() {
			var task1 = new TaskModel({
				name: 'Write report',
				rrule: { every: '0', '$t': 'FREQ=WEEKLY;INTERVAL=2' }
			});
			var task2_with_changes = new TaskModel({
				rrule: { userText: 'Every wrongday', problem: true }
			});
			
			task1.takeLocalChanges(task2_with_changes);
			Y.Assert.areEqual(-1, task1.localChanges.indexOf('rrule'), "Task 1: Changes in rrule wrongly marked");
			Y.Assert.areEqual('0', task1.rrule.every, "Task 1: Didn't retain rrule.every");
			Y.Assert.areEqual('FREQ=WEEKLY;INTERVAL=2', task1.rrule['$t'], "Task 1: Didn't retain rrule['$t']");
			Y.Assert.areEqual('Every wrongday', task1.rrule.userText, "Task 1: Didn't take rrule.userText");
			Y.Assert.areEqual(true, task1.rrule.problem, "Task 1: Didn't take rrule.problem");
			
			var task3 = new TaskModel({
				name: 'Write report',
				rrule: { every: '0', '$t': 'FREQ=WEEKLY;INTERVAL=2' }
			});
			var task4 = new TaskModel({
				rrule: {}
			});
			task3.takeLocalChanges(task4);
			var property_present = {};
			for (prop in task3.rrule) {
				property_present[prop] = true;
			}
			Y.Assert.areEqual(true, property_present['every'], "Task 3: rrule.every not present");
			Y.Assert.areEqual(true, property_present['$t'], "Task 3: rrule['$t'] not present");
			Y.Assert.isUndefined(property_present['userText'], "Task 3: rrule.userText is present");
			Y.Assert.isUndefined(property_present['problem'], "Task 3: rrule.problem is present");
			
			var task5 = new TaskModel({
				name: 'Write report'
				// No rrule
			});
			var task6 = new TaskModel({
				rrule: { userText: 'Every day' }
			});
			task5.takeLocalChanges(task6);
			property_present = {};
			for (prop in task5.rrule) {
				property_present[prop] = true;
			}
			Y.Assert.isUndefined(property_present['every'], "Task 5: rrule.every is present");
			Y.Assert.isUndefined(property_present['$t'], "Task 5: rrule['$t'] is present");
			Y.Assert.areEqual(true, property_present['userText'], "Task 5: rrule.userText not present");
			Y.Assert.isUndefined(property_present['problem'], "Task 5: rrule.problem is present");
		}

	});

} );