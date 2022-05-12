/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>

namespace Tournament{
	const Dom = Lib.Dom;
	const SVG = Lib.SVG;
	
	const MARGIN = 20;
	const FONT_SIZE = 16;
	const INTERVAL = 33;
	
	const LINE_WIDTH = 3; // must be odd
	const PATH_WIDTH = 7; // must be odd
	
	type TreeNode = TreeBranch | TreeLeaf;
	type Point = { x: number, y: number };
	type History = Point | number;
	
	type Planes = {[p in "line" | "path" | "text"]: SVGElement};
	class Tree{
		private readonly root: TreeNode;
		private readonly  leaves: TreeLeaf[] = [];
		private competitionState: boolean[];
		public constructor(private readonly mode: "tournament" | "sum" | "fact", values: number[], dummy: boolean, private readonly type: string, private readonly speed: number, width: number, height: number, planes: Planes){
			const count = values.length;
			const nums: number[] = [];
			const tree: TreeNode[] = [];
			for(let i = 0; i < count; i ++){
				nums.push(i);
				const leaf = new TreeLeaf(i, values[i], planes);
				tree.push(leaf);
				this.leaves.push(leaf);
			}
			for(let i = 0; i < count; i ++){
				const j = i + Math.floor((count - i) * Math.random());
				if(i != j){
					const tmp = nums[i];
					nums[i] = nums[j];
					nums[j] = tmp;
				}
			}
			this.competitionState = [];
			if(dummy){
				const dummyValue = mode === "sum" ? 0 : (mode === "fact" ? 1 : -1);
				const dummyLeaf = new TreeLeaf(count, dummyValue, planes, true);
				const dummyNode = new TreeBranch(dummyLeaf, tree[0], planes);
				tree[0] = dummyNode;
				this.leaves.push(dummyLeaf);
			}
			let fair_width = count / 2;
			let j = -1;
			for(let i = 0; i < count - 1; i ++){
				if(this.type == "fair"){
					j ++;
					if(j >= fair_width){
						j = 0;
						fair_width /= 2;
					}
				}else if(this.type == "unfair"){
					j = 0;
				}else{
					j = Math.floor((tree.length - 1) * Math.random());
				}
				const newNode = new TreeBranch(tree[j], tree[j + 1], planes);
				tree[j] = newNode;
				tree.splice(j + 1, 1);
			}
			for(let i = 0; i < this.leaves.length - 1; i ++){
				this.competitionState[i] = false;
			}
			this.root = tree[0];
			
			const treeInfo = this.root.calcPositions(mode, 0, 0, width, height, []);
//			const c = Math.round(width / 2);
			Dom.append(planes.line, SVG.path("", "black", "none", { "stroke-width": LINE_WIDTH + "px", d: ["M", treeInfo.x, 0, "L", treeInfo.x, treeInfo.h].join(" ")}));
			
		}
		public updatePath(){
			let completed = true;
			const competitions: TreeLeaf[][] = [];
			for(let i = 0; i < this.leaves.length - 1; i ++){
				competitions[i] = [];
			}
			for(let i = 0; i < this.leaves.length; i ++){
				const leaf = this.leaves[i];
				const state = leaf.updatePath(this.speed / INTERVAL, competitions, this.competitionState);
				if(state === "moving"){
					completed = false;
				}else if(state !== "completed"){
					completed = false;
				}
			}

			for(let i = 0; i < competitions.length; i ++){
				const competition = competitions[i];
				if(competition.length == 2 && !this.competitionState[i]){
					this.competitionState[i] = true;
					if(this.mode !== "tournament"){
						const v0 = competition[0].getValue();
						const v1 = competition[1].getValue();
						const v = this.mode === "sum" ? v0 + v1 : v0 * v1;
						competition[0].setValue(v);
						competition[1].setValue(v);
					}
				}
			}
			return completed;
		}
	}
	
	class TreeBranch{
		private readonly line: SVGElement;
		private readonly back: SVGElement;
		public constructor(private readonly l: TreeNode, private readonly r: TreeNode, planes: Planes){
			this.line = SVG.path("", "black", "none", { "stroke-width": LINE_WIDTH + "px"});
			this.back = SVG.elem("g", null, this.line);
			Dom.append(planes.line, this.back);
		}
		public depth(): number{
			return Math.max(this.l.depth(), this.r.depth()) + 1;
		}
		public count(): number{
			return this.l.count() + this.r.count();
		}
		public max(): number{
			return Math.max(this.l.max(), this.r.max());
		}
		
