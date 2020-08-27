class Module {

    constructor( compliler )
    {
        this.compliler=compliler;
        this.ast = null;
        this.grammar=null;
        this.id = null;
        this.file = "";
        this.source = "";
        this.static = false;
        this.abstract = false;
        this.namespace = null;
        this.modifier = "public";
        this.extends=[];
        this.implements=[];
        this.constructor = null;
        this.methods={};
        this.members={};
        this.annotations =[];
        this.metatypes = [];
        this.dependence=new Map();
    }

    setNamespace( id )
    {
       this.namespace = id;
    }

    getMethod( name )
    {
        return this.methods.hasOwnProperty( name ) ? this.methods[name] : null;
    }

    getMember( name )
    {
        return this.members.hasOwnProperty( name ) ? this.members[name] : null;
    }

    addDepend(name,value)
    {
        this.dependence.set(name, value);
    }

    addMember(name, desc)
    {
        if( desc.static )
        {
            this.methods[ name ] = desc;
        }else
        {
            this.members[ name ] = desc;
        }
    }
}

module.exports = Module;