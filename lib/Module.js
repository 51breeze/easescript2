const Type = require("./Type");
const path = require("path");
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
        this.imports=new Map();
        this.callable = null;
        this.isModule = true;
    }

    checkClassName( className ){
        const info = path.parse( this.file );
        return info && info.name === className;
    }

    getName(){
        if( this.namespace ){
           return [this.namespace.identifier,this.id].join(".")
        }
        return this.id;
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

    getMethod( name, kind=null){
        const target = Object.prototype.hasOwnProperty.call(this.methods,name) ? this.methods[name] : null;
        if( target && target.isAccessor ){
            return kind =="set" ? target.set : target.get;
        }
        return target;
    }

    getMember( name, kind=null){
        let members = this.members;
        let inherit  = this;
        while( !Object.prototype.hasOwnProperty.call(members,name) ){
            if( inherit.extends[0] && inherit.members){
                inherit = inherit.extends[0];
                members = inherit.members;
            }else{
                inherit = this.compilation.getType("Object");
                members = inherit.members;
                break;
            }
        }
        let target = members && Object.prototype.hasOwnProperty.call(members,name) ? members[name] : null;
        if( target && target.isAccessor ){
            return kind =="set" ? target.set : target.get;
        }
        return target;
    }

    addDepend(name,value){
        this.dependence.set(name, value);
    }

    getDepend(name){
        return this.dependence.get(name);
    }

    addMember(name, desc){
        if(name ==="constructor" || name==this.id){
            this.methodConstructor =  desc;
        }else{
            const target = desc.static ? this.methods : this.members;
            if( desc.kind ==="get" || desc.kind ==="set" ){
                const obj = Object.prototype.hasOwnProperty.call(target,name) ? target[ name ] : (target[ name ]={isAccessor:true});
                obj[ desc.kind ] = desc;
            }else{
                target[ name ] = desc;
            }
        }
    }

    addImport(name, module){
        this.imports.set(name, module);
    }

    getImport(name){
        return this.imports.get(name);
    }
}

module.exports = Module;