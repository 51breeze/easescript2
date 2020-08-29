namespace
{
    interface Object 
    {
       static public assign(target:Object,object:Object):Object;
       static public values( object:Object ):Iterator;
       static public keys( object:Object ):Iterator;

       public hasOwnProperty( prop:String ):Boolean;
       public propertyIsEnumerable( prop:String ):Boolean;
       public isPrototypeOf( object:Object ):Boolean;
       public toString():String;
       public valueOf():Any;
       public toLocaleString():String;
    }
}