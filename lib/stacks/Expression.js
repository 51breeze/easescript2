const Stack = require("../Stack");
class Expression extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
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