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
     description(){
          return this.argument.description();
     }
     type(){
          return this.argument.type();
     }
     check(){
          this.argument.check();
     }
     parser(syntax){
          this.argument.parser(syntax);
     }
}

module.exports = AwaitExpression;