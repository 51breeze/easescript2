class Declaration
{
    constructor(node, kind, declarations, isFor=false)
    {
        this.kind = kind;
        this.node = node;
        this.declarations= declarations;
        this.isFor = isFor;
    }
}
module.exports = Declaration;