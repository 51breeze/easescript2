const Stack = require("../Stack");
const Utils = require("../Utils");
class ForOfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isForOfStatement= true;
        this.left  = Utils.createStack(compilation,node.left,scope,node,this);
        this.right = Utils.createStack(compilation,node.right,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
    }

    parser(syntax){
        this.left.parser(syntax);
        this.right.parser(syntax);
        this.body && this.body.parser(syntax);
    }

    emit(syntax){
        const left = this.left.emit(syntax);
        const right = this.right.emit(syntax);
        const body = this.body ? this.body.emit(syntax) : null;
        return syntax.makeForOfStatement(this.scope,left,right,body);
    }
}

module.exports = ForOfStatement;