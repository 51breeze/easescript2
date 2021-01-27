const Syntax = require("./Syntax");
class FunctionExpression extends Syntax{
   emit(syntax){
       const body = this.stack.body.emit(syntax);
       const isSupport = false;
       const len = this.stack.params.length;
       const rest = len > 0 && this.stack.params[ len-1 ].isRestElement ?  this.stack.params[ len-1 ] : null;
       const paramItems = rest ? this.stack.params.slice(0,-1) : this.stack.params;
       const before = [];
       const params = paramItems.map( item=>{
           const expre = item.emit( syntax );
           if( isSupport ){
               return expre;
           }
           const name = item.value();
           if( item.right ){
               const defauleValue = item.right.emit(syntax);
               before.push( this.semicolon( `${name} = ${name} === void 0 ? ${defauleValue} : ${name}` ) );
           }
           return name;
       });
       //const returnType = this.stack.returnType ? this.stack.returnType.value(syntax) : null;
       const key = this.stack.key ? this.stack.key.value() : null;
       if( rest ){
            before.push( this.semicolon(`var ${rest.value()} = arguments.slice(${len-1})`) );
       }
       if( this.scope.arrowThisName && !this.scope.isArrow ){
            before.push( this.semicolon(`var ${this.scope.arrowThisName} = this`) );
       }

       let indent = this.getIndent(1);
       if( this.stack.async ){
            const name = key ? ` ${key}` : '';
            const returnItem = this.scope.returnItems.length < 1 ? this.semicolon(`return [2]`) : '';
            const hand = this.stack.generatorVarName();
            const top = `function${name}(){\r\n${before.join("\r\n")}\r\n`;
            const awaiter = `${indent}return __awaiter(this, void 0, void 0, function () {\r\n${this.stack.insertBefore.join("\r\n")}\r\n`
            const generator =`\t${indent}return __generator(this, function (${hand}) {\r\n`;
            const end = `\r\n\t${indent}});\r\n${indent}});\r\n}`;
            if( this.awaitCount > 0 ){
                return top+awaiter+generator+`switch (${hand}.label){\r\ncase 0 :${body}\r\n${returnItem}\r\n}${end}`;
            }else{
                return top+awaiter+generator+`${body}\r\n${returnItem}${end}`;
            }
       }

       indent = this.getIndent(2);
       if( this.stack.isArrowFunction && this.stack.isExpression ){
           const content = before.concat(this.stack.insertBefore,`return ${body}`).join("\r\n");
           return `function(${params.join(",")}){\r\n${content}\r\n${indent}}`;
       }else{
           const content = before.concat(this.stack.insertBefore,body).join("\r\n");
           if( key ){
                return `function ${key}(${params.join(",")}){\r\n${content}\r\n${indent}}`;
           }
           return `function(${params.join(",")}){\r\n${content}\r\n${indent}}`;
       }
   }

}

module.exports = FunctionExpression;