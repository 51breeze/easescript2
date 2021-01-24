const Scope = require("../Scope.js");
module.exports = class ClassScope extends Scope {
    constructor( parentScope, isStatic ){
        super(parentScope);
        this.isStatic = isStatic;
    }
    type( name ){
        return name === "class";
    }
} 