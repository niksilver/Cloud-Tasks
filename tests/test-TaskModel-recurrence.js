// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testUpdateSetsHasRRuleFlag: function() {
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
			
			task = new TaskModel({ rrule: {userText: 'Every day', confirmation: 'no'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when unconfirmed userText set");
			
			task = new TaskModel({ rrule: {every: undefined, '$t': undefined, userText: 'Every day', confirmation: 'no'} });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly when unconfirmed userText set and undefined every/$t");
			
			task = new TaskModel({ rrule: {every: '0', '$t': 'something', userText: '', confirmation: 'no'} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when empty unconfirmed userText set but some every/$t");
			
			task = new TaskModel({ rrule: {userText: '', confirmation: 'no'} });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when unconfirmed userText empty");
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
		
		testSetRecurrenceUserTextForPush: function() {
			var task = new TaskModel();
			task.setRecurrenceUserTextForPush('');
			Y.Assert.areEqual('', task.rrule.userText, "rrule.userText not set correctly");
			Y.Assert.areEqual('rrule', task.localChanges[0], "rrule not marked to be pushed");
			Y.Assert.areEqual('no', task.rrule.confirmation, "rrule userText should be marked not confirmed");
		}

	});

} );