const Utils = require("../Utils");
const Stack = require("../Stack");
class VariableDeclaration extends Stack {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isVariableDeclaration= true;
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack(compilation,item, scope, node,this);
        });
        this.kind = node.kind;
        this.flag = false;
        switch( parentNode && parentNode.type ){
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                this.flag=true;
            break;    
        }
    }
    definition(){
        return null;
    }
    reference(){
        return this.declarations[0].reference();
    }
    referenceItems(){
        return this.declarations[0].referenceItems();
    }
    value(){
        return this.declarations[0].value();
    }
    raw(){
        return this.declarations[0].raw();
    }
    throwWarn(message){
        this.declarations[0].throwWarn(message);
    }
    throwError(message){
        this.declarations[0].throwError(message);
    }
    parser(grammar){ 
        this.declarations.forEach( item=>item.parser(grammar) );
    }
}

module.exports = VariableDeclaration;