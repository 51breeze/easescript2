const Description = require("./Description");
class PropertyDescription extends Description
{
    constructor(declar,isStatic=false,modifier="public")
    {
        super(declar.key,declar.kind);
        this.declar = declar;
        this.static = isStatic;
        this.modifier = modifier;
    }
}

module.exports = PropertyDescription;