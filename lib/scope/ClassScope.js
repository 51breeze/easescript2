const Scope = require("../Scope");
module.exports = class ClassScope extends Scope {

    constructor( parentScope, isStatic )
    {
        super(parentScope);
        if( !isStatic )
        {
           this.define("this");
        }
        this.isStatic = isStatic;
    }

    type( name )
    {
        return name === "class";
    }
} 