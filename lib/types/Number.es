package
{
    declarator Number 
    {
        const MAX_VALUE:number = 1.79E+308;
        const MIN_VALUE:number = 5e-324;
        const MAX_SAFE_INTEGER:number = 9007199254740991;
        const MIN_SAFE_INTEGER:number = -9007199254740991;
        const POSITIVE_INFINITY:number = Infinity;
        const EPSILON:number = 2.220446049250313e-16;

        static isFinite( value:any ):boolean;
        static isInteger( value:any ):boolean;
        static isNaN( value:any ):boolean;
        static isSafeInteger( value:any ):boolean;
        static parseFloat( value:any ):number;
        static parseInt( value:any ):number;

        constructor( value:any );
        Callable( value:any ):number;
    }
}