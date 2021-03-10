const Utils = require("../Utils");
const Expression = require("./Expression");
class BinaryExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isBinaryExpression= true;
          this.left = Utils.createStack( compilation, node.left, scope, node,this );
          this.right = Utils.createStack( compilation, node.right, scope, node,this );
     }
     definition(){
          return null;
     }
     reference(){
          return this;
     }
     referenceItems(){
          return [this];
     }
     description(){
          return this;
     }
     type(){
          return this.compilation.getType("Boolean");
     }
     check(){
          const operator = this.node.operator;
          if( operator ==="instanceof" || operator ==="is" ){
               const leftRefs = this.left.referenceItems();
               if( !leftRefs || !(leftRefs.length > 0) ){
                    this.left.throwError(`the '${this.left.value()}' is not reference object.`)
               }
               if( !leftRefs.every( item=>Utils.isInstanceObject(item) ) ){
                    if( leftRefs.length===1 ){
                         this.left.throwError(`the '${this.left.value()}' reference is not instance object`)
                    }else{
                         this.left.throwWarn(`the '${this.left.value()}' reference may is not instance object`)   
                    }
               }
               const rightRefs = this.right.referenceItems();
               if( !rightRefs || !(rightRefs.length > 0) ){
                    this.right.throwError(`the '${operator}' operator right-hand expression no an reference.`)
               }
               if( !rightRefs.every( item=>Utils.isTypeModule(item) ) ){
                    if( rightRefs.length ===1 ){
                         this.right.throwError(`the '${operator}' operator right-hand expression type is not class or interface`);
                    }else{
                         this.right.throwWarn(`the '${operator}' operator right-hand expression type is not class or interface`);
                    }
               }
          }
     }
     parser( grammar ){
          this.check();
          this.left.parser(grammar);
          this.right.parser(grammar);
     }
}

module.exports = BinaryExpression;