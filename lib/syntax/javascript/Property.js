const Syntax = require("./Syntax");
class Property extends Syntax{

    computeValue(value,defaultValue){
        if( !defaultValue ) {
            return value;
        }
        return `${value} || ${defaultValue}`;
    }

    assignmentExpression(left,right){
        return `${left}=${right}`;
    }

    getSpreadRefName( target, syntax ){
        if( this.__spreadRefName ){
            return this.__spreadRefName;
        }
        const desc = target.description();
        const expression = target.emit(syntax);
        if( desc && desc.isMethodGetterDefinition ){
           const block = target.getParentStackByName("BlockStatement");
           const refName =  this.scope.generateVarName(`$${target.property.value()}`);
           block.dispatcher("insert", this.semicolon(`var ${refName} = ${expression}`) );
           this.__spreadRefName = refName;
           return refName;
        }
        return expression;
    }

    emit(syntax){
        if( this.stack.parentStack.isObjectPattern ){
            const target = this.parentStack.parentStack.init;
            const name = this.stack.value();
            const value = this.stack.hasAssignmentPattern ? this.stack.init.right.emit(syntax) : null;
            if( target.isObjectExpression || target.isArrayExpression){
                const init = target.attribute( name );
                return this.assignmentExpression( name, this.computeValue( init.init.emit(syntax), init.init.isLiteral ? null : value ) );
            }else{
                const obj = target.isIdentifier ? target.emit(syntax) : this.getSpreadRefName(target, syntax);
                return this.assignmentExpression(name, this.computeValue(`${obj}["${name}"]`,value) );
            }
        }else{
            const key = this.stack.key.value();
            const value = this.stack.init.emit(syntax);
            return `"${key}":${value}`;
        }
    }
}

module.exports = Property;