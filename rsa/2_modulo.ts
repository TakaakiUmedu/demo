/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const a = BigInteger.parse(24);
			const b = BigInteger.parse(17);
			const c = BigInteger.parse(13);
			
			Dom.get(HTMLInputElement, "demo_id_2").value = checkParam("a", "" + a);
			Dom.get(HTMLInputElement, "demo_id_3").value = checkParam("b", "" + b);
			Dom.get(HTMLInputElement, "demo_id_4").value = checkParam("c", "" + c);
			
			return { a, b, c };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const a = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_2").value);
			const b = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_3").value);
			const c = BigInteger.parse(Dom.get(HTMLInputElement, "demo_id_4").value);
			
			return { a, b, c };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { a, b, c } = vars;
			
			set_value("demo_id_6", a);
			set_value("demo_id_7", b);
			set_value("demo_id_8", c);
			set_value("demo_id_9", a.add(b).mod(c));
			set_value("demo_id_10", a);
			set_value("demo_id_11", c);
			set_value("demo_id_12", b);
			set_value("demo_id_13", c);
			set_value("demo_id_14", c);
			set_value("demo_id_15", a.mod(c).add(b.mod(c)).mod(c));
			set_value("demo_id_16", a);
			set_value("demo_id_17", b);
			set_value("demo_id_18", c);
			set_value("demo_id_19", c);
			set_value("demo_id_20", a.add(b.mod(c)).mod(c));
			set_value("demo_id_21", a);
			set_value("demo_id_22", c);
			set_value("demo_id_23", b);
			set_value("demo_id_24", c);
			set_value("demo_id_25", a.mod(c).add(b).mod(c));
			set_value("demo_id_26", a);
			set_value("demo_id_27", b);
			set_value("demo_id_28", c);
			set_value("demo_id_29", a.sub(b).mod(c));
			set_value("demo_id_30", a);
			set_value("demo_id_31", c);
			set_value("demo_id_32", b);
			set_value("demo_id_33", c);
			set_value("demo_id_34", c);
			set_value("demo_id_35", a.mod(c).sub(b.mod(c)).mod(c));
			set_value("demo_id_36", a);
			set_value("demo_id_37", b);
			set_value("demo_id_38", c);
			set_value("demo_id_39", c);
			set_value("demo_id_40", a.sub(b.mod(c)).mod(c));
			set_value("demo_id_41", a);
			set_value("demo_id_42", c);
			set_value("demo_id_43", b);
			set_value("demo_id_44", c);
			set_value("demo_id_45", a.mod(c).sub(b).mod(c));
			set_value("demo_id_46", a);
			set_value("demo_id_47", b);
			set_value("demo_id_48", c);
			set_value("demo_id_49", a.mul(b).mod(c));
			set_value("demo_id_50", a);
			set_value("demo_id_51", c);
			set_value("demo_id_52", b);
			set_value("demo_id_53", c);
			set_value("demo_id_54", c);
			set_value("demo_id_55", a.mod(c).mul(b).mod(c).mod(c));
			set_value("demo_id_56", a);
			set_value("demo_id_57", b);
			set_value("demo_id_58", c);
			set_value("demo_id_59", c);
			set_value("demo_id_60", a.mul(b).mod(c).mod(c));
			set_value("demo_id_61", a);
			set_value("demo_id_62", c);
			set_value("demo_id_63", b);
			set_value("demo_id_64", c);
			set_value("demo_id_65", a.mod(c).mul(b).mod(c));
			const invB = calcInv(vars.b, vars.c);
			if(invB !== null){
				show_branch("demo_id_67");
				
				set_value("demo_id_68", b);
				set_value("demo_id_69", c);
				set_value("demo_id_70", invB);
				set_value("demo_id_71", b);
				set_value("demo_id_72", invB);
				set_value("demo_id_73", c);
				set_value("demo_id_74", b.mul(invB).mod(c));
			}
			else{
				show_branch("demo_id_75");
				
				set_value("demo_id_76", b);
				set_value("demo_id_77", c);
				set_value("demo_id_78", b.gcm(c));
			}
		}
		
		Lib.MathDemo.register(["demo_id_0", "demo_id_66"], "demo_id_1", "demo_id_5", initialize, reload, update);
	}
}
