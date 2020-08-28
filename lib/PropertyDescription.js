const Description = require("./Description");
class PropertyDescription extends Description
{
    constructor(key, kind=null,acceptType=null,isStatic=false,modifier="public")
    {
        super(key,kind);
        this.acceptType = acceptType;
        this.static = isStatic;
        this.modifier = modifier;
    }
}

module.exports = PropertyDescription;