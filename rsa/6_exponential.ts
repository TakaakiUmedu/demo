/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const l = BigInteger.parse("1" + Array(20 + 1).join("0")).random();
			const a = l.random();
			const b = l.random();
			
			Dom.get(HTMLInputElement, "demo_id_2").value = checkParam("a", "" + a);
			Dom.get(HTMLInputElement, "demo_id_3").value = checkParam("b", "" + b);
			Dom.get(HTMLInputElement, "demo_id_4").value = checkParam("l", "" + l);
			
			return { a, b, l };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const a = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_2").value);
			const b = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_3").value);
			const l = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_4").value);
			
			return { a, b, l };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { a, b, l } = vars;
			
			let result_p;
			let c = b;
			const list1: BigInteger[] = [];
			const list2: number[] = [];
			const list3: number[] = [];
			let d = a;
			let result = BigInteger.parse(1);
			let n = 0;
			let count = 0;
			
			while(!c.isZero()){
				count ++;
				const divmod = c.divmodOne(2);
				if(divmod.rem == 1){
					result = result.mul(d).mod(l);
					count += 2;
					list1.push(d);
					list2.push(n);
					list3[n] = 1;
				}else{
					list3[n] = 0;
				}
				d = d.mul(d).mod(l);
				count += 2;
				c = divmod.quo;
				n += 1;
			}
			list1.reverse();
			list2.reverse();
			list3.reverse();
			
			let eq;
			set_value("demo_id_6", b);
			set_value("demo_id_7", format_list("", " ", "_{(2)}", list3));
			const list4_0: string[] = [];
			const list4: string[] = [];
			const list5: string[] = [];
			const list6: string[] = [];
			const list7: string[] = [];
			const list8: string[] = [];
			const list9: string[] = [];
			for(let i = 0; i < list3.length; i ++){
				if(list3[i] === 1){
					const n = list3.length - i - 1;
					list4_0.push("" + n);
					const exp = "2^{" + n + "}";
					list4.push(exp);
					list5.push("^{" + exp + "}");
					list6.push("a^{" + exp + "}");
					const x = "x_{" + n + "}";
					list7.push(x);
					list8.push("(x_{" + n + "} \\ \\% \\ l)");
					list9.push("y_{" + n + "}");
				}
			}
			set_value("demo_id_8", format_set(list4_0, false));
			set_value("demo_id_9", format_list("", " \\ +\\  ", "", list4));
			set_value("demo_id_11", format_list("", " {^{+}}", "", list5));
			set_value("demo_id_12", format_list("", " ", "", list6));
			set_value("demo_id_14", format_list("", "\\;", "", list7));
			const tbody10 = Dom.elem("tbody");
			const bq10 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody10));
			let calc_count = 1;
			let y = a.mod(l);
			let p: BigInteger;
			if(list3[list3.length - 1] == 1){
				p = y;
			}else{
				p = BigInteger.ONE;
			}
			tbody10.appendChild(tr("y_0", "=", "a \\ \\% \\ l", "=", y.toString()));
			for(let i = 1; i < list3.length; i ++){
				y = y.mul(y).mod(l);
				tbody10.appendChild(tr("y_{" + i + "}", "=", "y_{" + (i - 1) + "}^2 \\ \\% \\ l", "=", y.toString()));
				calc_count += 2;
				if(list3[list3.length - 1 - i] == 1){
					p = p.mul(y).mod(l);
					calc_count += 2;
				}
			}
			set_value("demo_id_16", bq10);
			set_value("demo_id_18", format_list("", "\\; ", "", list7));
			set_value("demo_id_19", format_list("", " ", "", list8));
			set_value("demo_id_20", format_list("", "\\; ", "", list9));
			if(list9.length > 2){
				show_branch("demo_id_22");
				
				if(list9.length > 3){
					show_branch("demo_id_23");
					
				}
				else{
					show_branch("demo_id_24");
					
				}
				const list11l: string[] = [];
				const list11r: string[] = [];
				for(let i = 1; i < list9.length - 1; i ++){
					list11l.push("(" + list9[i]);
					list11r.push("\\ \\% \\ l)");
				}
				set_value("demo_id_25", list9[0]);
				set_value("demo_id_26", format_list("", " ", "", list11l));
				set_value("demo_id_27", list9[list9.length - 1]);
				set_value("demo_id_28", format_list("", " ", "", list11r));
			}
			else{
				show_branch("demo_id_29");
				
			}
			set_value("demo_id_31", calc_count);
			set_value("demo_id_32", p);
		}
		
		Lib.MathDemo.register(["demo_id_0", "demo_id_10", "demo_id_13", "demo_id_15", "demo_id_17", "demo_id_21", "demo_id_30"], "demo_id_1", "demo_id_5", initialize, reload, update);
	}
}
