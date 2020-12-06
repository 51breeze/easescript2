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

        const init = this.parentStack.init;
        const initValue = this.parentStack.init.emit(syntax);
        const is = init.node.type==="ArrayExpression";
        const elements = this.elements.map( (item,index)=>{
            const name = item.value();
            const desc = this.scope.define( name );
            const defaultValue = Utils.isStackByName(item,"AssignmentPattern") ? item.right.emit(syntax) :  null;
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
                   return syntax.makeAssignmentExpression(this.scope,name,syntax.makeComputeValue( value.emit(syntax), Utils.isStackByName(value,"Literal") ? null:defaultValue ));
                }else{
                   desc.assignment(item.right);
                   return syntax.makeAssignmentExpression(this.scope,name,defaultValue);
                }
            }else{
                return syntax.makeAssignmentExpression(this.scope, name, syntax.makeComputeValue(syntax.makeArrayPropertyValue(initValue,index), defaultValue ) );
            }
        });
        return elements;
    }
}

module.exports = ArrayPattern;