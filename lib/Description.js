class Description {
    constructor()
    {
        this.id = null;
        this.static = false;
        this.abstract = false;
        this.namespace = null;
        this.modifier = "public";
        this.extends=[];
        this.implements=[];
        this.methods={};
        this.members={};
        this.annotations =[];
        this.metatypes = [];
        this.dependence=new Map();
    }

    addDepend(name,value)
    {
        this.dependence.set(name, value);
    }

    addMember(name, desc)
    {
        if( desc.isStatic )
        {
            this.methods[ name ] = desc;
        }else
        {
            this.members[ name ] = desc;
        }
    }
}

module.exports = Description;