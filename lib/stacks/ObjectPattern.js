const Stack = require("../Stack");
const Utils = require("../Utils");
class ObjectPattern extends Stack {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isObjectPattern= true;
        this.properties = node.properties.map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this);
            scope.define( stack.key.value(), stack );
            return stack;
        });
    }
    definition(){
        return null;
    }
    setKind(value){
        this.properties.forEach( item=>{
            item.kind=value;
        });
    }
    parser(syntax){ 
        this.properties.forEach( item=>item.parser(syntax) );
    }
    value(){
        return this.properties.map( item=> {
            return item.value();
        }).join(",");
    }
}

module.exports = ObjectPattern;