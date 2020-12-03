const Utils = require("../Utils");
const Declarator = require("./Declarator");
class AssignmentPattern extends Declarator{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
        this.acceptType = this.left.acceptType;
        this.assignValue = this.right;
        scope.define( this.left.value(), this );
    }
    
    value(){
        return this.left.value();
    }

    parser( syntax ){
        super.parser(syntax);
        this.left.parser(syntax);
        this.right.parser(syntax);
        const acceptType = this.acceptType ? this.acceptType.type() : null;
        if( acceptType && !acceptType.is( this.right.type() ) )
        {
            this.compilation.error(`"${this.left.raw()}" type not match. give a ${this.right.type().id}`, this.node);
        }
    }
    
    emit( syntax ){
        return syntax.makeAssignmentExpression(this.scope,this.left.emit(syntax),this.right.emit(syntax));
    }
}

module.exports = AssignmentPattern;