const Stack = require("../Stack");
const Utils = require("../Utils");
class AssignmentPattern extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.acceptType = Utils.createStack( compilation, node.left.acceptType, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
        this.assignValue = this.right;
        scope.define( this.left.value(), this.right );
    }

    description()
    {
        return this.acceptType || this.assignValue;
    }

    type(){
        const value = this.description();
        return value ? value.type() : null;
    }

    value(){
        return this.left.value();
    }

    parser( syntax )
    {
        this.left.parser(syntax);
        this.right.parser(syntax);
        const acceptType = this.left.type();
        if( acceptType && !acceptType.is( this.right.type() ) )
        {
            this.compilation.error(`"${this.left.raw()}" is not defined.`, this.node);
        }
    }

    assignment( value )
    {   
        const acceptType = this.left.type();
        if( acceptType && !acceptType.is( value.type() ) )
        {
            this.compilation.error(`"${this.left.raw()}" type not match of assign value.`, this.node);

        }else if( this.assignValue && this.assignValue.type().is( value.type() ) )
        {
            this.compilation.error(`"${this.left.raw()}" type not match of assign value.`, this.node);
        }

        this.assignValue = value;
    }

    emit( syntax ){
        return `${this.left.emit(syntax)}=${this.right.emit(syntax)}`;
    }
}

module.exports = AssignmentPattern;