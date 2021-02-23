package
{
    declarator String implements Iterator
    {
       constructor( value );
       get length():uint;
       substr(start:int=0, end:int=-1):String;
    }
}