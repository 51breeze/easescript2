const Stack = require("../Stack");
const Utils = require("../Utils");
const Expression = require("./Expression");
class BinaryExpression extends Expression{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.left = Utils.createStack( compilation, node.left, scope, node,this );
          this.right = Utils.createStack( compilation, node.right, scope, node,this );
     }

     reference(){
          return this;
     }

     description(){
          return this;
     }

     type(){
          return this.compilation.getType("Boolean");
     }

     parser( syntax ){

          if( super.parser(syntax) === false ){
               return false;
          }
         
          this.left.parser(syntax);
          this.right.parser(syntax);
          const operator = this.node.operator;
          if( operator ==="instanceof" || operator ==="is" ){
               const left = this.left.reference();
               if( left ){
                    const check = (stack)=>{
                         return Utils.isStackByName(stack,"Literal") || Utils.isStackByName(stack,"TypeDefinition") || this.compilation.getTypeWhenExist(stack.value());
                    };
                    if(Array.isArray(left) && left.some( item=>check(item) ) ){
                         if( references.length===1 ){
                              this.throwError(`"${this.left.value()}" reference is not instance object cannot ${operator} operator`)
                         }else{
                              this.throwWarn(`"${this.left.value()}" reference may is not instance object cannot ${operator} operator`)   
                         }
                    }else if( check(left) ){
                         this.throwError(`"${this.left.value()}" reference is not instance object cannot ${operator} operator`);
                    }
               }
               const right = this.right.reference();
               if( right ){
                    if(Array.isArray(right) && right.some( item=>!( !Utils.isStackByName(item,"Literal") && this.compilation.getType(item.value()) ) ) ){
                         this.throwError(`"${operator}" operator right-hand expression is not class type`);
                    }else if( right instanceof Stack && !(!Utils.isStackByName(right,"Literal") && this.compilation.getType( right.value() ) ) ){
                         this.throwError(`"${operator}" operator right-hand expression is not class type`);
                    }
               }
          }
     }

     emit( syntax ){
          const left = this.left.emit(syntax);
          const right = this.right.emit(syntax);
          const operator = this.node.operator;
          return syntax.makeBinaryExpression(left,right,operator);
     }
}

module.exports = BinaryExpression;