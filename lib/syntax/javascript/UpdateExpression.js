const Stack = require("../Stack");
const Utils = require("../Utils");
const Expression = require("./Expression");
class UpdateExpression extends Expression {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isUpdateExpression= true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }

    description(){
        return this;
    }

    parser(syntax){
        return this.argument.parser(syntax);
    }

    type(){
        return this.argument.type();
    }

    emit(syntax){
        const argument = this.argument.emit(syntax);
        const operator = this.node.operator;
        const prefix = this.node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
    }
}

module.exports = UpdateExpression;