const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class Expression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
    }

    reference(){
        const description = this.description();
        if( description !== this && description instanceof Stack ){
            return description.reference();
        }
        return description;
    }
}

module.exports = Expression;