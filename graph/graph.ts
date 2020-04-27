/// <reference path="../mylib/mylib.graph.ts"/>

namespace GraphViewer{
	const DEFAULT = "5 6\n1 2\n2 3\n3 4\n4 5\n5 1\n3 1";
	const Dom = Lib.Dom;
	
	class CreateError extends Lib.BaseException{
	}
	class ParseError extends Lib.BaseException{
	}
	
	type Edge = [number, number];
	
	class Graph{
		private constructor(public readonly directed: boolean, public readonly weighted: boolean, public readonly n: number, public readonly matrix: number[][]){
		}
		private static matrix(n: number){
			const matrix: number[][] = [];
			for(let i = 0; i < n; i ++){
				const col: number[] = [];
				for(let j = 0; j < n; j ++){
					col.push(0);
				}
				matrix.push(col);
			}
			return matrix;
		}
		public static parseList(directed: boolean, weighted: boolean, text: string, showMessage: (message: string)=> void): Graph{
			const lines = text.split("\n").map((line)=> line.trim()).filter((line)=> line.length > 0);
			const firstLine = lines[0];
			if(firstLine === undefined){
				throw new ParseError("データがありません。");
			}
			let match = firstLine.match(/^(\d+)\s+(\d+)(.*)$/);
			if(match === null){
				throw new ParseError("1行目: 「n m」(スペースで区切った整数2つ)が必要です: " + firstLine);
			}
			const n = parseInt(match[1]);
			const m = parseInt(match[2]);
			if(match[3].length > 0){
				showMessage("1行目: 「" + n + " " + m + "」より後ろを読み飛ばします: " + match[3]);
			}
			if(lines.length - 1 < m){
				throw new ParseError("データが足りません。m = " + m + "ですが、データが" + (lines.length - 1) + "行しかありません");
			}
			const matrix = Graph.matrix(n);
			for(let i = 1; i <= m; i ++){
				const line = lines[i];
				let match = line.match(/^(\d+)\s+(\d+)(.*)$/);
				if(match === null){
					throw new ParseError((i + 1) + "行目: 「a b」(スペースで区切った整数2つ)が必要です: " + line);
				}
				const a = parseInt(match[1]);
				const b = parseInt(match[2]);
				if(a > n){
					throw new ParseError((i + 1) + "行目: a = " + a + "が n = " + n + " を越えています: " + line);
				}
				if(b > n){
					throw new ParseError((i + 1) + "行目: b = " + b + "が n = " + n + " を越えています: " + line);
				}
				let weight: number;
				if(weighted){
					match = match[3].match(/^\s*(\d+)(.*)$/);
					if(match){
						weight = parseInt(match[1]);
						if(match[2].length > 0){
							showMessage((i + 1) + "行目: 「" + a + " " + b + " " +  weight + "」より後ろを読み飛ばします: " + match[2]);
						}
					}else{
						showMessage((i + 1) + "行目: 重みがありません。1とします: " + line);
						weight = 1;
					}
				}else{
					if(match[3].length > 0){
						showMessage((i + 1) + "行目: 「" + a + " " + b + "」より後ろを読み飛ばします: " + match[3]);
					}
					weight = 1;
				}
				matrix[a - 1][b - 1] = weight;
				if(!directed){
					matrix[b - 1][a - 1] = weight;
				}
			}
			for(let i = m + 1; i < lines.length; i ++){
				showMessage((i + 1) + "行目: データが多すぎるので飛ばしました: " + lines[i]);
			}
			return new Graph(directed, weighted, n, matrix);
		}
		public static parseMatrix(directed: boolean, weighted: boolean, text: string, showMessage: (message: string)=> void): Graph{
			const lines = text.split("\n").map((line)=> line.trim()).filter((line)=> line.length > 0);
			const firstLine = lines[0];
			if(firstLine === undefined){
				throw new ParseError("データがありません。");
			}
			let match = firstLine.match(/^(\d+)(.*)$/);
			if(match === null){
				throw new ParseError("1行目: 「n」(整数1つ)が必要です: " + firstLine);
			}
			const n = parseInt(match[1]);
			if(match[2].length > 0){
				showMessage("1行目: 「" + n + "」より後ろを読み飛ばします: " + match[2]);
			}
			
			if(lines.length - 1 < n){
				throw new ParseError("データが足りません。n = " + n + "ですが、データが" + (lines.length - 1) + "行しかありません");
			}
			const matrix = Graph.matrix(n);
			for(let a = 1; a <= n; a ++){
				let count = n;
				const values = lines[a].split(/\s+/);
				if(values.length < n){
					showMessage((a + 1) + "行目: データが足りません。n = " + n + "ですが、データが" + values.length + "個しかありません");
					count = values.length;
				}
				const col = matrix[a - 1];
				for(let j = 0; j < count; j ++){
					const value = values[j];
					const b = value.match(/^\d+$/) ? parseInt(value) : null;
					if(b !== null && b >= 0){
						if(b > 0){
							if(weighted){
								col[j] = b;
							}else{
								if(b != 1){
									showMessage((a + 1) + "行目" + (j + 1) + "列目: 不正な値です。1と見なしました: " + value);
								}
								col[j] = 1;
							}
						}
					}else{
						showMessage((a + 1) + "行目" + (j + 1) + "列目: 不正な値です: " + value);
					}
				}
			}
			if(!directed){
				for(let a = 0; a < n; a ++){
					for(let b = a + 1; b < n; b ++){
						if(matrix[a][b] != matrix[b][a]){
							showMessage("接続行列の" + (a + 1) + "行" + (b + 1) + "列目と" + (a + 1) + "行" + (b + 1) + "列目が一致しません。");
						}
					}
				}
			}
			return new Graph(directed, weighted, n, matrix);
		}
		public static fromEdges(directed: boolean, n: number, edges: Edge[], maxWeight: number | undefined){
			const matrix = Graph.matrix(n);
			const weighted = maxWeight !== undefined;
			const _maxWeight = maxWeight !== undefined ? maxWeight : 1;
			for(const edge of edges){
				const a = edge[0] - 1;
				const b = edge[1] - 1;
				const w = Math.floor(Math.random() * _maxWeight) + 1;
				matrix[a][b] = w;
				if(!directed){
					matrix[b][a] = w;
				}
			}
			return new Graph(directed, weighted, n, matrix);
		}
		public equals(g: any): boolean{
			if(!(g instanceof Graph)){
				return false;
			}
			if(this.directed != g.directed || this.weighted != g.weighted || this.n != g.n){
				return false;
			}
			for(let i = 0; i < this.n; i ++){
				for(let j = 0; j < this.n; j ++){
					if(this.matrix[i][j] != g.matrix[i][j]){
						return false;
					}
				}
			}
			return true;
		}
		public forEachEdge(func: (i: number, j: number, weight: number)=> void){
			if(this.directed){
				for(let i = 0; i < this.n; i ++){
					const col = this.matrix[i];
					for(let j = 0; j < this.n; j ++){
						if(col[j] != 0){
							func(i + 1, j + 1, col[j]);
						}
					}
				}
			}else{
				for(let i = 0; i < this.n; i ++){
					const col = this.matrix[i];
					for(let j = i + 1; j < this.n; j ++){
						if(col[j] != 0){
							func(i + 1, j + 1, col[j]);
						}
					}
				}
			}
		}
		public toListText(){
			let m = 0;
			let textList: string[] = [];
			this.forEachEdge((i, j, w)=> {
				if(this.weighted){
					textList.push(i + " " + j + " " + w);
				}else{
					textList.push(i + " " + j);
				}
				m += 1;
			});
			return this.n + " " + m + "\n" + textList.join("\n") + "\n";
		}
		public toMatrixText(){
			let textMatrix = "" + this.n + "\n";
			for(let i = 0; i < this.n; i ++){
				textMatrix += this.matrix[i].join(" ") + "\n";
			}
			return textMatrix;
		}
	}
	
