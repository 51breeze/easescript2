package test
{

    import test.com.TestInterface;
    import test.Person;

    public class Test<U> extends Person
    {

        public var name123:string="dfdsfsd";

        public static const age:int=50

        static fc():Class
        {
            var dd:Class = Test;
            return dd;
        }

        static get uuName():string{

           
            return '';
        }

        private static var iiu:Class = Test;

        constructor<T>( name:string="div" ):Test
        {

            
            
            let ir=0,br=9;
            if(ir=5,br=6){

                ir = 6;

            }

            


           var uiii = 4^6 , btts = 9 | 2

            var hhhh = 9

               this.method("",1).substr();

               Test.fc().uuName;

               Test.fc().uuName.substr( 5 );

              this.name = "1";

              var ccc:[number,string] = [2,''];

              Test.iiu.uuName;

              this.name =  Test.fc().uuName;


             this instanceof Test;

               this is TestInterface;


              var iiss:string = true as string;

            // var iiiii:number = this.name;
             // (string) ccc;





             ccc.push( 2 );

             ccc.push( '9999' );
             ccc.push( 1 );

            var bbpp:number|string = ccc.pop();

            bbpp = 'llll';


            function NaTest(name:string="5555", ...sss):int{
                return 666;
            }

            var nss = {
                name:5666,
                age:65
            }

            var {dd:string="456", age} = {
                name:5666,
                dd:"123",
                age:65
            };

            dd = "sfdfsd"

           

            var i = 5;

            const ppi = 5;

           //  console.log( i );
           

            when( Runtime(client) ){

               
                  var whenss = "ok";
                  i = 2;
                  var y000 = 999999;
            
                when( Syntax(php) ){

                    y000 = 877777777;
                    
                }then{
                    //var i = 5;
                }
            
            
             }then{
            
                 var y000 = 88888888888888888888;
                 
             }

            



             try{


             }catch(e:Error){

             }

            // this.method("", 1);

              i= 6;

             if( 1 ){
                  i = 5;
             }

             while( 1 ){

             }

             do{

             }while(1)

             switch( name ){

                 case "o" : 
                     console.log( 99999999999 );
                 break;

                 default :
                 // this.mmm();
                
             }

             for( var ii=0; ii<10; ++ii){
                console.log( i );
             }

             for( var names in this ){

             }

             for( var value of []){

             }


             var b=1;

             this.method < b ;

             var arr=[];

             var [bb:int,cc:int] = [1,2];

             var dsss:array = [...arr];

             var bbc={
                 bb:"uuu",
                 ii:666,
                 Red:1,
                 Green:4,
                // Blue:6
             }  


             var {Red:int = 1, Green = 2, Blue, } = bbc
             //this.method("",4);

            enum Color {
                Red = 1, Green = 2, Blue
            }
            
           // const arrs:Array< string, int, array<number,string> > = []; 

            

            var {ddss:string="456"} = {"ddss":dd};
            var [ddss999:string="456",ioo:int]= arr;

            ddss999 = 'ssss';

            var {ttts:string} = this.data;

          

            const ddc=(i:int,b:string="123"):int=>{

               
                
                return 5;

            };

            const ls:Class = test.Test;

           const cs=function(){

           };

           
           var btt = 555;
           var dds = /\s+/i;
           var $this = 666;

           var db = new Date(4,item=>{ this.method } );

           var ccv = (bb && btt);

           var ttt={
               ss:666,
               bb:{
                   "qq":"ooo",
                   db
               }
           }

           var ds = 2 || 3;


           Number.isNaN(1);
           Number(1).valueOf()

          console.log(  this.data  );
          this.ss(1, 5, "6");

          this.data;

            

        }


        [Runtime(client)]
        get data(){
            return {ttts:'1'};
        }


 

        [Runtime(client)]
        [Router(value ="/ss", method=post, param=4555,type=com.test.Test )]

         private async ss( ...types:[int,number, ...string ] ){

            const dd=(i:int,b:string="123"):int=>{
                console.log(i,b)
                if( 66 ){
                    console.log(i,b)
                     if( 66 ){
                        console.log(i,b) 
                        if( 66 ){
                            console.log(i,b)
                        }
                    }
                }
                return 5;
            };

            if( 1 ){
                console.log(111111111);
                 //await dd(111111);
                 console.log(111111);

                if( 2 ){
                      await dd(222222222);
                      console.log(2222222222);

                    if( 88888 ){
                      await dd(222222222);
                      console.log(2222222222);
                    }

                       

                }else{

                    console.log("=====222222222222222222222========")
                    //await dd(222222222);
                    if( 2222 ){
                      await dd(222222222333333333333333);
                      console.log(2222222222333333333333333);
                    }
                    console.log("=====222222222222222222222==99999======")

                }
                console.log("=====999999999999999====99999999999999999====")


                if(22){
                    console.log("====++++++++++++++++++2222======")
                }

                switch( 777 ){
                   case 777 :
                      await dd(77777777777777777777777777);
                      break;
                   case 88899 :
                      //await dd(777777777788999997777777777777777);
                      if( 8999 ){
                         // await dd(77777777999999999999999999997777777777777);
                      }else{
                            console.log("====444= 5555===");
                            if( 566){
                                 console.log("====444= 5555===");
                                 if( 566){
                                     console.log("====444= 5555===");
                                 }
                            }
                      }
                      console.log("====444====")
                      break;

                }
                 console.log("=====777777777=============77777777777777====")


            }
            else{
                 console.log("==3333333333==");
                   await dd(3333333333);
                   await dd(3333333333);
                 console.log(3333333333);
            }

            const data = {"name":123,ccc:666};

            return data;

        }


        
        @Router(default="/cc", ppp)
        override public method( name:string, age:int):any
        {
           // super.method(name, age );

            var str:string[] = ["a","1"];
            var b:[string, [string,int] ] = ["", ["1",1], "true" ];

            var cc:[number] = [1];


            var x:[number,int,string,...object] = [1,1,'2222',{}];

            b.push( '1' )

             b.push( ["===",666] )




            return "sssss";

  
            var c:string = "6666";

            // c:array<int>=[];

          
          var dd = { Red:1 };

            return dd;

        }


        override public get name():string{
       

            return "1";

        }

        override public set name( value:string ){

        }

       override avg<T extends string, B>(yy:T):void{

            var ii = ()=>1;

            var bb:[string] = ['1'];

            //   ii = <T>(name) => name;

            // <T>(name) => name;

         // ii();

            //ii = this.method;

              
            

            function name<T extends Person,B>( i:T ):T{

                var b:T = i;
                i.avg();
                i.method('',1);
                return b;

            }

           const person = new test.Person();

           //TestInterface


           // name<TestInterface,test.Person>( person ); 
            const bbb = name<TestInterface,string>( person ); 


           // name( "1" ); 


            //type T = {
                //name<T>():T
            //}


             const dd = this.map();
        

             var ccc:string = dd.name999('1', 999);


            
        }

        map(){
            const dd:object={
                name999<T>( b:T ):T{
                   return b;
                }
            }

            if( 1 ){
                return {};
            }

            return dd;
        }

        address():int[]{


            const dd:int[] = [];

            dd.push( 1 );

            return dd;

        }

    
 
    }
  
    
}
