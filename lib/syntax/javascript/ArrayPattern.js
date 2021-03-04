const Syntax = require("./Syntax");
class ArrayPattern extends Syntax {

    computeValue(value,defaultValue){
        if( !defaultValue ) {
            return value;
        }
        return `${value} || ${defaultValue}`;
    }

    emit( syntax ){
        const init = this.stack.parentStack.init;
        const initValue = this.stack.parentStack.init.emit(syntax);
        const is = init.isArrayExpression;
        const elements = this.stack.elements.map( (item,index)=>{
            const name = item.value();
            const desc = this.scope.define( name );
            const defaultValue = item.isAssignmentPattern ? item.right.emit(syntax) :  null;
            if( !desc ){
                this.throwError(`'${name}' is not defined.`);
            }
            if( is ){
                const value = init.attribute( index );
                if(!defaultValue && !value ){
                    this.throwError(`'${index}' is not defined.`);
                }
                if( value ){
                   const right = this.computeValue( value.emit(syntax), value.isLiteral ? null : defaultValue );
                   return `${name}=${right}`;
                }else{
                   return `${name}=${defaultValue}`;
                }
            }else{
                const right = this.computeValue( `${initValue}[${index}]`, defaultValue )
                return `${name}=${right}`;
            }
        });
        return elements;
    }
}

module.exports = ArrayPattern;