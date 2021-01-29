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
            const desc  = this.scope.define( name );
            if( !desc ){
                this.throwError(`"${name}" is not defined.`);
            }
            if( target.isObjectExpression ){
                const init = target.attribute( name );
                if( !init ){
                    this.throwError(`"${name}" is not defined.`);
                }
                desc.assignment( init );
                return this.assignmentExpression( name, this.computeValue( init.init.emit(syntax), init.init.isLiteral ? null : value ) );
            }else{
                let obj = '';
                if(target.isIdentifier){
                    obj = target.emit(syntax);
                    const type = target.type(); 
                    if( !type.is( this.stack.compilation.getType("Object") ) ){
                        target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                    }
                    const refer = target.reference();
                    if( refer && refer.isObjectExpression ){
                        if( !refer.attribute( name ) ){
                            if( !this.stack.init.isAssignmentPattern ){
                                this.throwWarn(`"${name}" is not exists. in the "${target.raw()}" reference expression`);
                            }
                        }else{ 
                            desc.assignment( refer.attribute( name ) );
                        }
                    }
                }else{
                    obj = this.getSpreadRefName(target, syntax);
                    if( target.isMemberExpression ){
                        const desc = target.description();
                        if( !desc.isAccessor && desc.isMethod ){
                            target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                        }
                    }
                    if( !target.type().is( this.stack.compilation.getType("Object") ) ){
                        target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                    }
                    const refer = target.reference();
                    if( refer && refer instanceof Array ){
                        const result = refer.find( stack=>{
                            const refer = stack.reference();
                            if( refer.isObjectExpression ){
                                return refer.attribute( name );
                            }
                        });
                        if( !result ){
                            if( !this.stack.init.isAssignmentPattern ){
                                this.throwWarn(`"${name}" is not exists. in the "${target.raw()}" reference expression`);
                            }
                        }else{ 
                            desc.assignment( result.attribute( name ) );
                        }
                    }
                }
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