		public calcPositions(mode: "tournament" | "sum" | "fact", l: number, t: number, w: number, h: number, competitions: number[]): { x: number, h: number, path: (Point | number)[] }{
			const cl = this.l.count();
			const cr = this.r.count();
			const d = this.depth();
			const ix = Math.floor(w / (cl + cr));
			const iy = Math.floor(h / d);
			const wl = ix * cl;
			const wr = ix * cr;

			const lTree = this.l.calcPositions(mode, l, t + iy, wl, h - iy, competitions);
			const rTree = this.r.calcPositions(mode, l + wl, t + iy, wr, h - iy, competitions);

			const x = Math.round((lTree.x + rTree.x) / 2);
			const b = t + iy;

			const competition = competitions.length;
			competitions.push(0);
			const newPoint0 = { x, y: b };
			const newPoint1 = { x, y: t };
			let winnerPath;
			if(mode === "tournament"){
				let loserPath;
				if(this.l.max() > this.r.max()){
					winnerPath = lTree.path;
					loserPath = rTree.path;
				}else{
					winnerPath = rTree.path;
					loserPath = lTree.path;
				}
				winnerPath.push(competition);
				winnerPath.push(newPoint0);
				winnerPath.push(newPoint1);
				loserPath.push(competition);
			}else{
				winnerPath = lTree.path;
				winnerPath.push(newPoint0);
				winnerPath.push(competition);
				winnerPath.push(newPoint1);
				rTree.path.push(newPoint0);
				rTree.path.push(competition);
				const op = mode === "sum" ? "+" : "×";
				Dom.append(this.back, SVG.elem("text", { x: "" + x, y: "" + (b + FONT_SIZE), "text-anchor": "middle", "dominant-baseline": "hanging", "font-size": FONT_SIZE + "px" }, op));
			}
			const lxl = lTree.x;
			const lxr = rTree.x;
			const hy = t + iy;
			this.line.setAttribute("d", ["M", lxl, hy + lTree.h, "L", lxl, hy, "L", lxr , hy, "L", lxr , hy + rTree.h].join(" "));
			return { h: iy, x , path: winnerPath };
		}
	}
	class TreeLeaf{
		private readonly path: SVGElement;
		private readonly text: SVGElement;
		private readonly backText: SVGElement;
		private readonly ellipse: SVGElement;
		private pathData: (number | Point)[] = [];
		private length = 0;
		public constructor(public readonly index: number, private value: number, planes: Planes, isDummy: boolean = false){
			let cl1, cb1, cl2, cb2;
			cl1 = "#7aa";
			cb1 = "#aff";
			if(isDummy){
				cl2 = "#b9b";
				cb2 = "#fdf";
			}else{
				cl2 = "#9bb";
				cb2 = "#dff";
			}
			this.path = SVG.path("", "red", "none", { "stroke-width": PATH_WIDTH + "px", "opacity": "0.5"});
			this.ellipse = SVG.ellipse(0, 0, FONT_SIZE, FONT_SIZE, cl1, cb1, { "stroke-width": "3px", "shape-rendering": "geometricPrecision" });
			this.text = SVG.elem("g", null, 
				this.ellipse,
				SVG.elem("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": FONT_SIZE + "px" }, "" + this.value)
			);
			this.backText = SVG.elem("g", null, 
				SVG.ellipse(0, 0, FONT_SIZE, FONT_SIZE, cl2, cb2, { "stroke-width": "3px", "shape-rendering": "geometricPrecision" }),
				SVG.elem("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": FONT_SIZE + "px" }, "" + this.value)
			);
			Dom.append(planes.path, this.path);
			Dom.append(planes.text, this.backText, this.text);
		}
		public getValue(){
			return this.value;
		}
		public setValue(value: number){
			this.value = value;
			const v = "" + value;
			Dom.setText(this.text, v);
			if(v.length > 2){
				this.ellipse.setAttribute("rx", Math.round(FONT_SIZE * v.length / 2.5) + "px");
			}
		}
		public depth(): number{
			return 1;
		}
		public count(): number{
			return 1;
		}
		public max(): number{
			return this.value;
		}
		public calcPositions(mode: "tournament" | "sum" | "fact", l: number, t: number, w: number, h: number, competitions: number[]): { h: number, x: number, path: (Point | number)[] }{
			const x = l + Math.round(w / 2);
			this.pathData = [
				{ x, y: t + h },
				{ x, y: t },
			];
			this.backText.setAttribute("transform", "translate(" + x + "," + (t + h) + ")");
			return { h, x, path: this.pathData };
		}
		public updatePath(dl: number, competitions: TreeLeaf[][], competitionState: boolean[]): "completed" | "waiting" | "moving"{
			let state: "completed" | "waiting" | "moving" = "completed";
			let lengthDrawn = 0;
			let px: number | undefined = undefined;
			let py: number | undefined = undefined;
			let i = 0;
			for(;i < this.pathData.length; i ++){
				const p = this.pathData[i];
				if(typeof(p) !== "number"){
					px = p.x;
					py = p.y;
					break;
				}
			}
			if(px === undefined || py === undefined){
				return "completed";
			}
			let winnerPath = "M " + px + " " + py;
			for(;i < this.pathData.length; i ++){
				const p = this.pathData[i];
				if(typeof(p) === "number"){
					if(competitionState[p] === false){
						competitions[p].push(this);
						state = "waiting";
						break;
					}
				}else{
					const dx = p.x - px;
					const dy = p.y - py;
					const l = Math.sqrt(dx * dx + dy * dy);
					lengthDrawn += l;
					if(l == 0 || lengthDrawn <= this.length){
						winnerPath += "L " + p.x + " " + p.y;
					}else{
						const r = (lengthDrawn - this.length) / l;
						px = p.x - dx * r;
						py = p.y - dy * r;
						winnerPath += "L " + px + " " + py;
						state = "moving";
						this.length += dl;
						break;
					}
					px = p.x;
					py = p.y;
				}
			}
			this.path.setAttribute("d", winnerPath);
			this.text.setAttribute("transform", "translate(" + px + "," + py + ")");
			return state;
		
		}
	}
	
	const N = 16;
	class Main{
		public static initialize(){
			new Main();
		}
		private svg: SVGElement = SVG.getSVG("svg");;
		private opts = Dom.collect(HTMLSelectElement, "speed", "type", "mode").collect(HTMLInputElement, "dummy", "random").table;
		private readonly planes: Planes;
		private constructor(){
			this.planes ={
				line:  SVG.elem("g"),
				path:  SVG.elem("g"),
				text:  SVG.elem("g"),
			};
			const top = SVG.elem("g", { "shape-rendering": "geometricPrecision", transform: "translate(" + MARGIN + "," + MARGIN + ")" });
			Dom.append(top, this.planes.line, this.planes.path, this.planes.text);
			Dom.append(this.svg, top);
			Dom.addEventListener(Dom.get(HTMLInputElement, "start"), "click", ()=>{
				this.start();
			});
			this.start();
		}
		private animTask: Promise<null> | null = null;
		private terminating = false;
		private async start(){
			if(this.animTask){
				this.terminating = true;
				await this.animTask;
				this.terminating = false;
			}
			this.animTask = this.startAnim();
		}
		private async startAnim(){
			const root = this.makeTree();
			while(!this.terminating){
				if(root.updatePath()){
					break;
				}
				await Lib.waitFor(INTERVAL);
			}
			
			return null;
		}
		private makeTree(){
			Dom.clear(this.planes.line);
			Dom.clear(this.planes.path);
			Dom.clear(this.planes.text);
			const values: number[] = [];
			for(let i = 0; i < N; i ++){
				values.push(i + 1);
			}
			if(this.opts.random.checked){
				for(let i = 0; i < N; i ++){
					const j = i + Math.floor((N - i) * Math.random());
					if(i != j){
						const tmp = values[i];
						values[i] = values[j];
						values[j] = tmp;
					}
				}
			}
			const rect = this.svg.getBoundingClientRect();
			return new Tree(this.opts.mode.value == "sum" ? "sum" : (this.opts.mode.value === "fact" ? "fact" : "tournament"), values, this.opts.dummy.checked, this.opts.type.value, parseInt(this.opts.speed.value), rect.width - MARGIN * 2, rect.height - MARGIN * 2, this.planes);
		}
		private terminate(){
			this.terminating = true;
		}
	}
	Lib.executeOnDomLoad(Main.initialize);
}
