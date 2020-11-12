class MemberExpression{

   constructor(node,scope,parentNode,object,property)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.object = object;
        this.property = property;
   }

   parser(){

      if( this.object instanceof MemberExpression ){
         return this.object.parser().concat( this.property.parser() );
      }
      return [this.object.parser(),this.property.parser()];
   }

   raw(){
       return [this.object.raw(), this.property.raw()].join(".");
   }

   emit(){
      return this.raw();
   }
}

module.exports = MemberExpression;