const Scope = require("../Scope.js");
module.exports = class BlockScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
    }

    type( name )
    {
        return name === "block";
    }

} 