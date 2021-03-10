const Utils = require("../Utils");
const Expression = require("./Expression");
class LogicalExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isLogicalExpression= true;
          this.left = Utils.createStack( compilation, node.left, scope, node,this );
          this.right = Utils.createStack( compilation, node.right, scope, node,this );
     }
     definition(){
          return null;
     }
     description(){
          return this;
     }
     type(){
          return this.compilation.getType("Boolean");
     }
     parser(grammar){
          this.left.parser(grammar);
          this.right.parser(grammar);
     }
}
module.exports = LogicalExpression;