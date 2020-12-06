const Stack = require("../Stack");
class ModifierDeclaration extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
    }
}
module.exports = ModifierDeclaration;