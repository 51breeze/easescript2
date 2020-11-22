const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( item=>{
            return Utils.createStack( compilation,item, scope, node,this);
        });
    }

    description(){
        return this.elements;
    }

    parser( syntax ){
        this.elements.forEach( item=>item.parser(syntax) );
    }

    emit( syntax ){
        const elements = this.elements.map( item=>item.emit(syntax) )
        return elements.join(",");
    }
}

module.exports = ArrayPattern;