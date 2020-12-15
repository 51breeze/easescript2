const Utils = require("../Utils");
const Expression = require("./Expression");
class AssignmentExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.left = Utils.createStack( compilation, node.left, scope, node ,this);
        this.right = Utils.createStack( compilation, node.right, scope, node ,this);
        if( this.left ){
           this.left.accessor = "set";
        }
    }

    description(){
        return this.left.description();
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
            this.throwError(`"${this.left.value()}" is not defined.`);
        }
        if( desc.kind ==="const"){
            this.throwError(`"${this.left.value()}" is not writable`);
        }   
        desc.assignment( this.right , this.left);
    }

    value(){
        return this.left.value();
    }

    raw(){
        return this.left.raw();
    }

    emit( syntax ){
        const desc = this.description();
        const left = this.left.emit(syntax);
        const right = this.right.emit(syntax);
        if( desc.kind ==="set"){
            return `${left}(${right})`;
        }
        return `${left}=${right}`;
    }
}

module.exports = AssignmentExpression;