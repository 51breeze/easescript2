class ClassDeclaration{

   constructor(node,scope,parentNode,id,inherit,implements,modifier,metatypes,annotations,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.id = id;
        this.inherit = inherit;
        this.implements = implements;
        this.modifier = modifier;
        this.metatypes = metatypes;
        this.annotations = annotations;
        this.body = body;
   }

   parser()
   {
      return this.body.parser();
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = ClassDeclaration;