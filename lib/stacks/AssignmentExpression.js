const Utils = require("../Utils");
const Expression = require("./Expression");
class AssignmentExpression extends Expression{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isAssignmentExpression=true;
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
        this.left.accessor = "set";
        if(this.left.isIdentifier && !scope.type("blank") && !scope.isDefine( this.left.value() ) ){
            this.throwError(`"${this.left.value()}" is not defined.`);
        }
    }
    description(){
        return this.left.description();
    }
    type(){
        const desc = this.description();
        return desc ? desc.type() : null;
    }
    check(){
        const desc = this.description();
        if( !desc ){
            this.throwError(`"${this.left.value()}" is not defined.`);
        }
        if( desc.kind ==="const"){
            this.throwError(`"${this.left.value()}" is not writable`);
        }   
        desc.assignment(this.right , this.left);
    }
    value(){
        return this.left.value();
    }
    raw(){
        return this.left.raw();
    }
}

module.exports = AssignmentExpression;