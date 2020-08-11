
class Namespace {

    constructor( id )
    {
        this.modules = new Map();
        this.identifier = id;
    }

    addModule( name , value)
    {
        this.modules.set( name, value);
    }

    get( name )
    {
        return this.modules.get( name );
    }

    static fetch( id )
    {
       if( !id ) 
       {
           return Namespace.dataset;
       }
       const items = id.split(".");
       let key = null;
       let base = Namespace.dataset;
       let identifier = [];
       while( key = items.shift() )
       {
            identifier.push(key);
            const prop = "__"+key;
            base = base.hasOwnProperty(prop) ? base[prop] : base[prop]=new Namespace( identifier.join(".") );
       }
       return base;
    }
}

Namespace.dataset =new Namespace("");
module.exports = Namespace;