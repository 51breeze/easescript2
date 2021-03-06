package
{
    declarator Array implements Iterator
    {
       static public from(target:Iterator,callback:Function=null):Array;
       static public isArray(target:any):Boolean;
       public constructor(...elements);
       public concat(...elements):Array;
       public copyWithin(target:int, start:int=0, end:int=-1):Array;
       public entries():Iterator;
       public every(callback:Function,thisArg=null):Boolean;
       public fill(value:any,start:int=0, end:int=-1):Array;
       public filter(callback:Function=null):Array;
       public find(callback:Function, thisArg=null):any;
       public findIndex(callback:Function, thisArg=null):int;
       public flatMap(callback:Function,thisArg=null):Array;
       public forEach(callback:Function,thisArg=null):void;
       public includes(value:any,fromIndex=0):Boolean;
       public indexOf(value:any):int;
       public join(separator:String=""):String;
       public keys():Iterator;
       public lastIndexOf(value):any;
       public map(callback:Function,thisArg=null):Array;
       public pop():any;
       /**
        * Appends new elements to the end of an array, and returns the new length of the array.
        * @param items New elements to add to the array.
        */
       public push( items ):uint;
       public reduce(callback:Function,initialValue=null):any;
       public reduceRight(callback:Function,initialValue=null):any;
       public reverse():Array;
       public shift():any;
       public slice(start:int=0,end:int=-1):Array;
       public some(callback:Function,thisArg=null):Boolean;
       public sort(callback:Function=null):Array;
       public splice(start:int,length:int,element:any):Array;
       public unshift(value):int;
    }
}