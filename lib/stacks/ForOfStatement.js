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
    check(){
        const desc = this.right.description();
        var type = desc.type();
        if( type.isAny ){
            const ref = desc.reference();
            if( ref instanceof Stack ){
                type = ref.type();
            }
        }
        if( !type.isAny && !type.isDeclarator && type.isModule ){
            this.right.throwError(`'${this.right.raw()}' is not iterable object.`);
        }
    }
}

module.exports = ForOfStatement;