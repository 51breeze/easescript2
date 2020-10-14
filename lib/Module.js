const Type = require("./Type");
class Module extends Type{

    constructor( compliler )
    {
        super(null,null);
        this.compliler=compliler;
        this.ast = null;
        this.grammar=null;
        this.file = "";
        this.source = "";
        this.static = false;
        this.abstract = false;
        this.namespace = null;
        this.modifier = "public";
        this.implements=[];
        this.constructor = null;
        this.methods={};
        this.members={};
        this.annotations =[];
        this.metatypes = [];
        this.making = false;
        this.dependence=new Map();
    }

    is( type )
    {
        if( super.is( type ) )
        {
           return true;
        }

        const check = ( inherits )=>{
            if( inherits )
            {
                for(var parent of inherits)
                {
                    const typename = typeof parent ==="string" ?  parent : parent.id;
                    if( type.id === typename )
                    {
                        return true;
                    }
                    if( parent instanceof Module && check( parent.implements ) )
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        return check( this.implements );
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
        if( name === this.id || name ==="constructor")
        {
            return this.constructor;
        }
        return this.members.hasOwnProperty( name ) ? this.members[name] : null;
    }

    addDepend(name,value)
    {
        this.dependence.set(name, value);
    }

    getDepend(name)
    {
        return this.dependence.get(name);
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