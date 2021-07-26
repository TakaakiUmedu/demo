/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const p = BigInteger.parse(3);
			const q = BigInteger.parse(5);
			const m = BigInteger.parse(4);
			
			Dom.get(HTMLInputElement, "demo_id_2").value = checkParam("p", "" + p);
			Dom.get(HTMLInputElement, "demo_id_3").value = checkParam("q", "" + q);
			Dom.get(HTMLInputElement, "demo_id_4").value = checkParam("m", "" + m);
			
			return { p, q, m };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const p = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_2").value);
			const q = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_3").value);
			const m = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_4").value);
			
			return { p, q, m };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { p, q, m } = vars;
			
			type Number = number | BigInteger;
			const LIMIT = 200;
			const variables: ("p" | "q" | "m")[] = ["p", "q", "m"];
			function calc_coprimes(n: BigInteger): [BigInteger[], boolean]{
				let list: BigInteger[] = [BigInteger.ONE];
				let limited = false;
				for(let i = BigInteger.TWO; n.comp(i) > 0; i = i.add(1)){
					if(n.gcm(i).equals(BigInteger.ONE)){
						list.push(i);
						if(list.length >= LIMIT){
							limited = true;
							break;
						}
					}
				}
				return [list, limited];
			}
			
			function uniq(items: BigInteger[]): BigInteger[]{
				const result: BigInteger[] = [];
				let prev = BigInteger.parse(-1);
				for(const v of items){
					if(v.comp(prev) != 0){
						result.push(v);
						prev = v;
					}
				}
				return result;
			}
			
			function phi(n: BigInteger){
				const factors = uniq(n.factorize());
				let num = BigInteger.ONE;
				let den = BigInteger.ONE;
				for(const p of factors){
					num = num.mul(p.sub(1));
					den = den.mul(p);
				}
				return n.mul(num).div(den);
			}
			const tbody1 = Dom.elem("tbody");
			const tbody2 = Dom.elem("tbody");
			const bq1 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody1), Dom.elem("table", tbody2));
			const n = p.mul(q.toNumber());
			const gcm_pa = p.gcm(m);
			const gcm_qa = q.gcm(m);
			const gcm_pq = p.gcm(q);
			
			const prim_p = p.isPrime();
			const prim_q = q.isPrime();
			const prim_a = m.isPrime();
			
			const [coprimes, limited] = calc_coprimes(n);
			const is_coprime = gcm_pq.equals(BigInteger.ONE);
			
			const x_list: BigInteger[] = [];
			const x_list0: string[] = [];
			for(const coprime of coprimes){
				x_list0.push("" + m + " \\cdot " + coprime + "\\ \\% \\ " + n);
				x_list.push(coprime.mul(m).mod(n));
			}
			const x_list_sorted = x_list.concat([]);
			x_list_sorted.sort((a, b)=> a.comp(b));
			const x_list_uniq = uniq(x_list_sorted);
			
			for(let i = 0; i < variables.length; i ++){
				let v: "p" | "q" | "m" = variables[i];
				const tr = Dom.tr(Dom.td("$" + v + "$"), Dom.td("$ = $"), Dom.td("$" + vars[v] + "$"));
				if(vars[v].isPrime()){
					tr.appendChild(Dom.td("$(" + v + "は素数)$"));
				}
				tbody1.appendChild(tr);
			}
			let items1: ["p" | "q" | "m", "p" | "q" | "m", BigInteger][] = [
				["p", "q", gcm_pq],
				["q", "m", gcm_qa],
				["p", "m", gcm_pa],
			];
			for(let i = 0; i < items1.length; i ++){
				let m = items1[i][0];
				let b = items1[i][1];
				let g = items1[i][2];
				const tr = Dom.tr(Dom.elem("td","$" + m + "$"), Dom.td("$と$"), Dom.td("$" +  b + "$"), Dom.td("$ の 最大公約数は、" + g + "$"));
				if(g.equals(BigInteger.ONE)){
					tr.appendChild(Dom.td("$(" + m + "$ と $" + b + " は互いに素)$"));
				}
				tbody2.appendChild(tr);
			}
			set_value("demo_id_6", bq1);
			if(prim_p && prim_q && !p.equals(q)){
				show_branch("demo_id_7");
				
				const x = p.sub(BigInteger.ONE).mul(q.sub(BigInteger.ONE));
				const y = m.pow(x);
				const z = p.mul(q);
				
				let yStr = y.toString();
				if(yStr.length > 60){
					yStr = yStr.substring(0, 20) + " \\cdots (" + (yStr.length - 40) + "桁省略) \\cdots " + yStr.substring(yStr.length - 20);
				}
				set_value("demo_id_8", m);
				set_value("demo_id_9", p);
				set_value("demo_id_10", q);
				set_value("demo_id_11", p);
				set_value("demo_id_12", q);
				set_value("demo_id_13", m);
				set_value("demo_id_14", x);
				set_value("demo_id_15", z);
				set_value("demo_id_16", yStr);
				set_value("demo_id_17", z);
				set_value("demo_id_18", y.mod(z));
			}
			else{
				show_branch("demo_id_19");
				
			}
			set_value("demo_id_21", p);
			set_value("demo_id_22", q);
			const tbody3 = Dom.elem("tbody");
			const bq2 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody3));
			let items2: [string, string, BigInteger, BigInteger][] = [
				["p", "q", p, q],
				["q", "p", q, p],
			];
			const exps: Lib.Dom.DomItem[][] = [];
			for(let i = 0; i < items2.length; i ++){
				const [sym, sym2, v1, v2] = items2[i];
				const exp1 = [sym];
				const exp2 = ["" + v1];
				let limited = false;
				for(let j = BigInteger.parse(2); j.comp(v2) < 0; j = j.add(1)){
					exp1.push("" + j + "{" + sym + "}");
					exp2.push("" + (v1.mul(j)));
					if(j.comp(LIMIT) >= 0){
						limited = true;
						break;
					}
				}
				tbody3.appendChild(Dom.tr(Dom.td({ className: "top" }, "$pq 未満の" + sym + "の倍数:$"), Dom.td(format_set(exp1, limited)), Dom.td("$(" + sym + " に " + sym2 + " 未満の自然数を掛けたもの" + v2.sub(1) + "個)$")));
				tbody3.appendChild(Dom.tr(Dom.td({ className: "top right" }, "$=$"), Dom.td(format_set(exp2, limited))));
			}
			set_value("demo_id_23", bq2);
			const num_coprimes = phi(p.mul(q));
			const length_match = p.sub(1).mul(q.sub(1)).equals(num_coprimes);
			const coprime_set = format_set(coprimes, limited);
			Dom.appendClass(coprime_set, "demo-typeset");
			set_value("demo_id_25", p);
			set_value("demo_id_26", q);
			set_value("demo_id_27", n);
			set_value("demo_id_28", coprime_set);
			set_value("demo_id_29", n);
			set_value("demo_id_30", num_coprimes);
			set_value("demo_id_31", length_match ? "=" : Dom.em("\ne"));
			set_value("demo_id_32", p);
			set_value("demo_id_33", q);
			if(is_coprime){
				show_branch("demo_id_34");
				
			}
			else{
				show_branch("demo_id_35");
				
				if(!length_match){
					show_branch("demo_id_36");
					
				}
				else{
					show_branch("demo_id_37");
					
				}
			}
			set_value("demo_id_39", n);
			set_value("demo_id_40", m);
			set_value("demo_id_41", n);
			set_value("demo_id_42", m);
			set_value("demo_id_43", format_set(x_list0, limited));
			set_value("demo_id_44", format_set(x_list, limited));
			const exp_tbody = Dom.elem("tbody", 
				Dom.elem("tr", Dom.td("$C(" + n + ")$"), Dom.td("$=$"), Dom.td(format_set(coprimes, limited))),
				Dom.elem("tr", Dom.td("$X(" + n + ", " + m + ")$"), Dom.td("$=$"), Dom.td(format_set(x_list_sorted, limited)))
			);
			const exp_table = Dom.elem("table", { className: "demo-typeset" }, exp_tbody);
			let x_list_match: boolean;
			if(x_list.length == x_list_uniq.length){
				show_branch("demo_id_46");
				
				if(!limited){
					show_branch("demo_id_47");
					
				}
				else{
					show_branch("demo_id_48");
					
				}
				x_list_match = true;
				for(let i = 0; i < coprimes.length; i ++){
					if(coprimes[i].comp(x_list_sorted[i]) != 0){
						x_list_match = false;
						break;
					}
				}
			}
			else{
				show_branch("demo_id_49");
				
				if(!limited){
					show_branch("demo_id_50");
					
					set_value("demo_id_51", n);
					set_value("demo_id_52", m);
				}
				else{
					show_branch("demo_id_53");
					
					set_value("demo_id_54", n);
					set_value("demo_id_55", m);
				}
				exp_tbody.appendChild(Dom.tr(Dom.td(), Dom.td("$=$"), Dom.td(format_set(x_list_uniq, limited))));
				x_list_match = false;
			}
			
			set_value("demo_id_56", exp_table);
			if(x_list_match){
				show_branch("demo_id_57");
				
			}
			else{
				show_branch("demo_id_58");
				
				if(limited && q.mul(p).gcm(m).comp(BigInteger.ONE) == 0){
					show_branch("demo_id_59");
					
				}
				else{
					show_branch("demo_id_60");
					
				}
			}
		}
		
		Lib.MathDemo.register(["demo_id_0", "demo_id_20", "demo_id_24", "demo_id_38", "demo_id_45"], "demo_id_1", "demo_id_5", initialize, reload, update);
	}
}
