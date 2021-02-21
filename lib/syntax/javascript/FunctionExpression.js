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
        if( this.stack.async ){
            syntax.hasAsync = true;
        }
        //const returnType = this.stack.returnType ? this.stack.returnType.value(syntax) : null;
        const key = this.stack.isConstructor ? this.compilation.module.id : (this.stack.key ? this.stack.key.value() : null);
        if( rest ){
            before.push( this.semicolon(`\tvar ${rest.value()} = Array.prototype.slice.call(arguments,${len-1})`) );
        }
        if( this.scope.arrowThisName && !this.scope.isArrow ){
            before.push( this.semicolon(`\tvar ${this.scope.arrowThisName} = this`) );
        }

        const endIndent = this.getIndent();
        const startIndent = this.stack.parentStack.isBlockStatement ? endIndent : '';

        if( this.stack.async ){
            const name = key ? ` ${key}` : '';
            const returnItem = this.scope.returnItems.length < 1 ? this.semicolon(`${this.getIndent(3)}return [2]`) : '';
            const hand = this.stack.generatorVarName();
            const expression = [
                `${startIndent}function${name}(){`,
                before.join("\r\n"),
                `${startIndent}${this.getIndent(2)}return System.awaiter(this, void 0, void 0, function (){`,
                insertBefore.join("\r\n"),
                `${startIndent}${this.getIndent(3)}return System.generator(this, function (${hand}) {`
            ];
            const end = `${endIndent}${this.getIndent(2)}});\r\n${endIndent}${this.getIndent(1)}});\r\n${endIndent}}`;
            if( this.stack.awaitCount > 0 ){
                expression.push(`${startIndent}${this.getIndent(4)}switch (${hand}.label){`);
                expression.push(`${startIndent}${this.getIndent(5)}case 0 :`);
                expression.push(body);
                expression.push(returnItem);
                expression.push(`${startIndent}${this.getIndent(4)}}`);
                expression.push(end);
            }else{
                expression.push(body);
                expression.push(returnItem);
                expression.push(end);
            }
            return expression.join("\r\n");
        }

        if( this.stack.isArrowFunction && this.stack.isExpression ){
            const content = before.concat(insertBefore.splice(0), this.semicolon(`${this.getIndent(1)}return ${body}`) ).join("\r\n");
            return `${startIndent}function(${params.join(",")}){\r\n${content}\r\n${endIndent}}`;
        }else{
            const content = before.concat(insertBefore.splice(0),body);
            if( this.stack.isConstructor ){
                const event={properties:null};
                this.stack.parentStack.dispatcher("fetchClassProperty",event);
                if( event.properties ){
                    content.unshift(this.semicolon(`\tObject.defineProperty(this,private,{value:${event.properties}})`));
                }
            }
            if( key ){
                return `${startIndent}function ${key}(${params.join(",")}){\r\n${content.join("\r\n")}\r\n${endIndent}}`;
            }
            return `${startIndent}function(${params.join(",")}){\r\n${content.join("\r\n")}\r\n${endIndent}}`;
        }
    }

}

module.exports = FunctionExpression;