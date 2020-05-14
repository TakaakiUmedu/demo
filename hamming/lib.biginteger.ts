// Should not be used. Ineffective implementation and not tested weel.

/// <reference path="./lib.algorithm.ts" />
/// <reference path="./lib.linear_algebra.ts" />

interface NumberConstructor { MAX_SAFE_INTEGER: number; } 
interface NumberConstructor { MIN_SAFE_INTEGER: number; } 

namespace Lib{
	const PRIME_TEST_COUNT = 20;

	export class BigInteger implements Lib.ScalarType<BigInteger>{

		constructor(public parser: BigInteger.Parser, public values: number[], public minus: boolean = false){
			let index = this.values.length - 1;
			while(index > 0 && this.values[index] == 0){
				this.values.pop();
				index --;
			}
		}
		toInteger(): number | undefined{
			if(this.minus){
				if(this.comp(this.parser.MIN_SAFE_INTEGER) < 0){
					return undefined;
				}
			}else{
				if(this.comp(this.parser.MAX_SAFE_INTEGER) > 0){
					return undefined;
				}
			}
			return this.toNumber();
		}
		toNumber(): number{
			let ret = 0;
			for(let i = this.values.length - 1; i >= 0; i --){
				ret = ret * this.parser.radix + this.values[i];
			}
			if(this.minus){
				return -ret;
			}else{
				return ret;
			}
		}

		private static addRaw(d1: number[], d2: number[], radix: number): number[]{
			let values: number[] = [];
			let rest = 0;
			let l1 = d1.length;
			let l2 = d2.length;
			let ls = l1 < l2 ? l1 : l2;
			let i = 0;
			while(i < ls){
				let n = d1[i] + d2[i] + rest;
				if(n >= radix){
					values.push(n - radix);
					rest = 1;
				}else{
					values.push(n);
					rest = 0;
				}
				i ++;
			}
			while(i < l1){
				let n = d1[i] + rest;
				if(n >= radix){
					values.push(n - radix);
					rest = 1;
				}else{
					values.push(n);
					rest = 0;
				}
				i ++;
			}
			while(i < l2){
				let n = d2[i] + rest;
				if(n >= radix){
					values.push(n - radix);
					rest = 1;
				}else{
					values.push(n);
					rest = 0;
				}
				i ++;
			}
			
			if(rest > 0){
				values.push(rest);
			}
			return values;
		}
		
		// require: d1 > d2
		private static subRaw(d1: number[], d2:number[], radix: number): number[]{
			let values: number[] = [];
			let rest = 0;
			let l1 = d1.length;
			let l2 = d2.length;
			let i = 0;
			if(l2 > l1){
				throw "BigInteger: fatal error";
			}
			
			while(i < l2){
				let n = d1[i] - d2[i] - rest;
				if(n >= 0){
					values.push(n);
					rest = 0;
				}else{
					values.push(n + radix);
					rest = 1;
				}
				i ++;
			}
			while(i < l1){
				let n = d1[i] - rest;
				if(n >= 0){
					values.push(n);
					rest = 0;
				}else{
					values.push(n + radix);
					rest = 1;
				}
				i ++;
			}
			if(rest != 0){
				throw "BigInteger: fatal error";
			}
			return values;
		}
		
		private getDigit(i: number): number{
			if(i >= 0 && i < this.values.length){
				return this.values[i];
			}else{
				return 0;
			}
		}
	
		neg(): BigInteger{
			if(this.isZero()){
				return this;
			}else{
				return this.parser.construct(this.values, !this.minus);
			}
		}
		
		abs(): BigInteger{
			if(this.minus){
				return this.parser.construct(this.values, false);
			}else{
				return this;
			}
		}
		
