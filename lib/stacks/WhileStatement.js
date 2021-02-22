const Stack = require("../Stack");
const Utils = require("../Utils");
class WhileStatement extends Stack{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isWhileStatement= true;
          this.condition = Utils.createStack(compilation,node.test,scope,node,this);
          this.body = Utils.createStack(compilation,node.body,scope,node,this);
     }

     parser(syntax){
          this.condition.parser(syntax);
          this.body && this.body.parser(syntax);
     }

     check(){
          if( !this.condition ){
               this.throwError("Missing condition");
          }
          const desc = this.condition.description();
          if( desc.isLiteral ){
             const has = this.body.body.some( item=>item.isReturnStatement || item.isBreakStatement);
             if( !has ){
                this.condition.throwWarn(`The absence of an exit statement in the body of a while statement may result in an infinite loop`)
             }
          }
     }
}

module.exports = WhileStatement;