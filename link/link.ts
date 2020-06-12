/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>


namespace Link{
	const Dom = Lib.Dom;
	class Main{
		public static initialize(){
			new Main();
		}
		private static readonly chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		private readonly button = Dom.getInput("button");
		private readonly visited = Dom.getInput("visited");
		private readonly output = Dom.getElement("main");
		private constructor(){
			this.button.addEventListener("click", this.create);
		}
		private readonly create = ()=> {
			Dom.clear(this.output);
			const links = [this.visited.value];
			for(let i = 0; i < 10; i ++){
				let link = "";
				for(let j = 0; j < 11; j ++){
					link += Main.chars[Math.floor(Math.random() * Main.chars.length)];
				}
				links.push(link)
			}
			for(let i = 1; i < links.length; i ++){
				const j = Math.floor(Math.random() * i);
				const tmp = links[i];
				links[i] = links[j];
				links[j] = tmp;
			}
			for(const link of links){
				const url = "https://www.youtube.com/watch?v=" + link;
				Dom.append(this.output, Dom.elem("p", Dom.elem("a", { href: url }, url )));
			}
		};
	}
	
	Lib.executeOnDomLoad(Main.initialize)
}

