/**
 * Test the stub code for Mojo.Depot.
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 100;

	return new Y.Test.Case({

		addSynchronously: function(depot, key, value, assert_failure_msg) {
			var depot_add_returned = false;
			depot.add(key, value,
				function() {
					depot_add_returned = true;
				},
				null
			);
			this.wait(
				function() {
					Y.assert(depot_add_returned, assert_failure_msg);
				},
				WAIT_TIMEOUT
			);
		},
		
		getSynchronously: function(depot, key, assert_failure_msg) {
			var depot_value;
			var depot_value_returned = false;
			depot.get(key,
				function(value) {
					depot_value_returned = true;
					depot_value = value;
				},
				null
			);
			
			this.wait(
				function() {
					Y.assert(depot_value_returned, assert_failure_msg);
				},
				WAIT_TIMEOUT
			);
			
			return depot_value;
		},
		
		_should: {
			error: {
				testStubDepotRejectsObjectsWithFunctions: "Stub depot will not save objects with functions"
			}
		},
		
		setUp: function() {
			Mojo.Depot.eraseAllDepots();
		},

		testDepotConstructor: function() {
			var depot = new Mojo.Depot({ name: 'test_db' });
			Y.Assert.isNotUndefined(depot, "Depot can't be constructed");
		},
		
		testDepotConstructsDifferentDatabases: function() {
			var depot1 = new Mojo.Depot({ name: 'dep1' });
			var depot2 = new Mojo.Depot({ name: 'dep2' });
			
			this.addSynchronously(depot1, 'mykey', 'value1', "Depot1 add didn't return");
			this.addSynchronously(depot2, 'mykey', 'value2', "Depot2 add didn't return");
			
			var depot1_value = this.getSynchronously(depot1, 'mykey', "Depot1 get didn't return");
			var depot2_value = this.getSynchronously(depot2, 'mykey', "Depot2 get didn't return");
			Y.Assert.areEqual(depot1_value, 'value1', "Got bad depot1 value");
			Y.Assert.areEqual(depot2_value, 'value2', "Got bad depot2 value");
		},
		
		testDepotCanHoldDifferentValues: function() {
			var depot = new Mojo.Depot({ name: 'mydep' });

			this.addSynchronously(depot, 'mykey1', 'value1', "Depot add #1 didn't return");
			this.addSynchronously(depot, 'mykey2', 'value2', "Depot add #2 didn't return");

			var depot_value1 = this.getSynchronously(depot, 'mykey1', "Depot get #1 didn't return");
			var depot_value2 = this.getSynchronously(depot, 'mykey2', "Depot get #2 didn't return");
			Y.Assert.areEqual(depot_value1, 'value1', "Got bad depot value1");
			Y.Assert.areEqual(depot_value2, 'value2', "Got bad depot value2");

		}
		
	})
});