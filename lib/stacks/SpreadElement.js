const Stack = require("../Stack");
const Utils = require("../Utils");
class SpreadElement  extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }

    get description()
    {
        return this.argument.description;
    }

    get key()
    {
        return this.argument;
    }

    parser()
    {
        this.argument.parser();
    }

    value()
    {
        return this.argument.value();
    }

    emit()
    {
        return this.argument.emit();
    }
}

module.exports = SpreadElement;