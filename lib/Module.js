class Module {

    constructor( compliler )
    {
        this.compliler=compliler;
        this.ast = null;
        this.grammar=null;
    }
}

module.exports = Module;