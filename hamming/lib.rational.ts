/// <reference path="./lib.biginteger.ts"/>
/// <reference path="./lib.linear_algebra.ts" />

namespace Lib{
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
//	export function Rational(source: Rational.Source): Rational.Rational{
//		return Rational.Rational.parse(source);
//	}

	export class Rational implements Lib.ScalarType<Rational> {
		public readonly minus: boolean;
		constructor(public num: BigInteger, public den: BigInteger){
			this.minus = num.minus;
/*
			if(den.minus){
				throw "ERROR: negative denominator: " + den;
			}
*/
		}
		
		static construct(num: BigInteger, den: BigInteger) : Rational{
			if(den.isZero()){
				throw "divide by zero";
			}
			if(num.isZero()){
				return Rational.ZERO;
			}
			let gcm = num.gcm(den);
			if(!gcm.equals(BigInteger.ONE)){
				num = num.div(gcm);
				den = den.div(gcm);
			}
			return new Rational(num, den);
		}
		
		public static parse(num: Rational.Source, den?: Rational.Source) : Rational{
			if(den === undefined){
				if(num instanceof Rational){
					return num;
				}else if(num instanceof BigInteger){
					return Rational.construct(num, BigInteger.ONE);
				}else{
					let num_str: string;
					if(typeof num === "number"){
						num_str = num.toString();
					}else{
						num_str = num;
					}
					let match: RegExpMatchArray | null;
					try{
						if(match = num_str.match(/^(.+)\/([^\/]+)$/)){
							return Rational.parse(match[1]).div(Rational.parse(match[2]));
						}else if(match = num_str.match(/^(-|\+|)(\d*)\.(\d*)(?:(?:e|E)((?:-|\+|)\d+))?$/)){
							num_str = match[2] + match[3];
							if(num_str.length > 0){
								let pow = -match[3].length;
								if(!(match[4] === undefined)){
									pow += parseInt(match[4], 10);
								}
								let num = BigInteger.parse(num_str);
								if(match[1] == "-"){
									num = num.neg();
								}
								if(pow < 0){
									return Rational.construct(num, BigInteger.parse(10).pow(-pow));
								}else if(pow > 0){
									return Rational.construct(num.mul(BigInteger.parse(10).pow(pow)), BigInteger.ONE);
								}else{
									return Rational.construct(num, BigInteger.ONE);
								}
							}
						}else{
							return Rational.construct(BigInteger.parse(num_str), BigInteger.ONE);
						}
					}catch(e){
						throw "invalid argument for new Rational() : " + num_str + " (" + e + ")";
					}
					throw "invalid argument for new Rational() : " + num_str;
				}
			}else if(num instanceof Rational){
				return num.div(den);
			}else if(den instanceof Rational){
				return Rational.parse(num).div(den);
			}else{
				let num_ra = Rational.parse(num);
				let den_ra = Rational.parse(den);
				return num_ra.div(den_ra);
			}
		}

		toString(): string{
			let ret = this.num.toString();
			if(!this.den.equals(BigInteger.ONE)){
				ret += "/" + this.den.toString();
			}
			return ret;
		}
		
		toRealString(): string{
			return this.toString();
		}
		
		toNumber(): number{
			let num = this.num;
			let den = this.den;
			let ratio = 1;
			let minus = 1;
			
			if(num.minus){
				minus = -1;
				num = num.neg();
			}
			
			let div : BigInteger.DivModResult;
			while(true){
				div = num.divmod(den);
				if(div.quo.comp(BigInteger.MAX_SAFE_INTEGER) > 0){
					break;
				}
				if(div.rem.isZero()){
					break;
				}
				
				num = num.mul(10);
				ratio *= 10;
			}
			
			return minus * div.quo.toNumber() / ratio;
		}
		toAccurateDecimalString(): string | null{
			let den = this.den;
			let count_2 = 0;
			let count_5 = 0;
			
			while(!den.equals(BigInteger.ONE)){
				let div = den.divmod(2);
				if(!div.rem.isZero()){
					break;
				}
				den = div.quo;
				count_2 += 1;
			}
			
			while(!den.equals(BigInteger.ONE)){
				let div = den.divmod(5);
				if(!div.rem.isZero()){
					break;
				}
				den = div.quo;
				count_5 += 1;
			}
			
			if(!den.equals(BigInteger.ONE)){
				return null;
			}
			let num = this.num;
			if(count_2 > 0 || count_5 > 0){
				let count_10;
				if(count_2 == count_5){
					count_10 = count_2;
				}else if(count_2 > count_5){
					count_10 = count_2;
					num = num.mul(BigInteger.parse(5).pow(count_2 - count_5));
				}else{
					count_10 = count_5;
					num = num.mul(BigInteger.parse(2).pow(count_5 - count_2));
				}
				return Rational.shift_period(num.toString(), count_10);
			}else{
				return num.toString();
			}
		}
		
		

