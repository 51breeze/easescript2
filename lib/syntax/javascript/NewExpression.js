const Utils = require("../Utils");
const Expression = require("./Expression");
const Stack = require("../Stack");
class NewExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isNewExpression= true;
        this.callee = Utils.createStack( compilation, node.callee, scope, node,this );
        this.arguments = node.arguments.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
    }

    description(){
        return this.callee.description();
    }

    type(){
        const description = this.description();
        return description instanceof Stack ? description.type() : description;
    }

    parser(syntax){
        this.callee.parser(syntax);
        this.arguments.forEach( item=>item.parser(syntax) );
    }

    emit(syntax){
        const callee= this.callee.emit(syntax);
        const args= this.arguments.map( item=>item.emit(syntax) ).join(",");
        return `new ${callee}(${args})`;
    }
}

module.exports = NewExpression;