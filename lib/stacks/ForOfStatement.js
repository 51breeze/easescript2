const Stack = require("../Stack");
const Utils = require("../Utils");
class ForOfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isForOfStatement= true;
        this.left  = Utils.createStack(compilation,node.left,scope,node,this);
        this.right = Utils.createStack(compilation,node.right,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
    }
    parser(syntax){
        this.left.parser(syntax);
        this.right.parser(syntax);
        this.body && this.body.parser(syntax);
    }
    check(){
        const desc = this.right.description();
        const type = desc.type();
        if( type.isAny && desc.acceptType){
            return;
        }
        if( type.id ==="Array" || type.id ==="String"){
            return;
        }
        // const checkItems = new Set();
        // const getCheckItems = (desc)=>{
        //     if( !desc )return [];
        //     let items = null;
        //     if( desc.isDeclarator ){
        //         items = desc.assignItems;
        //     }else if( desc.isMethodGetterDefinition ){
        //         const name = desc.key.value()
        //         const setter = this.compilation.module.getMember(name , "set");
        //         items = desc.scope.returnItems.map( item=>item.argument );
        //         if( setter ){
        //             items = items.concat( setter.assignItems );
        //         }
        //     }else if( desc.isMethodDefinition || desc.isFunctionDeclaration ){
        //         items = desc.scope.returnItems.map( item=>item.argument );
        //     }
        //     if( items ){
        //         items.forEach( item=>{
        //             if( item.isArrayExpression || item.isLiteral ){
        //                 checkItems.add( item );
        //             }else{
        //                 const desc = item.description();
        //                 if( item !== desc){
        //                     getCheckItems( desc );
        //                 }
        //             }
        //         });
        //     }
        // }
        // getCheckItems( desc );
        // const result = [...checkItems].every( desc=>{
        //     const type = desc.type();
        //     return type.id === "Array" || type.id ==="String";
        // });
        // if( !result || checkItems.size === 0 ){
            this.right.throwError(`the '${this.right.raw()}' reference value is not an iterable object.`);
        //}
    }
}

module.exports = ForOfStatement;