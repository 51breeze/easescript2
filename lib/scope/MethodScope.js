const Scope = require("../Scope.js");
module.exports = class MethodScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
    }

    type( name )
    {
        return name === "method";
    }
} 