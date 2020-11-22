const Stack = require("../Stack");
const Utils = require("../Utils");
class AssignmentPattern extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
    }

    get description()
    {
        const desc = this.scope.define( this.left.value() );
        if( !desc )
        {
            this.compilation.error(`"${this.left.raw()}" is not defined.`, this.node);
        }
        return desc.description;
    }

    parser( syntax )
    {
        this.left.parser();
        this.right.parser();
        const desc = this.scope.define( this.left.value() );
        if( !desc )
        {
            this.compilation.error(`"${this.left.raw()}" is not defined.`, this.node);
        }
        desc.assignment = this.right;
    }

    value( syntax )
    {
        return `${this.left.value()}=${this.right.value()}`;
    }

    emit( syntax )
    {
        return `${this.left.emit(syntax)}=${this.right.emit(syntax)}`;
    }
}

module.exports = AssignmentPattern;