		private static shift_period(str: string, shift: number): string{
			let pos = str.length - shift;
			return str.substr(0, pos) + "." + str.substr(pos);
		}
		
		round(digits: number): string{
			if(this.den.equals(BigInteger.ONE)){
				return this.num.toString();
			}
			
			let ret: string;
			let num: BigInteger;
			if(this.num.minus){
				ret = "-";
				num = this.num.neg();
			}else{
				ret = "";
				num = this.num;
			}
			
			if(num.comp(this.den) < 0){
				ret += "0.";
				let quo = BigInteger.ZERO;;
				let div;
				while(true){
					let div = num.mulOne(10).divmod(this.den);
					if(div.rem.isZero()){
						quo = quo.mulOne(10).add(div.quo);
						break;
					}
					if(quo.toString().length == digits){
						if(div.rem.comp(5) >= 0){
							quo = quo.add(BigInteger.ONE);
						}
						break;
					}
					num = div.rem;
					quo = quo.mulOne(10).add(div.quo);
					if(quo.isZero()){
						ret += "0";
					}
				}
				return ret + quo.toString();
			}else{
				let {rem, quo} = num.divmod(this.den);
				let shift = 0;
				while(true){
					let div = rem.mul(10).divmod(this.den);
					quo = quo.mulOne(10).add(div.quo);
					shift ++;
					if(div.rem.isZero()){
						return ret + Rational.shift_period(quo.toString(), shift);
					}
					if(shift == digits + 1){
						break;
					}
					rem = div.rem;
				}
				let div_one = quo.divmodOne(10);
				quo = div_one.quo;
				if(div_one.rem >= 5){
					quo = quo.add(BigInteger.ONE);
				}
				return ret + Rational.shift_period(quo.toString(), shift - 1);
			}
		}
		
		neg(): Rational{
			return new Rational(this.num.neg(), this.den);
		}
		
		abs(): Rational{
			if(this.minus){
				return this.neg();
			}
			return this;
		}
		
		add(value: Rational.Source): Rational{
			let number = Rational.parse(value);
			let gcm = this.den.gcm(number.den);
			let den_l = this.den.div(gcm);
			let den_r = number.den.div(gcm);
			let num_l = this.num.mul(den_r);
			let num_r = number.num.mul(den_l);
			let num = num_l.add(num_r);
			let den = this.den.mul(den_r);
			return new Rational(num, den);
		}
		
		sub(value: Rational.Source): Rational{
			return this.add(Rational.parse(value).neg());
		}

		comp(value: Rational.Source): number{
			let diff = this.add(Rational.parse(value).neg());
			if(diff.isZero()){
				return 0;
			}else if(diff.minus){
				return -1;
			}else{
				return 1;
			}
		}
		
		mul(number: Rational.Source): Rational{
			let pair = number instanceof Rational ? number : Rational.parse(number);
			let num1 = this.num, den1 = this.den;
			let num2 = pair.num, den2 = pair.den;
			let gcm1 = num1.gcm(den2);
			if(!gcm1.equals(BigInteger.ONE)){
				num1 = num1.div(gcm1);
				den2 = den2.div(gcm1);
			}
			let gcm2 = den1.gcm(num2);
			if(!gcm2.equals(BigInteger.ONE)){
				den1 = den1.div(gcm2);
				num2 = num2.div(gcm2);
			}
			
			return Rational.construct(num1.mul(num2), den1.mul(den2));
		}
		
		div(number: Rational.Source): Rational{
			return this.mul(Rational.parse(number).inv());
		}
		
		inv(): Rational{
			if(this.num.isZero()){
				throw "divide by zero";
			}
			if(this.num.minus){
				return new Rational(this.den.neg(), this.num.neg());
			}else{
				return new Rational(this.den, this.num);
			}
		}
		
		isZero(): boolean{
			return this.num.isZero();
		}
		
		equals(number: Rational.Source): boolean{
			if(this === number){
				return true;
			}
			let num_ra = Rational.parse(number);
			return this.num.equals(num_ra.num) && this.den.equals(num_ra.den);
		}
		
	}

	
	export module Rational{
		export type Source = BigInteger.Source | Rational;
		export const ZERO = new Rational(BigInteger.ZERO, BigInteger.ONE);
		export const ONE = new Rational(BigInteger.ONE, BigInteger.ONE);
		export const parseer = Rational.parse;
//		export const parse = Rational.parse;
	}
	
	
}
