const Stack = require("../Stack");
const Utils = require("../Utils");
class DoWhileStatement extends Stack{
   constructor(compilation,node,scope,parentNode,parentStack){
      super(compilation,node,scope,parentNode,parentStack);
      this.isDoWhileStatement= true;
      this.condition = Utils.createStack(compilation,node.test,scope,node,this);
      this.body = Utils.createStack(compilation,node.body,scope,node,this);
   }

   parser(syntax){
      if( !this.condition ){
         this.throwError("Missing condition");
      }
      this.condition.parser(syntax);
      this.body.parser(syntax);
   }
}

module.exports = DoWhileStatement;