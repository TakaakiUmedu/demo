/// <reference path="../../mylib/mylib.ts"/>
/// <reference path="../../mylib/mylib.dom.ts"/>
/// <reference path="../../mylib/mylib.biginteger.ts"/>
/// <reference path="../../mylib/mylib.mathdemo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	type Number = number | BigInteger;
	
	export const x = "hoge";
	
	export function format_set(items: (string | Number)[], limited: boolean): HTMLElement{
		if(limited){
			items = items.concat(["\\cdots"]);
		}
		return format_list("\\left\\{\\right.", ",\\ ", "\\left.\\right\\}", items);
	}
	export function format_list(head: string, delim: string, tail: string, items: (string | Number)[]): HTMLElement{
		const results: HTMLElement[] = [];
		for(let i = 0; i < items.length; i ++){
			let item = "" + items[i];
			if(i == 0){
				item = head + item;
			}
			if(i == items.length - 1){
				item += tail;
			}else{
				item += delim;
			}
			results.push(Dom.elem("span", "$ \\displaystyle " + item + "$"))
		}
		return Dom.span(results);
	}
	
	export function calcInv(n: Lib.BigInteger, law: Lib.BigInteger){
		if(n.comp(BigInteger.ONE) == 0){
			return n;
		}
		let tuple1 = {r: n,   x: BigInteger.ONE,  y: BigInteger.ZERO};
		let tuple2 = {r: law, x: BigInteger.ZERO, y: BigInteger.ONE};
		let pre, cur: {r: Lib.BigInteger, x: Lib.BigInteger, y: Lib.BigInteger };
		if(n > law){
			pre = tuple1;
			cur = tuple2;
		}else{
			pre = tuple2;
			cur = tuple1;
		}
		
		while(true){
			// assert pre.r == n * pre.x + law * pre.y
			// assert cur.r == n * cur.x + law * cur.y
			
			let div = pre.r.divmod(cur.r);
			// d = pre.r / cur.r;
			// r = pre.r % cur.r;
			
			// assert r = pre.r - d * cur.r
			// assert r = (n * pre.x + law * pre.y) - d * (n * cur.x + law * cur.y)
			// assert r = n * (pre.x - d * cur.x) + law * (pre.y - d * cur.y)
			
			let nxt = {
				r: div.rem,
				x: pre.x.sub(div.quo.mul(cur.x)),
				y: pre.y.sub(div.quo.mul(cur.y)),
			};
			
			if(nxt.r.comp(BigInteger.ONE) == 0){
				let ret = nxt.x;
				while(ret.minus){
					ret = ret.add(law);
				}
				return ret;
			}else if(nxt.r.isZero()){
				return null;
			}
			pre = cur;
			cur = nxt;
		}
	}
	
	export function tr(...args: Lib.Dom.DomItem[]){
		return Dom.tr(...args.map((item)=> {
			if(item instanceof HTMLTableCellElement){
				return item;
			}else if(item instanceof HTMLElement){
				return Dom.td(item);
			}else if(Array.isArray(item)){
				return Dom.td(item);
			}else{
				return Dom.td("$ \\displaystyle " + item + "$");
			}
		}));
	}
	
}
