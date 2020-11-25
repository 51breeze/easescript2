const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this);
            if( item.type ==="Identifier"){
                
               scope.define( stack.value(), stack );
            }
            return stack;
        });
    }

    description(){
        return this.elements;
    }

    parser( syntax ){
        this.elements.forEach( item=>item.parser(syntax) );
    }

    emit( syntax ){
        const elements = this.elements.map( item=>{
            return item.emit(syntax)
        })
        return elements;
    }
}

module.exports = ArrayPattern;