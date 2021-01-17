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
          const stack = this.getParentStackByName("FunctionExpression");
          this.awaitLabelIndex = ++stack.awaitCount;
          this.generatorVarName = stack.generatorVarName();
          const block = this.getParentStackByName("BlockStatement");
          block.awaitItems.push(this);
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
         return `return [4,${this.argument.emit(syntax)}];\r\n case ${this.awaitLabelIndex}:\r\n${this.generatorVarName}.sent();`;
     }
}

module.exports = AwaitExpression;