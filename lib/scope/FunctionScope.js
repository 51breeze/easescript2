const Scope = require("../Scope.js");
module.exports = class FunctionScope extends Scope {

    constructor( parentScope, isExpression, isArrow )
    {
        super(parentScope);
        this.arguments   = [];
        this.returnType  = null;
        this.returnItems = [];
        this.key         = null;
        this.isArrow     = !!isArrow;
        this.isExpression = !!isExpression;
        this.thisName = null;
    }

    type( name )
    {
        return name === "function";
    }

    createThisRef()
    {
        if( !this.thisName )
        {
            this.thisName = "_$this";
            return true;
        }
        return false;
    }

    getThisRef()
    {
        return  this.thisName || "this";
    }
} 