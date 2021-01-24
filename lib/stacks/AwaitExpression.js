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
          if(!stack.async){
              this.throwError(`'await' expressions are only allowed within async function`);
          }
          return `return [4,${this.argument.emit(syntax)}];\r\n case ${++stack.awaitCount}:\r\n${stack.generatorVarName()}.sent();`;
     }
}

module.exports = AwaitExpression;