const Utils = require("../Utils");
const Declarator = require("./Declarator");
class AssignmentPattern extends Declarator{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isAssignmentPattern=true;
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
        this.acceptType = this.left.acceptType;
        this.assignValue = this.right;
        scope.define( this.left.value(), this );
    }
    
    value(){
        return this.left.value();
    }

    check(){
        const acceptType = this.acceptType ? this.acceptType.type() : null;
        if( acceptType && !acceptType.check( this.right ) ){
            const initValue = this.right.reference()
            if( acceptType instanceof TupleType && initValue.isArrayExpression ){
                const elements = initValue.elements.map( item=>item.type().toString() );
                this.throwError(`"${this.left.value()}" statement of type "${acceptType.toString()}" is not assignable to assignment of type "${elements.join(',')}" `);
            }else{
               this.throwError(`"${this.left.value()}" statement of type "${acceptType.toString()}" is not assignable to assignment of type "${this.right.type().toString()}" `);
            }
        }
    }
    throwError( message ){
        this.left.throwError(message);
    }

    throwWarn(message){
        this.left.throwWarn(message);
    }

    parser( syntax ){
        super.parser(syntax);
        this.left.parser(syntax);
        this.right.parser(syntax);
    }
}

module.exports = AssignmentPattern;