		add(num: BigInteger.Source): BigInteger{
			let val = this.parser.parse(num);
			if(this.minus && val.minus){
				return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), true);
			}else if(this.minus){
				return val.sub(this.neg());
			}else if(val.minus){
				return this.sub(val.neg());
			}else{
				return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), false);
			}
		}

		sub(num: BigInteger.Source): BigInteger{
			let val = this.parser.parse(num);
			if(this.minus && val.minus){
				// (-a) - (-b) = b - a
				return val.neg().sub(this.neg());
			}else if(this.minus){
				return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), true);
			}else if(val.minus){
				return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), false);
			}else{
				if(this.comp(val) < 0){
					return val.sub(this).neg();
				}
				return this.parser.construct(BigInteger.subRaw(this.values, val.values, this.parser.radix), false);
			}
		}
		
		isZero(): boolean{
			return this.values.length == 1 && this.values[0] == 0;
		}
		

		comp(num: BigInteger.Source): number{
			let val = this.parser.parse(num);
			if(this.minus && val.minus){
				return val.neg().comp(this.neg());
			}else if(this.minus){
				return -1;
			}else if(val.minus){
				return 1;
			}
			
			if(this.values.length > val.values.length){
				return 1;
			}
			if(this.values.length < val.values.length){
				return -1;
			}
			for(let i = this.values.length - 1; i >= 0; i --){
				let d1 = this.values[i];
				let d2 = val.values[i];
				if(d1 > d2){
					return 1;
				}else if(d1 < d2){
					return -1;
				}
			}
			return 0;
		}

		mulOne(num: number): BigInteger{
			let i = 0;
			let rest = 0;
			let values: number[] = [];
			let radix = this.parser.radix;
			let minus = this.minus;
			if(num < 0){
				minus = !minus;
				num = -num;
			}
			while(i < this.values.length){
				let n = this.getDigit(i) * num + rest;
				let m = n % radix;
				values.push(m);
				rest = (n - m) / radix;
				i ++;
			}
			while(rest > 0){
				let m = rest % radix;
				values.push(m);
				rest = (rest - m) / radix;
			}
			return this.parser.construct(values, minus);
		}
		
		mul(num: BigInteger.Source): BigInteger{
			if(typeof num === "number"){
				let minus;
				if(num < 0){
					num = -num;
					minus = true;
				}else{
					minus = false;
				}
				if(num < BigInteger.MAX_RADIX){
					let result = this.mulOne(num);
					if(minus){
						result = result.neg();
					}
					return result;
				}
			}
			
			let val = this.parser.parse(num);
			let ret = this.parser.ZERO;
			
			for(let i = 0; i < val.values.length; i ++){
				let tmp_values = this.mulOne(val.getDigit(i)).values.concat();
				for(let j = 0; j < i; j ++){
					tmp_values.unshift(0);
				}
				ret = ret.add(this.parser.construct(tmp_values, false));
			}
			if(this.minus !== val.minus){
				ret = ret.neg();
			}
			
			return ret;
		}
		
		divmod(num: BigInteger.Source): BigInteger.DivModResult{
			let val = this.parser.parse(num);
			if(val.isZero()){
				throw "this.constructor: error, divide by 0";
			}
			let rest: BigInteger = this;
			let res: number[] = [];
			
			let n_minus = rest.minus;
			let d_minus = val.minus;
			
			rest = rest.abs();
			val = val.abs();
			
			let i = 0;
			let tmp = val;
			
			while(true){
				let tmp2 = this.parser.construct([0].concat(tmp.values), false);
				if(rest.comp(tmp2) < 0){
					break;
				}
				tmp = tmp2;
				i ++;
			}
			
			while(true){
				let n = tmp.values.length - 1;
				let d1 = rest.getDigit(n + 1) * this.parser.radix + rest.getDigit(n);
				let d2 = tmp.getDigit(n) + 1;
				let guess = Math.floor(d1 / d2);
				
				guess = Lib.bsearch(guess, this.parser.radix, (n) => {
//					loop_count ++;
					return rest.comp(tmp.mulOne(n)) < 0;
				});
				guess--;
				
				res.unshift(guess);
				rest = rest.sub(tmp.mulOne(guess));
				if(val.values.length == tmp.values.length){
					break;
				}
				tmp = this.parser.construct(tmp.values.slice(1), false);
			}
			let quo = this.parser.construct(res, false);
			let rem = rest;
			
			if(n_minus != d_minus){
				quo = quo.neg();
			}
			if(n_minus){
				rem = rem.neg();
			}
			
			return {quo, rem}
		}
		
		div(num: BigInteger.Source): BigInteger{
			return this.divmod(num).quo;
		}

		mod(num: BigInteger.Source): BigInteger{
			return this.divmod(num).rem;
		}

		divmodOne(num: number): BigInteger.DivModOneResult{
			if(num == 0){
				throw "this.constructor: error, divide by 0";
			}
			let rest = 0;
			let res: number[] = [];
			for(let i = this.values.length - 1; i >= 0; i --){
				let n = this.values[i] + rest * this.parser.radix;
				let m = n % num;
				res.unshift((n - m) / num);
				rest = m;
			}
			
			return {quo: this.parser.construct(res, false), rem: rest};
		}
		
		equals(num: BigInteger.Source): boolean{
			return this.comp(num) == 0;
		}

		pow(power: BigInteger.Source, law?: BigInteger.Source): BigInteger{
			let val = BigInteger.MaxRadixBin.parse(power);
			let res = this.parser.ONE;
			let n: BigInteger = this;
			if(law != undefined){
				let law_val = this.parser.parse(law);
				let i = 0;
				while(true){
					let bit = val.getBit(i);
					if(bit === undefined){
						break;
					}
					if(bit == 1){
						res = res.mul(n).mod(law_val);
					}
					n = n.mul(n).mod(law_val);
					i ++;
				}
			}else{
				let i = 0;
				while(true){
					let bit = val.getBit(i);
					if(bit === undefined){
						break;
					}
					if(bit == 1){
						res = res.mul(n);
					}
					n = n.mul(n);
					i ++;
				}
			}
			return res;
		}
		
