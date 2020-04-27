/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const L = BigInteger.parse(123456);
			const A = BigInteger.parse(165437);
			
			Dom.getInput("demo_id_2").value = checkParam("L", "" + L);
			Dom.getInput("demo_id_3").value = checkParam("A", "" + A);
			
			return { L, A };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const L = BigInteger.parse(Dom.getInput("demo_id_2").value);
			const A = BigInteger.parse(Dom.getInput("demo_id_3").value);
			
			return { L, A };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { L, A } = vars;
			
			function make_exp(...clauses: [BigInteger, BigInteger][]): string{
				let exp: string[] = [];
				for(const clause of clauses){
					if(clause.length > 0){
						let minus;
						let clause_exp = [];
						for(let j = 0; j < clause.length; j ++){
							const val = clause[j];
							let abs = val.abs();
							if(j == 0){
								minus = val.minus;
							}else{
								minus = (val.minus ? !minus : minus);
							}
							if(!abs.equals(BigInteger.ONE)){
								clause_exp.push(abs);
							}
						}
						if(minus){
							if(exp.length > 0){
								exp.push(" - ");
							}else{
								exp.push("-");
							}
						}else{
							if(exp.length > 0){
								exp.push(" + ");
							}
						}
						
						if(clause_exp.length > 0){
							exp.push("" + clause_exp[0]);
							for(let j = 1; j < clause_exp.length; j ++){
								exp.push(" \\cdot " + clause_exp[j]);
							}
						}else{
							exp.push("1");
						}
					}
				}
				return exp.join("");
			}
			const list: {
				a: BigInteger,
				b: BigInteger,
				r: BigInteger,
				q: BigInteger,
			}[] = [];
			const tbody1 = Dom.elem("tbody");
			const table1 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody1));
			
			let a = vars.A, b = vars.L;
			while(true){
				const divmod = b.divmod(a);
				
				tbody1.appendChild(Dom.elem("tr", Dom.td({ className: "right" }, "$" + b + "\\div" + a + "$"), Dom.td("$=$"), Dom.td("$" + divmod.quo + " あまり " + divmod.rem + "$")));
				
				list.push({
					a: a,
					b: b,
					r: divmod.rem,
					q: divmod.quo,
				});
				
				b = a;
				a = divmod.rem;
				if(a.equals(BigInteger.ONE)){
					break;
				}else if(a.isZero()){
					break;
				}
			}
			set_value("demo_id_5", table1);
			if(a.isZero()){
				show_branch("demo_id_6");
				
			}
			else{
				show_branch("demo_id_7");
				
				const tbody2 = Dom.elem("tbody");
				const table2 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody2));
			
				for(let i = 0; i < list.length; i ++){
					const item = list[i];
					tbody2.appendChild(Dom.elem("tr", 
						Dom.elem("td", { className: "right" }, "$" + item.r + "$"), Dom.td("$=$"), 
						Dom.td("$" + item.b + " - " + item.a + " \\cdot " + item.q + "$"), 
						Dom.elem("td", { className: "right"}, "$(" + (i + 1) + ")$")
					));
				}
				set_value("demo_id_8", table2);
				const tbody3 = Dom.elem("tbody");
				const table3 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody3));
				let item = list[list.length - 1];
				
				tbody3.appendChild(Dom.elem("tr", Dom.td("$1$"), Dom.td("$=$"), Dom.td("$" + item.b + " - " + item.a + " \\cdot " + item.q + "$"), Dom.elem("td"), Dom.elem("td"), Dom.td("$((" + (list.length) + ")より)$")));
				
				a = item.b;
				b = BigInteger.ONE;
				let c = item.a;
				let d = item.q.neg();
				
				for(let i = list.length - 2; i >= 0; i --){
					item = list[i];
					
					/// デバッグ用
					const check = a.mul(b).add(c.mul(d));
					if(!check.equals(BigInteger.ONE)){
						tbody3.appendChild(Dom.tr(Dom.elem("td", { style: { color: "red" } }, "【バグ】予期せぬ計算エラーが起きました")));
						break;
					}
					
					let exp = [];
					if(a.mul(b).minus){
						exp.push("-");
					}
					exp.push(a.abs());
					if(!b.equals(BigInteger.ONE)){
						exp.push(" × ");
						exp.push(b.abs());
					}
					
					if(d.minus){
						exp.push(" - ");
					}else{
						exp.push(" + ");
					}
					
					exp = exp.concat(["(", item.b, " - ", item.a, " \\cdot ", item.q, ")", " \\cdot ", d.abs()]);
				
					
					let next_a = item.b;
					let next_b = d;
					let next_c = a;
					let next_d = b.add(item.q.mul(d.neg()));
					
					a = next_a;
					b = next_b;
					c = next_c;
					d = next_d;
					
					tbody3.appendChild(Dom.elem("tr", 
						Dom.td(),
						Dom.td("$=$"),
						Dom.td("$" + exp.join("") + "$"),
						Dom.td("$=$"),
						Dom.td("$" + make_exp([a, b], [c, d]) + "$"),
						Dom.td("$((" + (i + 1) + ")を代入して整理)$")
					));
				}
				let inv_a: BigInteger;
				let q: BigInteger;
				if(a.equals(vars.A)){
					inv_a = b;
					q = d;
				}else{
					inv_a = d;
					q = b;
				}
				set_value("demo_id_9", table3);
				set_value("demo_id_10", make_exp([b, a], [d, c]));
				set_value("demo_id_11", q);
				set_value("demo_id_12", inv_a.minus ? "" : "+");
				set_value("demo_id_13", inv_a);
				set_value("demo_id_14", inv_a);
				set_value("demo_id_15", q.minus ? "+" : "-");
				set_value("demo_id_16", q.abs());
				set_value("demo_id_17", inv_a);
				set_value("demo_id_18", (q.minus ? "+" : "-") + q.abs());
				set_value("demo_id_19", (q.minus ? "+" : "-"));
				set_value("demo_id_20", q.abs());
				set_value("demo_id_21", (q.minus ? "+" : "-"));
				if(!inv_a.minus){
					show_branch("demo_id_22");
					
					set_value("demo_id_23", inv_a);
				}
				else{
					show_branch("demo_id_24");
					
					set_value("demo_id_25", inv_a);
					set_value("demo_id_26", inv_a);
					const inv_a2 = L.add(inv_a);
					inv_a = inv_a2;
					set_value("demo_id_27", inv_a2);
				}
				set_value("demo_id_28", A);
				set_value("demo_id_29", inv_a);
				set_value("demo_id_30", L);
				set_value("demo_id_31", A.mul(inv_a));
				set_value("demo_id_32", L);
				set_value("demo_id_33", A.mul(inv_a).mod(vars.L));
			}
		}
		
		Lib.MathDemo.register(["demo_id_0"], "demo_id_1", "demo_id_4", initialize, reload, update);
	}
}
