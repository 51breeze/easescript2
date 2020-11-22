const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
    }

    description(){
        return this.elements;
    }

    type(){
        return compilation.getType("Array");
    }

    parser( syntax ){
        this.elements.forEach( item=>item.parser(syntax) );
    }

    emit( syntax ){ 
        return this.elements.map( item=>item.emit(syntax) );
    }
}

module.exports = ArrayExpression;