/*			shift(numBits: number): BigInteger{
			return MaxRadixBin.parse(this).shift(numBits);
		}
*/			
		isPrime(): boolean{ // implemented reffering to https://ja.wikipedia.org/wiki/%E3%83%9F%E3%83%A9%E3%83%BC-%E3%83%A9%E3%83%93%E3%83%B3%E7%B4%A0%E6%95%B0%E5%88%A4%E5%AE%9A%E6%B3%95
			let n: BigInteger = this;
			if(n.minus){
				n = n.neg();
			}
			if(n.isZero()){
				return false;
			}
			if(n.equals(this.parser.ONE)){
				return false;
			}
			if(n.equals(this.parser.TWO)){
				return true;
			}
			if(n.getBit(0) == 0){
				return false;
			}
			let d = n.sub(this.parser.ONE);
			while(true){
				let r = d.divmodOne(2);
				if(r.rem != 0){
					break;
				}
				d = r.quo;
			}
			let n_m1 = n.sub(this.parser.ONE);
			let n_m2 = n.sub(this.parser.TWO);
			for(let i = 0; i < PRIME_TEST_COUNT; i ++){
				let a = n_m2.random().add(this.parser.ONE);
				let t = d;
				let y = a.pow(t, n);
				while(!t.equals(n_m1) && !y.equals(this.parser.ONE) && !y.equals(n_m1)){
					y = y.mul(y).mod(n);
					t = t.mulOne(2);
				}
				if(!y.equals(n_m1) && t.getBit(0) == 0){
					return false;
				}
			}
			return true;
		}
		
		random(): BigInteger{
			let rand: number[] = [];
			for(let i = 0; i < this.values.length; i++){
				rand.push(Math.floor(Math.random() * this.parser.radix));
			}
			let result = this.mul(this.parser.construct(rand, false));
			return this.parser.construct(result.values.slice(this.values.length), false);
		}

		toString(): string{
			return BigInteger.MaxRadixDec.parse(this).toString();
		}
		
		gcm(num: BigInteger.Source): BigInteger{
			let a = this.abs();
			let b = this.parser.parse(num).abs();
			if(a.comp(b) < 0){
				let tmp = b;
				b = a;
				a = tmp;
			}
			while(!b.isZero()){
				let tmp = a.mod(b);
				a = b;
				b = tmp;
			}
			return a;
		}
		getBit(digit: number): 0 | 1 | undefined{
			return BigInteger.MaxRadixBin.parse(this).getBit(digit);
		}

	}

	export namespace BigInteger{
		export type DivModResult = {quo: BigInteger, rem: BigInteger};
		export type DivModOneResult = {quo: BigInteger, rem: number};
		export type RadixTable = {[radix: number] : number | null};

		export const MAX_SAFE_INTEGER = Number["MAX_SAFE_INTEGER"] === undefined ? 9007199254740991 : Number["MAX_SAFE_INTEGER"];
		export const MIN_SAFE_INTEGER = Number["MIN_SAFE_INTEGER"] === undefined ? -9007199254740991 : Number["MIN_SAFE_INTEGER"];

	
		// (radix - 1) * (radix - 1) + (radix - 1) <= MAX_SAFE_INTEGER;
		// radix ^ 2 - 2 radix + 1 + radix - 1 <= MAX_SAFE_INTEGER;
		// radix ^ 2 - radix - MAX_SAFE_INTEGER <= 0;
		// radix <= (1 + Math.sqrt(1 + 4 MAX_SAFE_INTEGER)) / 2
		export const MAX_RADIX = Math.floor((1 + Math.sqrt(1 + 4 * MAX_SAFE_INTEGER)) / 2);;

		
		function createRadixTable(base: number): {table: RadixTable, max_digits: number}{
			let table: RadixTable = {};
			let safe_max = Math.floor(MAX_RADIX / base);
			let radix = base;
			let digits = 1;
			while(radix < safe_max){
				table[radix] = digits;
				radix *= base;
				digits ++;
			}
			table[radix] = digits;
			return {table: table, max_digits: digits};
		}
	
		let {table: RADIX_TABLE_BIN, max_digits: MAX_DIGITS_BIN} = createRadixTable(2);
		let {table: RADIX_TABLE_DEC, max_digits: MAX_DIGITS_DEC} = createRadixTable(10);


		class ValueBin extends BigInteger{
			constructor(public parser: ParserBin, values: number[], minus: boolean){
				super(parser, values, minus);
			}
			
			getBit(digit: number): 0 | 1 | undefined{
				let bits = digit % this.parser.radixDigits;
				let index = (digit - bits) / this.parser.radixDigits;
				if(index >= this.values.length){
					return undefined;
				}else{
					let val = this.values[index] >> bits;
					if(index == this.values.length - 1 && val == 0){
						return undefined;
					}else{
						return (val & 1) == 1 ? 1 : 0;
					}
				}
			}
			
/*			shift(numBits: number): BigInteger{
				if(numBits == 0){
					return this;
				}else if(numBits < 0){
				}else{
					let bytes = Math.floor(numBits / this.parser.digits);
					let bits = numBits % this.parser.digits;
					let values : number[];
					if(bits == 0){
						values = this.values;
					}else{
						values = [];
						let mask_h = this.parser.radix - 1;
						let mask_l = (Math.power(2, this.parser.radix - bits) - 1) << bits;
						let quo: number;
						let rem = 0;
						for(let i = 0; i < this.values.length; i ++){
							let value = this.values[i];
							values.push(((value & mask) << bits) + quo);
							rem = value >> (this.parser.radix - bits);
						}
						if(rem > 0){
							values.pussh(rem);
						}
					}
					return this.parser.construct(values, this.minus);
				}
			}
*/			
		}
		
		class ValueDec extends BigInteger{
			constructor(public parser: ParserDec, values: number[], minus: boolean){
				super(parser, values, minus);
			}
			
			private static format_digit(digit: number, len: number): string{
				let str = "" + digit;
				while(str.length < len){
					str = "0" + str;
				}
				return str;
			}
			
			toString(): string{
				let ret = "";
				if(this.minus){
					ret += "-";
				}
				let i = this.values.length - 1;
				ret += this.values[i --];
				let radix_class: typeof ValueDec;
				let len = this.parser.radixDigits;
				while(i >= 0){
					ret += ValueDec.format_digit(this.values[i], len);
					i --;
				}
				return ret;
			}
		}
	
		export type ParseFunction = (value: Source) => BigInteger;
		
		
		export class Parser{
			public readonly ZERO: BigInteger;
			public readonly ONE: BigInteger;
			public readonly TWO: BigInteger;
			public readonly MAX_SAFE_INTEGER: BigInteger;
			public readonly MIN_SAFE_INTEGER: BigInteger;
			public readonly parser: ParseFunction;
			
			constructor(public radix: number){
				this.ZERO = this.construct([0], false);
				this.ONE = this.construct([1], false);
				if(radix == 2){
					this.TWO = this.construct([0, 1], false);
				}else{
					this.TWO = this.construct([2], false);
				}
				this.MAX_SAFE_INTEGER = this.parse(MAX_SAFE_INTEGER);
				this.MIN_SAFE_INTEGER = this.parse(MIN_SAFE_INTEGER);
				let parser = this;
				this.parser = function(source: Source){
					return parser.parse(source);
				}
			}
			
			public parse(src: Source): BigInteger{
				if(src instanceof BigInteger){
					if(src.parser.equals(this)){
						return src;
					}
					if(src.isZero()){
						return this.ZERO;
					}
					let values: number[] = [];
					let tmp = src.minus? src.neg() : src;
					while(!tmp.isZero()){
						let divmod = tmp.divmodOne(this.radix);
						values.push(divmod.rem);
						tmp = divmod.quo;
					}
					return this.construct(values, src.minus);
				}else if(typeof src === "number"){
					switch(src){
						case 0: return this.ZERO;
						case 1: return this.ONE;
						case 2: return this.TWO;
					}
					let minus = (src < 0);
					let tmp = minus ? -src : src;
					tmp = Math.ceil(tmp);
					let values: number[] = [];
					while(tmp > 0){
						let r = tmp % this.radix;
						values.push(r);
						tmp = (tmp - r) / this.radix;
					}
					return this.construct(values, minus);
					
				}else{
					return this.parse(parseStringValue(src));
				}
			}
			public equals(obj: any): boolean{
				if(this === obj){
					return true;
				}
				if(obj instanceof Parser){
					return this.radix == obj.radix;
				}
				return false;
			}
			
			construct(values: number[], minus: boolean){
				return new BigInteger(this, values, minus);
			}
		}
		export class ParserDec extends Parser{
			constructor(public radixDigits: number){
				super(Math.pow(10, radixDigits));
			}
			
			construct(values: number[], minus: boolean): BigInteger{
				return new ValueDec(this, values, minus);
			}


		}
		export class ParserBin extends Parser{
			constructor(public radixDigits: number){
				super(Math.pow(2, radixDigits));
			}
			
			construct(values: number[], minus: boolean): BigInteger{
				return new ValueBin(this, values, minus);
			}
		}
		function cutLeadingZeros(str: string): string{
			let match = str.match(/^0+/);
			if(match){
				return str.substring(match[0].length);
			}else{
				return str;
			}
		}

		function parseStringValueWithRadix(parser: Parser, char_radix: number, radix_digits: number, src: string, minus: boolean): BigInteger{
			let num_str = cutLeadingZeros(src);
			let values: number[] = [];
			while(true){
				let len = num_str.length;
				if(len == 0){
					break;
				}
				let cut = len > radix_digits ? radix_digits : len;
				values.push(parseInt(num_str.substr(len - cut, cut), char_radix));
				num_str = num_str.substr(0, len - cut);
			}
			if(values.length == 0){
				return parser.ZERO;
			}else if(values.length == 1){
				if(values[0] == 0){
					return parser.ZERO;
				}else if(values[1] == 1){
					return parser.ONE;
				}else if(values[1] == 2){
					return parser.TWO;
				}
			}else if(parser.radix == 2 && values.length == 2 && values[0] == 0 && values[1] == 1){
				return parser.TWO;
			}
			
			return parser.construct(values, minus);
		}
		
		function parseStringValue(src: string): BigInteger{
			let src_tmp: string;
			let match;
			let minus: boolean;
			if(match = src.match(/^(-|\+)/)){
				minus = (match[1] == "-");
				src_tmp = src.substring(1);
			}else{
				src_tmp = src;
				minus = false;
			}
			
			if(match = src_tmp.match(/^(\d+)$/)){
				if(match = src_tmp.match(/^0([0-7]\d+)/)){
					return parseStringValueWithRadix(MaxRadixOct, 8, MAX_DIGITS_OCT, match[1], minus);
				}else{
					return parseStringValueWithRadix(MaxRadixDec, 10, MAX_DIGITS_DEC, src_tmp, minus);
				}
			}else if(match = src_tmp.match(/^0x([0-9a-f]+)$/i)){
					return parseStringValueWithRadix(MaxRadixHex, 16, MAX_DIGITS_HEX, match[1], minus);
			}else if(match = src_tmp.match(/^0b((?:0|1)+)$/i)){
					return parseStringValueWithRadix(MaxRadixBin, 2, MAX_DIGITS_BIN, match[1], minus);
			}else if(match = src_tmp.match(/^(\d*)\.\d+$/)){
					return parseStringValueWithRadix(MaxRadixDec, 10, MAX_DIGITS_DEC, match[1], minus);
			}else if(match = src_tmp.match(/^(\d*)\.(\d*)(?:e|E)(-|\+|)(\d+)$/)){
				let num_str = match[1] + match[2];
				if(num_str.length > 0){
					let pow1 = match[2].length;
					let pow2 = parseInt(match[4], 10);
					if(match[3] == "-"){
						pow2 = -pow2;
					}
					let pow = pow1 - pow2;
					let value = parseStringValueWithRadix(MaxRadixDec, 10, MAX_DIGITS_DEC, num_str, minus);
					if(pow > 0){
						return value.mul(MaxRadixDec.parse(10).pow(pow));
					}else if(pow < 0){
						return value.div(MaxRadixDec.parse(10).pow(-pow));
					}else{
						return value;
					}
				}
			}
			throw "invalid string : " + src;
		}
		
		const MAX_DIGITS_OCT = Math.floor(MAX_DIGITS_BIN / 3);
		const MAX_DIGITS_HEX = Math.floor(MAX_DIGITS_BIN / 4);
		
		export function createParseFunction(radix: number): ParseFunction{
			let digits: number | null;
			if((digits = RADIX_TABLE_BIN[radix]) != null){
				return new ParserBin(digits).parser;
			}else if((digits = RADIX_TABLE_DEC[radix]) != null){
				return new ParserDec(digits).parser;
			}else{
				if(radix < 2){
					throw "invalid radix: " + radix;
				}
				if(radix > BigInteger.MAX_RADIX){
					throw "radix too large: " + radix;
				}
				return new Parser(radix).parser;
			}
		}

		export function createParseFunctionDec(radixDigits: number): ParseFunction{
			return new ParserDec(radixDigits).parser;
		}
		export function createParseFunctionBin(radixDigits: number): ParseFunction{
			return new ParserBin(radixDigits).parser;
		}
		

		export type Source = string | number | BigInteger;

		export const MaxRadixBin = new BigInteger.ParserBin(MAX_DIGITS_BIN);
		export const MaxRadixOct = new BigInteger.ParserBin(MAX_DIGITS_OCT * 3);
		export const MaxRadixHex = new BigInteger.ParserBin(MAX_DIGITS_HEX * 4);
		export const MaxRadixDec = new BigInteger.ParserDec(MAX_DIGITS_DEC);
		export const MaxRadix = new BigInteger.Parser(BigInteger.MAX_RADIX);
		export const Default = BigInteger.MaxRadix;

		export const ZERO = Default.ZERO;
		export const ONE = Default.ONE;
		export const TWO = Default.TWO;
		export const parse = Default.parser;
		export const parser = Default.parser;
	}
	
}
