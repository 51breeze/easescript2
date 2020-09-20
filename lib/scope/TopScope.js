const Scope = require("../Scope.js");
module.exports = class TopScope extends Scope {

    constructor( compilation )
    {
        super(null);
        this.compilation = compilation;
    }

    type( name )
    {
        return name === "top";
    }
} 