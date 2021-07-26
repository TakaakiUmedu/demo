/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const N = BigInteger.parse(10).pow(6);
			const p = N.random();
			const q = N.random();
			
			Dom.get(HTMLInputElement, "demo_id_2").value = checkParam("p", "" + p);
			Dom.get(HTMLInputElement, "demo_id_3").value = checkParam("q", "" + q);
			
			return { p, q };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const p = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_2").value);
			const q = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_3").value);
			
			return { p, q };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { p, q } = vars;
			
			const u = calcInv(p, q);
			let v: null | BigInteger = null;
			if(u !== null){
				show_branch("demo_id_5");
				
				v = BigInteger.ONE.sub(p.mul(u)).div(q);
				const t = p.mul(u).add(q.mul(v));
				set_value("demo_id_6", u);
				set_value("demo_id_7", v);
				set_value("demo_id_8", p);
				set_value("demo_id_9", u);
				set_value("demo_id_10", q);
				set_value("demo_id_11", v);
				set_value("demo_id_12", t);
				set_value("demo_id_13", p);
				set_value("demo_id_14", u);
				set_value("demo_id_15", q);
				set_value("demo_id_16", p.mul(u).mod(q));
				set_value("demo_id_17", q);
				set_value("demo_id_18", v);
				set_value("demo_id_19", p);
				set_value("demo_id_20", q.mul(v).mod(p));
			}
			else{
				show_branch("demo_id_21");
				
			}
			if(u !== null && v !== null){
				show_branch("demo_id_23");
				
				{
					function initialize(checkParam: (name: string, defaultValue: string)=> string){
						const a = p.random();
						const b = q.random();
						
						Dom.get(HTMLInputElement, "demo_id_26").value = checkParam("a", "" + a);
						Dom.get(HTMLInputElement, "demo_id_27").value = checkParam("b", "" + b);
						
						return { a, b };
					}
					
					function reload(): ReturnType<typeof initialize>{
						const a = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_26").value);
						const b = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_27").value);
						
						return { a, b };
					}
					
					function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
						if(u !== null && v !== null){
							const { a, b } = vars;
							
							const y = a.mul(q).mul(v).add(b.mul(p).mul(u));
							const x = y.mod(p.mul(q));
							const a2 = x.mod(p);
							const b2 = x.mod(q);
							set_value("demo_id_29", a);
							set_value("demo_id_30", q);
							set_value("demo_id_31", u);
							set_value("demo_id_32", b);
							set_value("demo_id_33", p);
							set_value("demo_id_34", v);
							set_value("demo_id_35", y);
							set_value("demo_id_36", y);
							set_value("demo_id_37", p.mul(q));
							set_value("demo_id_38", x);
							set_value("demo_id_39", a2);
							set_value("demo_id_40", b2);
							if(a2.equals(a)){
								show_branch("demo_id_41");
								
								if(b2.equals(b)){
									show_branch("demo_id_42");
									
								}
								else{
									show_branch("demo_id_43");
									
									set_value("demo_id_44", b);
									set_value("demo_id_45", q);
									set_value("demo_id_46", b.mod(q));
								}
							}
							else{
								show_branch("demo_id_47");
								
								if(b2.equals(b)){
									show_branch("demo_id_48");
									
									set_value("demo_id_49", a);
									set_value("demo_id_50", p);
									set_value("demo_id_51", a.mod(p));
								}
								else{
									show_branch("demo_id_52");
									
									set_value("demo_id_53", a);
									set_value("demo_id_54", b);
									set_value("demo_id_55", p);
									set_value("demo_id_56", q);
									set_value("demo_id_57", a.mod(p));
									set_value("demo_id_58", b.mod(q));
								}
							}
						}
					}
					
					Lib.MathDemo.register(["demo_id_24"], "demo_id_25", "demo_id_28", initialize, reload, update);
				}}
			else{
				show_branch("option_3");
				
			}
		}
		
		Lib.MathDemo.register(["demo_id_0", "demo_id_22"], "demo_id_1", "demo_id_4", initialize, reload, update);
	}
}
