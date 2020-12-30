package test.com
{
    public interface TestInterface {
        get name():string
        set name(val:string):void
        avg<T extends string,B>():void
        method( name:string, age:int):any
    }
}