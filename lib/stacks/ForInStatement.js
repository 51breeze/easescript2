const Stack = require("../Stack");
const Utils = require("../Utils");
class ForInStatement extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isForInStatement= true;
        this.left  = Utils.createStack(compilation,node.left,scope,node,this);
        this.right = Utils.createStack(compilation,node.right,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
   }
   parser( syntax ){
      this.left.parser(syntax);
      this.right.parser(syntax);
      this.body && this.body.parser(syntax);
   }
}

module.exports = ForInStatement;