const Utils = require("../Utils");
const Expression = require("./Expression");
class AwaitExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.argument = Utils.createStack( compilation, node.argument, scope, node, this );
          this.isAwaitExpression= true;
          if( parentStack ){
             parentStack.isAwaitExpression = true;
          }
          let parent = parentStack;
          while(parent && !parent.isFunctionExpression){
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
     emit(syntax){
          const stack = this.getParentStackByName("FunctionExpression");
          return `return [4,${this.argument.emit(syntax)}];\r\n case ${++stack.awaitCount}:\r\n`;
     }
}

module.exports = AwaitExpression;