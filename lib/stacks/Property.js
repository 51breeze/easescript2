const Stack = require("../Stack");
const Utils = require("../Utils");
const AssignmentPattern = require("./AssignmentPattern");
class Property extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.key = Utils.createStack( compilation, node.key,scope, node,this );
        this.acceptType = Utils.createStack( compilation, node.acceptType,scope, node,this );
        this.init = Utils.createStack( compilation, node.value,scope, node,this );
        this.assignValue = this.init;
        this._kind = node.kind;
        if( this.init instanceof AssignmentPattern ){
            this.init.acceptType = this.acceptType;
        }
    }

    set kind( value ){
        if( this.init instanceof AssignmentPattern ){
            this.init.kind = value;
        }else{
            this._kind = value;
        }
    }

    get kind(){
        if( this.init instanceof AssignmentPattern ){
            return this.init.kind;
        }else{
            return this._kind;
        }
    }

    value(){
        return this.key.value();
    }

    reference(){
        if( this.init instanceof AssignmentPattern ){
            return this.init.reference();
        }
        return this.assignValue ? this.assignValue.reference() : null;
    }

    assignment(value){
        if( Utils.isStackByName(this.parentStack,"ObjectPattern")){
            if( this.init instanceof AssignmentPattern ){
                this.init.assignment(value);
            }else{
                const acceptType = this.acceptType ? this.acceptType.type() : null;
                if( acceptType && !acceptType.is( value.type() ) ){
                    this.compilation.throwErrorLine(`At {code}\r\n "${this.raw()}" type not match of assign value.`, this.node);
                }else if( this.assignValue && !this.assignValue.type().is( value.type() ) ){
                    this.compilation.throwErrorLine(`At {code}\r\n "${this.raw()}" type not match of assign value.`, this.node);
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
        if( Utils.isStackByName(this.parentStack,"ObjectPattern") && !(this.init instanceof AssignmentPattern) ){
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

    emit(syntax)
    {
        if( this.parentNode.type ==="ObjectPattern" ){
            const target = this.parentStack.parentStack.init;
            const is = target.node.type==="ObjectExpression";
            const name = this.value();
            const value = this.init instanceof AssignmentPattern ? this.init.right.emit(syntax) :  null;
            const desc  = this.scope.define( name );
            if( !desc ){
                this.compilation.throwErrorLine(`At {code}\r\n "${name}" is not defined.`, this.node);
            }
            if( is ){
                const init = target.attribute( name );
                if( !init ){
                    this.compilation.throwErrorLine(`At {code}\r\n "${name}" is not defined.`, this.node);
                }
                desc.assignment( init );
                return `${name} = ${syntax.makeComputeValue( init.init.emit(syntax), Utils.isStackByName(init.init,"Literal") ? null:value )}`;
            }else{
                const target = this.parentStack.parentStack.init;
                const desc = target.description();
                if( desc ){
                    if( Utils.isStackByName(desc,"Declarator") ){
                        const type = desc.type();
                        const objType = this.compilation.getType("Object");
                        if( !type.is( objType ) ){
                             const refer = desc.reference();
                             if( refer ){

                             }
                        }
                    }else if( Utils.isStackByName(desc,"CallExpression")  ){

                    }
                }
                return `${name} = ${syntax.makeComputeValue( `${target.emit(syntax)}.${name}`, value )}`;
            }
        }else{
            return syntax.makeObjectKeyValue( this.key.emit(syntax), this.init.emit(syntax) );
        }
    }
}

module.exports = Property;