	class GraphViewer{
		private readonly main = Dom.getElement("main");
		public static initialize(){
			new GraphViewer();
		}
		private readonly textList: HTMLTextAreaElement;
		private readonly textMatrix: HTMLTextAreaElement;
		private readonly graph: HTMLElement;
		private readonly control: HTMLElement;
		private readonly messages: HTMLElement;
		private readonly directed: HTMLInputElement;
		private readonly weighted: HTMLInputElement;
		private readonly acyclic: HTMLInputElement;
		private readonly nodeCount: HTMLInputElement;
		private readonly edgeCount: HTMLInputElement;
		private readonly connected: HTMLInputElement;
		private readonly geometric: HTMLInputElement;
		private readonly minusOne: HTMLInputElement;
		private textListModified = true;
		private textMatrixModified = false;
		private constructor(){
			this.graph = Dom.elem("div", { id: "graph" }, Dom.elem("div", { className: "graph", style: { width: "640px", height: "480px" } }));
			this.textList = Dom.elem("textarea", { cols: 20, rows: 10, "onchange": ()=> this.textListModified = true }, DEFAULT);
			this.textMatrix = Dom.elem("textarea", { cols: 20, rows: 10, "onchange": ()=> this.textMatrixModified = true }, "");
			this.messages = Dom.elem("ul");
			this.directed = Dom.input("checkbox", { onchange: this.setAcyclicMode });
			this.weighted = Dom.input("checkbox");
			this.acyclic = Dom.input("checkbox", { disabled: true });
			this.nodeCount = Dom.input("text", { size: 3, value: "5" });
			this.edgeCount = Dom.input("text", { size: 3, value: "6" });
			this.connected = Dom.input("checkbox", { checked: true });
			this.geometric = Dom.input("checkbox", { checked: true });
			this.minusOne = Dom.input("checkbox", { onchange: this.minusOneChanged });
			const panel0 = Dom.elem("span", { className: "panel" }, this.group(Dom.elem("label", this.minusOne, "ノード番号を-1したものを表示")));
			const panel1 = Dom.elem("span", { className: "panel" }, 
				this.group([Dom.radioSelecter("texttype", [["list", "辺のリスト"], ["matrix", "接続行列"]], "list", this.setTextMode)]), 
				this.group(Dom.elem("label", this.directed, "有向")),
				this.group(Dom.elem("label", this.weighted, "重み付き")),
				Dom.input("button", { onclick: this.apply, value: "読み込み" })
			);
			const panel2 = Dom.elem("span", { className: "panel" }, 
				this.group(Dom.radioSelecter("graphtype", [["graph", "グラフ"], ["tree", "木"]], "graph", this.setGraphMode)), 
				this.group(["頂点の数: ", this.nodeCount]),
				this.group(["辺の数: ", this.edgeCount]),
				this.group(Dom.elem("label", { onchange: this.setConnectedMode }, this.connected, "連結")),
				this.group(Dom.elem("label", this.acyclic, "非巡回")),
				this.group(Dom.elem("label", this.geometric, "近いノード間に優先して辺を作成")),
				Dom.input("button", { onclick: this.create, value: "自動生成" })
			);
			this.control = Dom.elem("div", { id: "control" }, Dom.elem("p", panel0, panel1), Dom.elem("p", panel2), Dom.elem("div", { id: "text_message" }, Dom.elem("div", this.textList, this.textMatrix), this.messages));
			Dom.append(this.main, this.graph, this.control);
		}
		private group<content>(content: content){
			return Dom.elem("span", { className: "group"}, content);
		}
		private textMode: "list" | "matrix" = "list";
		private readonly setTextMode = (mode: "list" | "matrix")=> {
			if(this.textMode !== mode){
				const graph = this.parseText();
				if(graph){
					if(this.textMode === "list"){
						if(this.textListModified){
							this.textMatrix.value = graph.toMatrixText();
							this.textMatrixModified = false;
						}
					}else{
						if(this.textMatrixModified){
							this.textList.value = graph.toListText();
							this.textListModified = false;
						}
					}
				}
				this.textMode = mode;
			}
			if(this.textMode === "list"){
				this.textList.style.display = "";
				this.textMatrix.style.display = "none";
			}else{
				this.textList.style.display = "none";
				this.textMatrix.style.display = "";
			}
		}
		private graphMode: "graph" | "tree" = "graph";
		private readonly setGraphMode = (mode: "graph" | "tree")=> {
			this.graphMode = mode;
			this.setEdgeCountMode();
			this.setAcyclicMode();
		}
		private readonly setConnectedMode = ()=> {
			this.setEdgeCountMode();
		}
		private readonly setEdgeCountMode = ()=> {
			if(this.graphMode === "tree" && this.connected.checked){
				this.edgeCount.disabled = true;
			}else{
				this.edgeCount.disabled = false;
			}
		}
		private readonly setAcyclicMode = ()=> {
			if(this.directed.checked && this.graphMode === "graph"){
				this.acyclic.disabled = false;
			}else{
				this.acyclic.disabled = true;
			}
		}
		private parseText(): Graph | null{
			this.clearMessages();
			try{
				if(this.textMode === "list"){
					return Graph.parseList(this.directed.checked, this.weighted.checked, this.textList.value, this.message);
				}else{
					return Graph.parseMatrix(this.directed.checked, this.weighted.checked, this.textMatrix.value, this.message);
				}
			}catch(error){
				if(error instanceof ParseError){
					this.error(error.message);
					return null;
				}else{
					throw error;
				}
			}
		}
		private animator: Lib.Graph | undefined = undefined;
		private readonly apply = ()=> {
			const graph = this.parseText();
			if(graph){
				this.applyToGraph(graph);
			}
		}
		private minusOneChanged = ()=> {
			const offset = this.minusOne.checked ? -1 : 0;
			let i = 1;
			while(true){
				const node = Dom.findElement("node-" + i);
				if(node === undefined){
					break;
				}
				Dom.setText(node, "" + (i + offset));
				i += 1;
			}
		};
		private applyToGraph(g: Graph){
			if(this.animator){
				this.animator.stop();
			}
			Dom.clear(this.graph);
			const graph = Dom.elem("div", { className: "graph", style: { width: "640px", height: "480px" } });
			const edgeLists: string[][] = [[]];
			for(let i = 1; i <= g.n; i ++){
				edgeLists.push([]);
			}
			g.forEachEdge((a, b, weight)=> {
				edgeLists[a].push("node-" + (this.weighted.checked ? b + "(" + weight + ")" : "" + b));
			});
			const offset = this.minusOne.checked ? -1 : 0;
			for(let i = 1; i <= g.n; i ++){
				const edgesStr = edgeLists[i].join(" ");
				const node = Dom.elem("div", { id: "node-" + i, style: { left: "320px", top: "240px" } }, i + offset);
				if(this.directed.checked === true){
					node.dataset.linkTo = edgesStr;
				}else{
					node.dataset.linkWith = edgesStr;
				}
				Dom.append(graph, node);
			}
			Dom.append(this.graph, graph);
			this.animator = new Lib.Graph(graph);
		}
		private readonly create = ()=> {
			const n = parseInt(this.nodeCount.value);
			const m = (this.graphMode === "tree" && this.connected.checked) ? n - 1 : parseInt(this.edgeCount.value);
			const maxEdge = ((this.directed.checked && !this.acyclic.checked) ? n * (n - 1) : n * (n - 1) / 2);
			if(m > maxEdge){
				this.error("mが大きすぎます。n = " + n + "頂点の間には最大" + maxEdge + "本までしか辺を引けません");
				return;
			}
			if(this.connected.checked === true && m < n - 1){
				this.error("mが小さすぎます。n = " + n + "頂点で連結グラフを作るにはm > n - 1 = " + (n - 1) + "である必要があります");
				return;
			}
			if(this.graphMode === "tree" && m > n - 1){
				this.error("mが多きぎます。n = " + n + "頂点でツリーを作るにはm ≦ n - 1 = " + (n - 1) + "である必要があります");
				return;
			}
			const allEdges: Edge[] = [];
			for(let i = 1; i <= n; i ++){
				const list: number[] = [];
				if(this.directed.checked && !this.acyclic.checked){
					for(let j = 1; j <= n; j ++){
						if(i != j){
							allEdges.push([i, j]);
						}
					}
				}else{
					for(let j = i + 1; j <= n; j ++){
						allEdges.push([i, j]);
					}
				}
			}
			let weights: number[] = [];
			if(this.geometric.checked){
				const size = Math.ceil(Math.sqrt(n));
				const posList: Lib.Point2D[] = [];
				for(let i = 0; i < size; i ++){
					for(let j = 0; j < size; j ++){
						posList.push(new Lib.Point2D(i, j));
					}
				}
				const posTable: (Lib.Point2D | undefined)[] = [];
				posTable[1] = posList.shift();
				posTable[n] = posList.pop();
				for(let i = 2; i <= n - 1; i ++){
					posTable[i] = Lib.randomPop(posList);
				}
				for(const edge of allEdges){
					let pos1 = posTable[edge[0]];
					let pos2 = posTable[edge[1]];
					if(pos1 && pos2){
						weights.push(1 / (pos2.sub(pos1).length2()));
//						weights.push(1);
					}else{
						weights.push(1 / n); // never happen
					}
				}
			}else{
				for(const edge of allEdges){
					weights.push(1);
				}
			}
			let edges: Edge[] = [];
			for(let i = 0; i < m; i ++){
				const edge = Lib.weightedRandomPop(allEdges, weights);
				if(edge){
					edges.push(edge);
				}
			}
			
			if(this.graphMode === "tree" || this.connected.checked === true){
				edges = this.tryModifyToConnectedGraph(n, edges);
			}
			
			if(this.directed.checked && this.acyclic.checked){
				const value: number[] = [];
				for(let i = 0; i < n; i ++){
					value.push(Math.random());
				}
				const new_edges: Edge[] = [];
				for(const edge of edges){
					const a = edge[0];
					const b = edge[1];
					if(value[a - 1] > value[b - 1]){
						new_edges.push([b, a]);
					}else{
						new_edges.push(edge);
					}
				}
				edges = new_edges;
			}
			
			const graph = Graph.fromEdges(this.directed.checked, n, edges, this.weighted.checked ? n : undefined);
			
			this.textList.value = graph.toListText();
			this.textMatrix.value = graph.toMatrixText();
			this.applyToGraph(graph);
		}
		
