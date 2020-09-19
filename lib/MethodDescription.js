const Description = require("./Description");
class MethodDescription extends Description
{
    constructor(key, kind=null,returnType=null,isStatic=false,modifier="public",params=null)
    {
        super(key,kind);
        this.returnType = returnType;
        this.static = isStatic;
        this.modifier = modifier;
        this.params = params;
        this.value = null;
    }
}

module.exports = MethodDescription;