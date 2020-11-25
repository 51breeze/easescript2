const Stack = require("../Stack");
const Utils = require("../Utils");
class AssignmentExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
    }

    description(){
        return this.scope.define( this.left.value() );
    }

    type(){
        const desc = this.description();
        return desc ? desc.type() : null;
    }

    parser( syntax ){
        this.left.parser(syntax);
        this.right.parser(syntax);
        const desc = this.description();
        if( !desc ){
            this.compilation.error(`"${this.left.raw()}" is not defined.`, this.node);
        }
        desc.assignment( this.right );
    }

    emit( syntax ){
        return syntax.makeAssignmentExpression(this.scope,this.left.emit(syntax),this.right.emit(syntax))
    }
}

module.exports = AssignmentExpression;