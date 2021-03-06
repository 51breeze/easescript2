const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class ArrayPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isArrayPattern=true;
        this.elements = node.elements.map( item=>{
            let stack = null;
            if(item.type ==="Identifier"){
               stack = new Declarator(compilation, item, scope, node,this);
               scope.define( stack.value(), stack );
            }else{
               stack = Utils.createStack( compilation, item, scope, node,this);
            }
            return stack;
        });
    }
    definition(){
        return null;
    }

    setKind(value){
        this.elements.forEach( item=>{
            item.kind=value;
        });
    }

    check(){
        const init = this.parentStack.init;
        const is = init.isArrayExpression;
        const refs = init.reference();
        if( !refs.isArrayExpression ){
            init.throwError(`"${init.raw()}" reference to the spread expression must be an Array.`);
        }
        this.elements.forEach( (item,index)=>{
            const name = item.value();
            const desc = this.scope.define( name );
            const defaultValue = item.isAssignmentPattern ? true : false;
            if( !desc ){
                this.throwError(`"${name}" is not defined.`);
            }
            if( is ){
                const value = init.attribute( index );
                if(!defaultValue && !value ){
                    this.throwError(`"${index}" is not defined.`);
                }
                if( value ){
                   desc.assignment(value);
                }else{
                   desc.assignment(item.right);
                }
            }else{
                const value = refs.attribute( index );
                if( value ){
                    desc.assignment(value);
                }else if(item.right){
                    desc.assignment(item.right);
                }
            }
        });
    }

    value(){
       return this.elements.map(item=>item.value()).join(",")
    }
}

module.exports = ArrayPattern;