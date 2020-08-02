const Scope = require("../Scope");
module.exports = class FunctionScope extends Scope {

    constructor( parentScope, isStatic )
    {
        super(parentScope);
        this.isStatic = isStatic;
        this.arguments={};
        this.returnType = "any";
        this.returnTypeItems = [];
        this.key = null;
    }

    type( name )
    {
        return name === "function";
    }

    set thisRef(value)
    {
        this.thisRefName = value;
    }

    get thisRef()
    {
        return  this.thisRefName || "this";
    }
} 