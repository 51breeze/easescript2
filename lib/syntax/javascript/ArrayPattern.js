const Syntax = require("./Syntax");
class ArrayPattern extends Syntax {

    computeValue(value,defaultValue){
        if( !defaultValue ) {
            return value;
        }
        return `${value} || ${defaultValue}`;
    }

    getSpreadRefName(target,expression){
        const desc = target.description(this);
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression)){
            if( target.__spreadRefName ){
                return target.__spreadRefName;
            }
            const block = target.getParentStackByName("BlockStatement");
            const refName =  this.scope.generateVarName(`_c`);
            const option = this.getSyntaxOption();
            if( option.target === "es5"  ){
                block.dispatcher("insert",this.semicolon(`var ${refName} = ${expression}`));
            }else{
                block.dispatcher("insert",this.semicolon(`const ${refName} = ${expression}`));
            }
            target.__spreadRefName = refName;
            return refName;
        }
        return expression;
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
                const obj = init.isIdentifier ? initValue : this.getSpreadRefName(init, initValue);
                const right = this.computeValue( `${obj}[${index}]`, defaultValue )
                return `${name}=${right}`;
            }
        });
        return elements;
    }
}

module.exports = ArrayPattern;