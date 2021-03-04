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

    getSpreadRefName( target, expression){
        const desc = target.description(this);
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression)){
            if( target.__spreadRefName ){
                return target.__spreadRefName;
            }
            const block = target.getParentStackByName("BlockStatement");
            const refName =  this.scope.generateVarName(`_b`);
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

    emit(syntax){
        if( this.stack.parentStack.isObjectPattern ){
            const target = this.parentStack.parentStack.init;
            const name = this.stack.value();
            const value = this.stack.hasAssignmentPattern ? this.stack.init.right.emit(syntax) : null;
            if( target.isObjectExpression || target.isArrayExpression){
                const init = target.attribute( name );
                return this.assignmentExpression( name, this.computeValue( init.init.emit(syntax), init.init.isLiteral ? null : value ) );
            }else{
                const obj = target.isIdentifier ? target.emit(syntax) : this.getSpreadRefName(target, target.emit(syntax) );
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