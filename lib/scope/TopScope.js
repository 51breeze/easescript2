const Scope = require("../Scope.js");
module.exports = class TopScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
    }

    type( name )
    {
        return name === "top";
    }
} 