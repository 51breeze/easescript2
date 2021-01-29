const Syntax = require("./Syntax");
class FunctionExpression extends Syntax{
   emit(syntax){

        const insertBefore = [];
        this.stack.removeAllListeners("insertBefore")
        this.stack.addListener("insertBefore",(content)=>{
            if( content ){
                insertBefore.push(content);
            }
        });

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
               before.push( this.semicolon( `\t${name} = ${name} === void 0 ? ${defauleValue} : ${name}` ) );
           }
           return name;
       });
       //const returnType = this.stack.returnType ? this.stack.returnType.value(syntax) : null;
       const key = this.stack.key ? this.stack.key.value() : null;
       if( rest ){
            before.push( this.semicolon(`\tvar ${rest.value()} = arguments.slice(${len-1})`) );
       }
       if( this.scope.arrowThisName && !this.scope.isArrow ){
            before.push( this.semicolon(`\tvar ${this.scope.arrowThisName} = this`) );
       }

       const endIndent = this.getIndent();
       const startIndent = this.stack.parentStack.isBlockStatement ? endIndent : '';

       if( this.stack.async ){
            const name = key ? ` ${key}` : '';
            const returnItem = this.scope.returnItems.length < 1 ? this.semicolon(`\t\treturn [2]`) : '';
            const hand = this.stack.generatorVarName();
            const expression = [
                `${startIndent}function${name}(){`,
                before.join("\r\n"),
                `${startIndent}\treturn __awaiter(this, void 0, void 0, function (){`,
                insertBefore.join("\r\n"),
                `${startIndent}\t\treturn __generator(this, function (${hand}) {`
            ];
            const end = `${endIndent}\t\t});\r\n${endIndent}\t});\r\n${endIndent}}`;
            if( this.stack.awaitCount > 0 ){
                expression.push(`${startIndent}\t\t\tswitch (${hand}.label){`);
                expression.push(`${startIndent}\t\t\tcase 0 :`);
                expression.push(body);
                expression.push(returnItem);
                expression.push(`${startIndent}\t\t\t}`);
                expression.push(end);
            }else{
                expression.push(body);
                expression.push(returnItem);
                expression.push(end);
            }
            return expression.join("\r\n");
       }
       if( this.stack.isArrowFunction && this.stack.isExpression ){
           const content = before.concat(insertBefore.splice(0), this.semicolon(`\treturn ${body}`) ).join("\r\n");
           return `${startIndent}function(${params.join(",")}){\r\n${content}\r\n${endIndent}}`;
       }else{
           const content = before.concat(insertBefore.splice(0),body).join("\r\n");
           if( key ){
                return `${startIndent}function ${key}(${params.join(",")}){\r\n${content}\r\n${endIndent}}`;
           }
           return `${startIndent}function(${params.join(",")}){\r\n${content}\r\n${endIndent}}`;
       }
   }

}

module.exports = FunctionExpression;