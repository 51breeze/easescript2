const Description = require("./Description");
class Module extends Description {

    constructor( compliler )
    {
        super();
        this.compliler=compliler;
        this.ast = null;
        this.grammar=null;
    }
}

module.exports = Module;