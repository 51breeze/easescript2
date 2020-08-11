class Description 
{
    constructor(kind=null,key=null,type=null)
    {
        this.kind = kind;
        this.key  = key;
        this.type = type;
        this.static = false;
        this.modifier = null;
        this.annotations =null;
        this.metatypes = null;
        this.params = {};
    }
}

module.exports = Description;