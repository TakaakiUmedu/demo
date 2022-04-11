///<reference path="../mylib/mylib.ts"/>
///<reference path="../mylib/mylib.dom.ts"/>

namespace sampling{
	const Dom = Lib.Dom;
	class main{
		private readonly elems = Dom.collect(
			HTMLInputElement, ["q", "s", "x", "draw"]
		);
		public static initialize(){
			new sampling();
		}
		private constructor(){
			Dom.addEventListener(this.elems.draw, "click", ()=> {
				
			});
		}
	}
	Lib.executeOnDomLoad(()=> {
		main.initialize();
	});
}

