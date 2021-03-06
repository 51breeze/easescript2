const Stack = require("../Stack");
const Utils = require("../Utils");
const BlankScope = require("../scope/BlankScope");
class AnnotationDeclaration extends Stack{
   constructor(compilation,node,scope,parentNode,parentStack){
      scope = new BlankScope( null );
      super(compilation,node,scope,parentNode,parentStack);
      this.isAnnotationDeclaration=true;
      this.body = node.body.map( item=>{
         return Utils.createStack(compilation,item,scope,node,this);
      });
   }
   get name(){
      return this.node.name;
   }
   definition(){
      return null;
   }
   description(){
      const name = this.name;
      const target={};
      this.body.map( item=>{
            switch( name ){
               case "Callable" :
                  const name = item.left.value();
                  if( item.node.right.type ==="ArrayExpression" )
                  {
                        target[ name ]=item.right.elements;
                  }else{
                        target[ name ] = item.right;
                  }
                  return target;
            }
      });
      return target;
   }
   emit(){
      return '';
   }
}

module.exports = AnnotationDeclaration;