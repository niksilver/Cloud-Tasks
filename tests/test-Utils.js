// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the MD5 function
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testClone: function() {
			Y.Assert.isUndefined(Utils.clone(undefined), "Didn't clone undefined correctly");
			
			Y.Assert.areEqual(2, Utils.clone(2), "Didn't clone 2 correctly");

			var str = 'hello';
			Y.Assert.areEqual('hello', Utils.clone(str), "Didn't clone string correctly");
			Y.Assert.areNotSame(str, Utils.clone(str), "String clone isn't actually a clone");
			
			Y.Assert.areEqual(true, Utils.clone(true), "Didn't clone true correctly");
			Y.Assert.areEqual(false, Utils.clone(false), "Didn't clone false correctly");
			
			var arr = ['aaa', 'bbb'];
			var arr_clone = Utils.clone(arr);
			Y.Assert.isArray(arr_clone, "Array's clone is not an array");
			Y.Assert.areNotSame(arr, arr_clone, "Array clone isn't actually a clone");
			Y.Assert.areEqual('aaa', arr_clone[0], "Item at index 0 not cloned correctly");
			Y.Assert.areEqual('bbb', arr_clone[1], "Item at index 1 not cloned correctly");
			
			var obj = { a: 'aaa', b: 'bbb' };
			var obj_clone = Utils.clone(obj);
			Y.Assert.isObject(obj_clone, "Object's clone is not an object");
			Y.Assert.areEqual('aaa', obj_clone.a, "Item with key 'a' not cloned correctly");
			Y.Assert.areEqual('bbb', obj_clone.b, "Item with key 'b' not cloned correctly");
		},
		
		testGet: function() {
			var obj = {a: {b: {c1: {d: 'val'}, c2: ''}}};
			
			Y.Assert.areEqual('val', Utils.get(obj, 'a', 'b', 'c1', 'd'), "Failed on a.b.c1.d");
			Y.Assert.areEqual('', Utils.get(obj, 'a', 'b', 'c2'), "Failed on a.b.c2");
			Y.Assert.isUndefined(Utils.get(obj, 'a', 'b', 'c1', 'd', 'e'), "Failed on a.b.c1.d.e");
			Y.Assert.areEqual(obj, Utils.get(obj), "Failed on identity");
		},
		
		testGetNextID: function() {
			var id1 = Utils.getNextID();
			var id2 = Utils.getNextID();
			var id3 = Utils.getNextID();
			Y.Assert.areEqual(id1+1, id2, "Consecutive IDs not generated 1, 2");
			Y.Assert.areEqual(id2+1, id3, "Consecutive IDs not generated 2, 3");
			
			Utils._eraseNextIDCookie();
			Y.Assert.areEqual(0, Utils.getNextID(), "First ID should be 0");
			Y.Assert.areEqual(1, Utils.getNextID(), "Second ID should be 1");
		}

	});

} );