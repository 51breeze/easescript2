const Scope = require("../Scope.js");
module.exports = class FunctionScope extends Scope {

    constructor( parentScope, isStatic, isArrow )
    {
        super(parentScope);
        this.isStatic = isStatic;
        this.arguments={};
        this.returnType = "any";
        this.returnTypeItems = [];
        this.key = null;
        this.isArrow = isArrow;
        this.thisRefName = null;
    }

    type( name )
    {
        return name === "function";
    }

    createThisRef()
    {
        if( !this.thisRefName )
        {
            this.thisRefName = "_$this";
            return true;
        }
        return false;
    }

    getThisRef()
    {
        return  this.thisRefName || "this";
    }
} 