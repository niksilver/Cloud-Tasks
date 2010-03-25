// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

Date.prototype.toISOString = function() {
	return this.getUTCFullYear()
		+ "-" + ("0" + (this.getUTCMonth() + 1)).substr(-2, 2)
		+ "-" + ("0" + this.getUTCDate()).substr(-2, 2)
		+ "T" + ("0" + this.getUTCHours()).substr(-2, 2)
		+ ":" + ("0" + this.getUTCMinutes()).substr(-2, 2)
		+ ":" + ("0" + this.getUTCSeconds()).substr(-2, 2)
		+ "Z";
}
