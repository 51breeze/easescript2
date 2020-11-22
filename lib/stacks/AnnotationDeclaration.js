const Stack = require("../Stack");
const Utils = require("../Utils");
class AnnotationDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(compilation,node,scope,parentNode,parentStack);
   }

   description(){
      if( this._description )
      {
         return this._description;
      }
      const name = this.node.name;
      const params = [];
      node.body.forEach((item)=>{
          const name = item.name;
          const value = item.value ? item.value.raw || item.value.name : null;
          params.push({name,value});
      });
      this._description ={name,params};
      return this._description;
   }

}

module.exports = AnnotationDeclaration;