		private tryModifyToConnectedGraph(n: number, edges: Edge[]): Edge[]{
			const graphs: number[][] = [];
			for(let i = 1; i <= n; i ++){
				graphs[i] = [i];
			}
			const needed: Edge[] = [];
			const needless: Edge[] = [];
			for(const edge of edges){
				let g0 = graphs[edge[0]];
				let g1 = graphs[edge[1]];
				if(g0[0] != g1[0]){
					needed.push(edge);
					if(g0.length < g1.length){
						const tmp = g0;
						g0 = g1;
						g1 = tmp;
					}
					g0.push(...g1);
					for(const i of g1){
						graphs[i] = g0;
					}
				}else{
					needless.push(edge);
				}
			}
			const groups: number[][] = [];
			const added: boolean[] = [];
			for(let i = 1; i <= n; i ++){
				if(added[i] !== true){
					const g = graphs[i];
					for(let j of g){
						added[j] = true;
					}
					groups.push(g);
				}
			}
			while(groups.length > 1){
				const g1 = Lib.randomPop(groups);
				const g2 = Lib.randomPop(groups);
				if(g1 === undefined || g2 == undefined){ // impossible
					break;
				}
				if(Lib.randomPop(needless) === undefined){
					break;
				}
				needed.push([Lib.randomPick(g1), Lib.randomPick(g2)]);
				groups.push(g1.concat(g2));
			}
			for(const edge of needless){
				needed.push(edge);
			}
			return needed;
		}
		
		private error(message: string){
			Dom.append(this.messages, Dom.elem("li", { className: "error" }, "エラー: " + message));
		}
		private clearMessages(){
			Dom.clear(this.messages);
		}
		private readonly message = (message: string)=> {
			Dom.append(this.messages, Dom.elem("li", message));
		}
	}

	Lib.executeOnDomLoad(GraphViewer.initialize);
}
