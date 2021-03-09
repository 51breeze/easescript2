const Utils = require("../Utils");
const Expression = require("./Expression");
class AwaitExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          node.name = "await";
          super(compilation,node,scope,parentNode,parentStack);
          this.isAwaitExpression= true;
          this.argument = Utils.createStack( compilation, node.argument, scope, node, this );
          if( parentStack ){
             parentStack.isAwaitExpression = true;
          }
          let parent = parentStack;
          while(parent && !parent.isFunctionExpression){
               if( parent.isSwitchStatement ){
                    parent.awaitChildrenNum++;
               }
               parent.scope.hasChildAwait = true;
               parent.hasAwait=true;
               parent = parent.parentStack;
          }
     }
     check(){
          const stack = this.getParentStackByName("FunctionExpression");
          if(!stack.async){
              this.throwError(`'await' expressions are only allowed within async function`);
          }
     }
     description(){
          return this.argument.description();
     }
     type(){
          return this.argument.type();
     }
     parser(grammar){
          this.check()
          this.argument.parser(grammar);
     }
}

module.exports = AwaitExpression;