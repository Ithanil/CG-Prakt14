"use strict";

Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

Function.method('inherits', function (parent, child) {
	this.prototype = new parent();
	this.prototype.constructor = child;
	return this;
});

Function.method('swiss', function (parent) {
    for (var i = 1; i < arguments.length; i += 1) {
        var name = arguments[i];
        this.prototype[name] = parent.prototype[name];
    }
    return this;
});