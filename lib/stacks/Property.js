const Stack = require("../Stack");
const Utils = require("../Utils");
class Property extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.key = Utils.createStack( compilation, node.key,scope, node,this );
        this.acceptType = Utils.createStack( compilation, node.acceptType,scope, node,this );
        this.init = Utils.createStack( compilation, node.value,scope, node,this );
        this.assignValue = this.init;
        this._kind = node.kind;
        this.hasAssignmentPattern = false;
        if( Utils.isStackByName(this.init,"AssignmentPattern") ){
            this.hasAssignmentPattern = true;
            this.init.acceptType = this.acceptType;
        }
    }

    set kind( value ){
        if( this.hasAssignmentPattern ){
            this.init.kind = value;
        }else{
            this._kind = value;
        }
    }

    get kind(){
        if( this.hasAssignmentPattern ){
            return this.init.kind;
        }else{
            return this._kind;
        }
    }

    value(){
        return this.key.value();
    }

    reference(){
        if( this.hasAssignmentPattern ){
            return this.init.reference();
        }
        return this.assignValue ? this.assignValue.reference() : null;
    }

    assignment(value){
        if( Utils.isStackByName(this.parentStack,"ObjectPattern")){
            if( this.hasAssignmentPattern ){
                this.init.assignment(value);
            }else{
                const acceptType = this.acceptType ? this.acceptType.type() : null;
                if( acceptType && !acceptType.check( value ) ){
                    this.throwError(`'${this.value()}' of type ${acceptType.toString()} is not assignable to assignment of type ${value.type().toString()}`);
                }else if( this.assignValue && !this.assignValue.type().check( value ) ){
                    this.throwError(`'${this.value()}' of type ${acceptType.toString()} is not assignable to assignment of type ${value.type().toString()}`);
                }
                this.assignValue = value;
            }
        }else{
            this.assignValue = value;
        }
    }

    type(){
        if( this.acceptType ){
            return this.acceptType.type();
        }
        if( Utils.isStackByName(this.parentStack,"ObjectPattern") && !this.hasAssignmentPattern ){
            return this.compilation.getType("any");
        }
        return this.assignValue.type();
    }

    description(){
        return this.assignValue.description();
    }

    parser(syntax)
    {
        this.key.parser(syntax);
        this.acceptType && this.acceptType.parser(syntax);
        this.init.parser(syntax);
    }

    check(){
        this.key.check();
        this.acceptType && this.acceptType.check();
        this.init.check();
    }

    throwError(message){
        this.key.throwError(message)
    }
    throwWarn(message){
        this.key.throwWarn(message)
    }

    emit(syntax){
        this.check();
        if( this.parentNode.type ==="ObjectPattern" ){
            const target = this.parentStack.parentStack.init;
            const name = this.value();
            const value = this.hasAssignmentPattern ? this.init.right.emit(syntax) :  null;
            const desc  = this.scope.define( name );
            if( !desc ){
                this.throwError(`"${name}" is not defined.`);
            }
            if( Utils.isStackByName(target,"ObjectExpression") ){
                const init = target.attribute( name );
                if( !init ){
                    this.throwError(`"${name}" is not defined.`);
                }
                desc.assignment( init );
                return syntax.makeAssignmentExpression(this.scope, name, syntax.makeComputeValue( init.init.emit(syntax), Utils.isStackByName(init.init,"Literal") ? null:value ) );
            }else{
                let obj = '';
                if( Utils.isStackByName(target,"Identifier") ){
                    obj = target.emit(syntax);
                    const type = target.type(); 
                    if( !type.is( this.compilation.getType("Object") ) ){
                        target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                    }
                    const refer = target.reference();
                    if( refer && Utils.isStackByName(refer,"ObjectExpression") ){
                        if( !refer.attribute( name ) ){
                            if( !Utils.isStackByName(this.init,"AssignmentPattern") ){
                                this.throwWarn(`"${name}" is not exists. in the "${target.raw()}" reference expression`);
                            }
                        }else{ 
                            desc.assignment( refer.attribute( name ) );
                        }
                    }
                }else{
                    obj = target.getSpreadRefName(syntax);
                    if( Utils.isStackByName(target,"MemberExpression") ){
                        const desc = target.description();
                        if( !desc.isAccessor && desc.isMethod ){
                            target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                        }
                    }
                    if( !target.type().is( this.compilation.getType("Object") ) ){
                        target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                    }
                    const refer = target.reference();
                    if( refer && refer instanceof Array ){
                        const result = refer.find( stack=>{
                            const refer = stack.reference();
                            if( Utils.isStackByName(refer,"ObjectExpression") ){
                                return refer.attribute( name );
                            }
                        });
                        if( !result ){
                            if( !Utils.isStackByName(this.init,"AssignmentPattern") ){
                                this.throwWarn(`"${name}" is not exists. in the "${target.raw()}" reference expression`);
                            }
                        }else{ 
                            desc.assignment( result.attribute( name ) );
                        }
                    }
                }
                return syntax.makeAssignmentExpression(this.scope, name, syntax.makeComputeValue( syntax.makeObjectPropertyValue(obj,name), value ) );
            }
        }else{
            return syntax.makeObjectKeyValue( this.key.value(), this.init.emit(syntax) );
        }
    }
}

module.exports = Property;