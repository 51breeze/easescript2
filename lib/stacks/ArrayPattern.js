const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class ArrayPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( item=>{
            let stack = null;
            if( item.type ==="Identifier"){
               stack = new Declarator(compilation, item, scope, node,this);
               scope.define( stack.value(), stack );
            }else{
               stack = Utils.createStack( compilation, item, scope, node,this);
            }
            return stack;
        });
    }

    setKind(value){
        this.elements.forEach( item=>{
            item.kind=value;
        });
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