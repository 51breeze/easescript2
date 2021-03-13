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
        this.assignItems.add( this.right );
        scope.define( this.left.value(), this );
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.value();
        const context = this;
        if( this.parentStack.isFunctionExpression ){
            return super.definition();
        }
        return {
            kind:this.kind,
            identifier:identifier,
            expre:`${this.kind} ${identifier}:${type}`,
            location:this.left.getLocation(),
            file:this.compilation.module.file,
            context
        };
    }
    value(){
        return this.left.value();
    }

    check(){
        this.acceptType && this.acceptType.check();
        const acceptType = this.acceptType ? this.acceptType.type() : null;
        const isFn = this.parentStack.isFunctionExpression;
        const rType = this.right.type();
        const isNullable = rType && isFn && rType.isType && !rType.isModule && rType.id ==="Nullable";
        if( acceptType && !isNullable && !acceptType.check( this.right ) ){
            const initValue = this.right.reference();
            if( acceptType.isTupleType && initValue.isArrayExpression ){
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

    parser( grammar ){
        this.left.parser(grammar);
        this.right.parser(grammar);
    }
}

module.exports = AssignmentPattern;