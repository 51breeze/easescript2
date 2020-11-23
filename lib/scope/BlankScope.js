const Scope = require("../Scope.js");
module.exports = class BlankScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
    }

    type( name )
    {
        return name === "blank";
    }
} 