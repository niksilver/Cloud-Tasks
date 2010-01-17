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
		}

	});

} );