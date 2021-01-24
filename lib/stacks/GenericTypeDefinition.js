const Stack = require("../Stack");
const Utils = require("../Utils");
class GenericTypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isGenericTypeDefinition= true;
        this.isGenericType = true;
        this.elements = node.elements.map( item=>{
            const stack = Utils.createStack(compilation,item,scope,node,this);
            const fnScope = scope.getScopeByType("function");
            if( scope.isDefine( stack.value() ) ){
                const has = scope.define(stack.value());
                if( has.scope.getScopeByType("function") === fnScope){
                    stack.throwError(`"${stack.value()}" is already exists.`);
                }
            }
            scope.define(stack.value(), stack);
            return stack;
        });
    }

    description(){
        return this;
    }

    type(){
        return null;
    }

    parser(syntax){
        this.elements.forEach( item=>item.parser(syntax) );
    }

    value(){
        const elements = this.elements.map( item=>{
            return item.value()
        });
        return `<${elements.join(",")}>`;
    }

    raw(){
        return this.value();
    }

    emit(syntax){
        return this.value();
    }
}

module.exports = GenericTypeDefinition;