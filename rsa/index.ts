/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const p = BigInteger.parse(5268573307);
			const q = BigInteger.parse(3734091287);
			const e = BigInteger.parse(65537);
			
			Dom.get(HTMLInputElement, "prime_p").value = checkParam("p", "" + p);
			Dom.get(HTMLInputElement, "prime_q").value = checkParam("q", "" + q);
			Dom.get(HTMLInputElement, "demo_id_2").value = checkParam("e", "" + e);
			
			return { p, q, e };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const p = BigInteger.parse(Dom.get(HTMLInputElement, "prime_p").value);
			const q = BigInteger.parse(Dom.get(HTMLInputElement, "prime_q").value);
			const e = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_2").value);
			
			return { p, q, e };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { p, q, e } = vars;
			
			function str_to_bi_list(str: string, law: BigInteger){
				let utf8str = unescape(encodeURIComponent(str));
				let num = BigInteger.ZERO;
				let bi256 = BigInteger.parse(256);
				for(let i = utf8str.length - 1; i >= 0; i --){
					let code = utf8str.charCodeAt(i);
					num = num.mul(bi256).add(BigInteger.parse(code));
				}
				let list = [];
				while(!num.isZero()){
					let div = num.divmod(law);
					list.push(div.rem);
					num = div.quo;
				}
				return list;
			}
			
			function bi_list_to_str(list: BigInteger[], law: BigInteger){
				let num = BigInteger.ZERO;
				for(let i = list.length - 1; i >= 0; i --){
					num = num.mul(law).add(list[i]);
				}
				let utf8str = "";
				let bi256 = BigInteger.parse(256);
				while(!num.isZero()){
					let div = num.divmod(bi256);
					utf8str += String.fromCharCode(div.rem.toNumber());
					num = div.quo;
				}
				try{
					return decodeURIComponent(escape(utf8str));
				}catch(e){
					return null;
				}
			}
			
			function create_n_digits_random_number(max_int: BigInteger, n: number){
				while(true){
					let p = max_int.random();
					if(p.toString().length == n){
						return p;
					}
				}
			}
			const primeMakeButton = Dom.get(HTMLInputElement, "make_primes_submit");
			function create_random_primes(event: MouseEvent){
				const inputs = [ Dom.get(HTMLInputElement, "prime_p"), Dom.get(HTMLInputElement, "prime_q") ];
				const calc_button1 = Dom.get(HTMLInputElement, "calc_button1");
				const calc_button2 = Dom.get(HTMLInputElement, "calc_button2");
				primeMakeButton.disabled = true;
				calc_button1.disabled = true;
				calc_button2.disabled = true;
				inputs[0].disabled = true;
				inputs[1].disabled = true;
			
				const primeDigits = Dom.get(HTMLInputElement, "make_primes_digits");
				let n = parseInt(primeDigits.value);
				if(typeof(n) != "number" || !(n > 0)){
					n = 1;
				}
				primeDigits.value = "" + n;
				let max_int_str = "1";
				for(let i = 0; i < n; i ++){
					max_int_str += "0";
				}
				const max_int = BigInteger.parse(max_int_str);
			
				let i = 0;
				let p: BigInteger | undefined = undefined;
				
				function calc_next(){
					if(i >= inputs.length){
						primeMakeButton.disabled = false;
						calc_button1.disabled = false;
						calc_button2.disabled = false;
					}else{
						const num = create_n_digits_random_number(max_int, n);
						inputs[i].value = "" + num;
						if(num.isPrime()){
							inputs[i].disabled = false;
							i ++;
						}
						setTimeout(calc_next, 1);
					}
				}
				calc_next();
			}
			primeMakeButton.onclick = create_random_primes;
			primeMakeButton.disabled = false;
			const N = p.mul(q);
			const L = p.sub(BigInteger.ONE).mul(q.sub(BigInteger.ONE));
			const d = calcInv(e, L);
			const link = Dom.elem("a", { href: "3_inverse_element.html#L=" + L + ",A=" + e }, "こちら");
			set_value("demo_id_3", link);
			set_value("demo_id_4", p);
			set_value("demo_id_5", p.isPrime() ? "" : "ではない");
			set_value("demo_id_6", q);
			set_value("demo_id_7", q.isPrime() ? "" : "ではない");
			set_value("demo_id_8", N);
			set_value("demo_id_9", L);
			set_value("demo_id_10", e);
			set_value("demo_id_11", e.gcm(L).equals(BigInteger.ONE) ? "" : "ではない");
			if(d !== null){
				show_branch("demo_id_12");
				
				set_value("demo_id_13", d);
				set_value("demo_id_14", e);
				set_value("demo_id_15", d);
				set_value("demo_id_16", L);
				set_value("demo_id_17", e.mul(d).mod(L));
			}
			else{
				show_branch("demo_id_18");
				
			}
			set_value("demo_id_20", p);
			set_value("demo_id_21", q);
			set_value("demo_id_22", e);
			set_value("demo_id_23", e);
			set_value("demo_id_24", N);
			if(d !== null){
				show_branch("demo_id_25");
				
				set_value("demo_id_26", d);
			}
			else{
				show_branch("demo_id_27");
				
			}
			{
				function initialize(checkParam: (name: string, defaultValue: string)=> string){
					const message = "RSA暗号方式のデモ";
					
					Dom.get(HTMLInputElement, "demo_id_30").value = checkParam("message", "" + message);
					
					return { message };
				}
				
				function reload(): ReturnType<typeof initialize>{
					const message = Dom.get(HTMLInputElement, "demo_id_30").value;
					
					return { message };
				}
				
				function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
					const { message } = vars;
					
					function makeExpA(a: BigInteger, b: BigInteger, l: BigInteger){
						return Dom.elem("a", { href: "6_exponential.html#a=" + a + ",b=" + b + ",l=" + l }, "$" + a + "^{" + b + "} \\ \\% \\ " + l + "$");
					}
					const m = str_to_bi_list(message, N);
					
					const c: BigInteger[] = [];
					const r: BigInteger[] = [];
					const m_tbody = Dom.elem("tbody");
					const c_tbody = Dom.elem("tbody");
					const r_tbody = Dom.elem("tbody");
					let match = (d !== null);
					for(let i = 0; i < m.length; i ++){
						const j = i + 1;
						c[i] = m[i].pow(e, N);
						
						m_tbody.appendChild(tr("m_" + j, "=", "" + m[i]));
						c_tbody.appendChild(tr("c_" + j, "=", "m_" + j + "^e", "\\%", "N", "=", makeExpA(m[i], e, N), "=", c[i].toString()));
						if(d !== null){
							r[i] = c[i].pow(d, N);
							if(!r[i].equals(m[i])){
								match = false;
							}
							r_tbody.appendChild(tr("r_" + j, "=", "c_" + j + "^d", "\\%", "N", "=", makeExpA(c[i], d, N), "=", r[i].toString()));
						}
					}
					let d_strs: Lib.Dom.DomItem[] = [];
					if(d !== null){
						const d_str_tmp = bi_list_to_str(r, N);
						if(d_str_tmp !== null){
							d_strs.push(d_str_tmp);
							if(!match){
								d_strs.push(Dom.elem("span", {style: {color: "red"}}, " 【エラー】$p$ か$q$ が素数ではないため、復号に失敗"));
							}
						}else{
							d_strs.push(Dom.elem("span", {style: {color: "red"}}, " 【エラー】 UTF-8として文字列への復号に失敗(おそらく、$p$ か $q$ が素数ではない)"));
						}
					}else{
						const message = "適切な $\\displaystyle d=e^{-1}$ を求められないため復号不可能";
						r_tbody.appendChild(Dom.elem("tr", Dom.elem("td", { className: "demo-typeset" }, message)));
						d_strs.push(Dom.span(message));
					}
					const r_message = Dom.span({ className: "demo-typeset" }, d_strs);
					
					set_value("demo_id_31", m_tbody);
					
					set_value("demo_id_32", c_tbody);
					
					set_value("demo_id_33", r_tbody);
					set_value("demo_id_34", r_message);
				}
				
				Lib.MathDemo.register(["demo_id_28"], "demo_id_29", "calc_button2", initialize, reload, update);
			}
		}
		
		Lib.MathDemo.register(["demo_id_0", "demo_id_19"], "demo_id_1", "calc_button1", initialize, reload, update);
	}
}
