const Declarator = require("./Declarator.js");
class Enum extends Declarator
{
    constructor(node, id, value, inhiert)
    {
        super(node,id,"const",value,"Object");
        this.inhiert= inhiert;
    }
}
module.exports = Enum;