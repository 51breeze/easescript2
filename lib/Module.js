const Type = require("./Type");
class Module extends Type{

    constructor( compliler )
    {
        super(null,null);
        this.compliler=compliler;
        this.compilation=null;
        this.ast = null;
        this.grammar=null;
        this.file = "";
        this.source = "";
        this.static = false;
        this.abstract = false;
        this.namespace = null;
        this.modifier = "public";
        this.implements=[];
        this.methods={};
        this.members={};
        this.annotations =[];
        this.metatypes = [];
        this.making = false;
        this.dependence=new Map();
        this.callable = null;
    }

    is( type )
    {
        if( !type )return false;
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

    publish()
    {
        const alias = this.metatypes.find( item=>item.name==="Alias" );
        if( alias ){
            const metatype = {};
            alias.params.forEach( item=>{
                const name  = item.value ? item.name : "name";
                const value = item.value ? item.value : item.name;
                metatype[ name ] = value;
            });
            this.alias = metatype.name;
            this.namespace.set(metatype.name, this);
            if( Boolean(metatype.origin) !== false ){
               this.namespace.set(this.id, this);
            }
        }else{
            this.namespace.set(this.id, this);
        }
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
            if(name ==="constructor" || name==this.id){
               this.methodConstructor =  desc;
            }else{
               this.members[ name ] = desc;
            }
        }
    }
}

module.exports = Module;