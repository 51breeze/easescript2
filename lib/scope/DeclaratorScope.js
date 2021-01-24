const Scope = require("../Scope.js");
module.exports = class DeclaratorScope extends Scope {
    constructor( parentScope ){
        super(parentScope);
    }
    type( name ){
        return name === "declarator";
    }
} 