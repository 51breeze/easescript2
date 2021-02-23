const Stack = require("../Stack");
const Utils = require("../Utils");
class ForInStatement extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isForInStatement= true;
        this.left  = Utils.createStack(compilation,node.left,scope,node,this);
        this.right = Utils.createStack(compilation,node.right,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
   }
   parser( syntax ){
      this.left.parser(syntax);
      this.right.parser(syntax);
      this.body && this.body.parser(syntax);
   }
//    check(){
//       const desc = this.right.description();
//       const type = desc.type();
//       if( !type.isAny ){
//           this.right.reference()
//           if( type.is( iterator ) )return;
//           this.right.throwError(`the reference value of '${this.right.raw()}' is not an iterable object.`);
//       }
//       const checkItems = new Set();
//       const getCheckItems = (desc)=>{
//           if( !desc )return [];
//           let items = [];
//           if( desc.isDeclarator || desc.isPropertyDefinition){
//               if( desc.acceptType && !desc.acceptType.type().isAny ){
//                   checkItems.add( desc.acceptType.type() )
//               }else{
//                   items = Array.from(desc.assignItems);
//               }
//           }else if( desc.isMethodDefinition || desc.isFunctionDeclaration ){
//               if( desc.returnType && !desc.returnType.type().isAny ){
//                    checkItems.add( desc.returnType.type() )
//               }else{
//                   items = desc.scope.returnItems.map( item=>item.argument );
//                   if( desc.isMethodGetterDefinition ){
//                       const name = desc.key.value()
//                       const setter = this.compilation.module.getMember(name , "set");
//                       if( setter ){
//                           items = items.concat( Array.from(setter.assignItems) );
//                       }
//                   }
//               }
//           }else{
//               items.push( desc );
//           }
//           items.forEach( item=>{
//               if(item.isArrayExpression || item.isLiteral || item.isObjectExpression || item.isModule){
//                   if( item.isModule ){
//                       checkItems.add( item );
//                   }else{
//                       checkItems.add( item.type() );
//                   }
//               }else{
//                   const desc = item.description();
//                   if( item !== desc){
//                       getCheckItems( desc );
//                   }
//               }
//           });
//       }
//       getCheckItems( desc );
//       const result =  Array.from(checkItems).every( type=>{
//           return type.is( iterator );
//       });
//       if( !result ){
//           this.right.throwWarn(`the reference value of '${this.right.raw()}' may not be an iterable object.`);
//       }
//   }
}

module.exports = ForInStatement;