/// <reference path="./mylib/mylib.dom.ts"/>
/// <reference path="./yuv_table.ts"/>
/// <reference path="./yiq_table.ts"/>

namespace ImageViewer{
	const RESULT_ID = "result";
	const DIALOG_ID = "dialog";

	const CAPTION_BAR_HEIGHT = 48;
	const MARGIN = 10;
	const BORDER = 5;
	const BORDER_WIDTH = 2;
	
	const Dom = Lib.Dom;

	function create_image(src: string, width?: number | null | undefined, height?: number | null | undefined){
		var image = Dom.elem("img", {src: src});
		if(width !== undefined && width !== undefined){
			image.style.width = width + "px";
		}
		if(height !== undefined && height !== undefined){
			image.style.height = height + "px";
		}
		return image;
	}
	
	
	class CanvasWrapper{
		public readonly canvas: HTMLCanvasElement;
		public readonly context: CanvasRenderingContext2D;
		private imageData: ImageData | null = null;
		public constructor(public readonly width: number, public readonly height: number, image?: HTMLImageElement | null | undefined){
			const canvas = Dom.canvas2D({width: width, height: height, style: {width: width + "px", height: height + "px"}});
			this.canvas = canvas.canvas;
			this.context = canvas.context;
			if(image){
				this.context.drawImage(image, 0, 0, width, height);
			}
		}
		public getImageData(left?: number | null | undefined, top?: number | null | undefined, width?: number | null | undefined, height?: number | null | undefined){
			if(left === null || left === undefined){
				left = 0;
			}
			if(top === null || top === undefined){
				top = 0;
			}
			if(width === null || width === undefined){
				width = this.canvas.width;
			}
			if(height === null || height === undefined){
				height = this.canvas.height;
			}
			this.imageData = this.context.getImageData(left, top, width, height);
			return this.imageData.data;
		}
		public putImageData(){
			if(this.imageData){
				this.context.putImageData(this.imageData, 0, 0);
			}
		}
		public toImage(){
			return create_image(this.canvas.toDataURL(), this.width, this.height);
		}
		public clear(){
			this.context.clearRect(0, 0, this.width, this.height);
		}
	}

	type DecomposeInfo = {
		images: HTMLImageElement[],
		decomposer: Decomposer,
		recomped: boolean,
	};
	
	type ColorFunc = (pos: number)=> string;
	
	class ImageViewer{
		private readonly resultTable: HTMLTableElement = Dom.getElementWithType<HTMLTableElement>(HTMLTableElement, RESULT_ID);
		private readonly elem = Dom.combineTables(
			Dom.getElements("compose_menu"),
			Dom.getInputs("mosaic_size")
		);
		private currentImage: HTMLImageElement | null = null;
		private width = 0;
		private height = 0;
		
		private readonly dialog = new Dialog()
		
		private constructor(){
			const FUNCTIONS: Lib.Hash<()=> void> = {
				monochrome: this.monochrome,
				original: this.original,
				floor: this.floor,
				reduce: this.reduce,
				mosaic: this.mosaic,
				recompose: this.recompose,
				rgb: this.rgb,
				cmy: this.cmy,
				cmyk: this.cmyk,
				hsv: this.hsv,
				yuv: this.yuv,
				yiq: this.yiq,
				zoom: this.zoom,
				open: this.open,
				load: this.load
			};

			for(const name in FUNCTIONS){
				Dom.addEventListener(Dom.getElement(name), "click", ()=> {
					this.apply(FUNCTIONS[name]);
				});
			}
			
			this.resultTable.addEventListener("dragover", this.dragover, false);
			this.resultTable.addEventListener("dragleave", this.dragleave, false);
			this.resultTable.addEventListener("drop", this.drop, false);
			this.resultTable.addEventListener("click", this.click, false);
		}
		private set_current_image(image: HTMLImageElement){
			this.currentImage = image;
			this.width = Math.ceil((this.resultTable.offsetWidth - MARGIN - BORDER * 2) / 2);
			if(this.width >= this.currentImage.naturalWidth){
				this.width = this.currentImage.naturalWidth;
				this.height = this.currentImage.naturalHeight;
			}else{
				this.height = Math.ceil(this.width * this.currentImage.naturalHeight / this.currentImage.naturalWidth);
			}
			this.clear();
			this.currentImage.style.width = this.width + "px";
			this.currentImage.style.height = this.height + "px";
			this.set_click_listener(this.currentImage);
			this.append_tr(this.currentImage);
		}
	
		private set_click_listener(image: HTMLImageElement){
			image.addEventListener("click", this.click, false);
		}

		private readonly click = (event: MouseEvent)=> {
			if(this.dialog.is_shown()){
				this.dialog.hide();
			}else{
				if(event.target instanceof HTMLImageElement){
					this.dialog.show(event.pageX, event.pageY, event.target);
				}
			}
			event.preventDefault();
			event.stopPropagation();
		}
		private clear(){
			this.hide_compose_menu();
			Dom.clear(this.resultTable);
		}
	
		private decomposeInfo: DecomposeInfo | null = null;
		private hide_compose_menu(){
			this.decomposeInfo = null;
			this.elem.compose_menu.style.display = "none";
		}
		public show_compose_menu(){
			this.elem.compose_menu.style.display = "inline";
		}

		private append_tr(...items: Lib.Something[]){
			const tr = Dom.elem("tr");
			for(const item of items){
				Dom.append(tr, Dom.elem("td", null, item));
			}
			Dom.append(this.resultTable, tr);
		}
		
		public mode: "normal" | "monochrome" = "normal";
		private readonly monochrome = ()=> {
			if(this.mode === "monochrome"){
				return;
			}
			
			const canvas_wrapper = new CanvasWrapper(this.width, this.height, this.currentImage);
			const data = canvas_wrapper.getImageData();
			
			let j = 0;
			for(let y = 0; y < canvas_wrapper.height; y ++){
				for(let x = 0; x < canvas_wrapper.width; x ++){
					data[j + R] = data[j + G] = data[j + B] = round255((data[j] + data[j + G] + data[j + B]) / 3);
					data[j + A] = 255;
					j += 4;
				}
			}
			canvas_wrapper.putImageData();
	
			var new_image = canvas_wrapper.toImage();
			new_image.addEventListener("load", ()=> {
				this.set_current_image(new_image);
			}, false);
			this.mode = "monochrome";
			if(this.zoomData){
				this.zoomData.setMonochrome(true);
			}
		}

		private originalImage: HTMLImageElement | null = null;
		private readonly original = ()=> {
			if(this.originalImage !== null){
				this.set_current_image(this.originalImage);
			}
			this.mode = "normal";
			if(this.zoomData){
				this.zoomData.setMonochrome(false);
			}
		}
		
		public readonly reduce = ()=> {
			if(this.currentImage){
				this.clear();
				this.apply_reduce(this.currentImage, this.reduce_simple);
			}
		}
		public readonly floor = ()=> {
			if(this.currentImage){
				this.clear();
				this.apply_reduce(this.currentImage, this.reduce_floor);
			}
		}
		
		public static initialize(){
			new ImageViewer();
		}

		private waitingForDraw = false;
		
		private apply(func: ()=> void){
			this.dialog.hide();
			if(this.waitingForDraw){
				alert("描画中です。終了まで操作できません");
				return;
			}
			if(func != this.zoom && this.zoomData){
				this.stop_zoom();
			}
			if(this.currentImage != null){
				func();
			}
		}
		private readonly reduce_simple = (dataO: Uint8ClampedArray, dataT: Uint8ClampedArray, d: number)=> {
			if(d == 1){
				return;
			}
			let j = 0;
			const ratio = 255 / (Math.floor(256 / d) - 1);
			let e_r = 0, e_g = 0, e_b = 0;
			for(let y = 0; y < this.height; y ++){
				for(let x = 0; x < this.width; x ++){
					const t_r = dataO[j] + e_r;
					const t_g = dataO[j + G] + e_g;
					const t_b = dataO[j + B] + e_b;
					
					let n_r;
					let n_g;
					let n_b;
					
					if(t_r <= 0){
						n_r = 0;
					}else if(t_r >= 256){
						n_r = 255;
					}else{
						n_r = round255(t_r / d * ratio);
					}
					if(t_g < 0){
						n_g = 0;
					}else if(t_g >= 256){
						n_g = 255;
					}else{
						n_g = round255(t_g / d * ratio);
					}
					if(t_b < 0){
						n_b = 0;
					}else if(t_b >= 256){
						n_b = 255;
					}else{
						n_b = round255(t_b / d * ratio);
					}
					
					e_r = t_r - n_r;
					e_g = t_g - n_g;
					e_b = t_b - n_b;
					dataT[j + R] = n_r;
					dataT[j + G] = n_g;
					dataT[j + B] = n_b;
					dataT[j + A] = 255;
					j += 4;
				}
			}
		}
		private readonly reduce_floor = (dataO: Uint8ClampedArray, dataT: Uint8ClampedArray, d: number)=> {
			if(d == 1){
				return;
			}
			var j = 0;
			var ratio = 255 / (round255(256 / d) - 1);
			for(var y = 0; y < this.height; y ++){
				for(var x = 0; x < this.width; x ++){
					dataT[j + R] = round255(dataO[j + R] / d * ratio);
					dataT[j + G] = round255(dataO[j + G] / d * ratio);
					dataT[j + B] = round255(dataO[j + B] / d * ratio);
					dataT[j + A] = 255;
					j += 4;
				}
			}
		}
		private apply_reduce(image: HTMLImageElement, reduce_func: (src: Uint8ClampedArray, dst: Uint8ClampedArray, d: number)=> void){
			const canvasWrapperO = new CanvasWrapper(this.width, this.height, this.currentImage);
			const draw_one = (i: number, d: number)=> {
				this.waitingForDraw = false;
				if(this.currentImage === null){
					return;
				}
				let image_t;
				if(d == 1){
					image_t = this.copy_image(this.currentImage);
				}else{
					const canvasWrapperT = new CanvasWrapper(this.width, this.height);
					
					reduce_func(canvasWrapperO.getImageData(), canvasWrapperT.getImageData(), d);
					
					canvasWrapperT.putImageData();
					
					image_t = canvasWrapperT.toImage();
					
				}
				const bar = this.draw_bar(this.width, CAPTION_BAR_HEIGHT, 256 / d, function(i){
					const c = 256 / d - 1 == 0 ? 0 : round255(i * 255 / (256 / d - 1));
					return "rgba(" + c + "," + c + "," + c + ",1.0)";
				}, "" + (8 - i) + "ビット、" + (256 / d) + "階調");
				
				this.set_click_listener(image_t);
				this.append_tr(this.copy_image(this.currentImage), image_t, Dom.br(), bar);
				
				i ++;
				d *= 2;
				if(i <= 8){
					this.waitingForDraw = true;
					setTimeout(()=> { draw_one(i, d); }, 0);
				}
			}
			
			this.waitingForDraw = true;
			draw_one(0, 1);
			
		}
		private readonly mosaic = ()=>{
			if(this.dialog.target === null){
				return;
			}
			
			const block_size = parseInt(this.elem.mosaic_size.value);
			if(block_size > 1){
				var image = new CanvasWrapper(this.width, this.height, this.dialog.target);
				var data = image.getImageData();
				
				var nx = Math.ceil(this.width / block_size);
				var ny = Math.ceil(this.height / block_size);
				var oy = 0;
				for(var by = 0; by < ny; by ++){
					var ox = 0;
					var h = (oy + block_size < this.height ? block_size : this.height - oy);
					for(var bx = 0; bx < nx; bx ++){
						var w = (ox + block_size < this.width ? block_size : this.width - ox);
						var sr = 0, sg = 0, sb = 0;
						for(var y = 0; y < h; y ++){
							var j = ((oy + y) * this.width + ox) * 4;
							for(var x = 0; x < w; x ++){
								sr += data[j];
								sg += data[j + G];
								sb += data[j + B];
								j += 4;
							}
						}
						const r = round255(sr / (h * w));
						const g = round255(sg / (h * w));
						const b = round255(sb / (h * w));
						for(var y = 0; y < h; y ++){
							var j = ((oy + y) * this.width + ox) * 4;
							for(var x = 0; x < w; x ++){
								data[j + R] = r;
								data[j + G] = g;
								data[j + B] = b;
								j += 4;
							}
						}
						ox += block_size;
					}
					oy += block_size;
				}
				image.putImageData();
				if(this.dialog.target == this.currentImage){
					this.set_current_image(image.toImage());
				}else{
					this.dialog.target.src = image.canvas.toDataURL();
				}
			}
		}
		private draw_bar(width: number, height: number, max: number, color_func: ColorFunc, message: string){
			const canvasWrapper = new CanvasWrapper(width, height);
			const context = canvasWrapper.context;
			
			for(var i = 0; i < max; i ++){
				context.fillStyle = color_func(i);
				var l = Math.round(i * width / max);
				var w = width - l;
				context.fillRect(l, 0, w, height);
			}
			
			context.font = "" + height / 2 + "px 'monospace'";
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.lineWidth = 3;
			context.strokeStyle = "black";
			context.strokeText(message, width / 2, height / 2);
			context.fillText(message, width / 2, height / 2);
			
			return canvasWrapper.canvas;
		}
		
		private copy_image(image: HTMLImageElement){
			return Dom.elem("img", {src: image.src, style: {width : image.style.width, height: image.style.height}});
		}


		private recompose = ()=> {
			if(this.decomposeInfo == null){
				return;
			}
			
			const canvasWrapperT = new CanvasWrapper(this.width, this.height);
			const dataT = canvasWrapperT.getImageData();
	
			const canvasWrapper: (CanvasWrapper | null)[] = [];
			const data: (Uint8ClampedArray | null)[] = [];
			const totalCount = this.decomposeInfo.decomposer.labels.length;
			let count = 0;
			for(let p = 0; p < totalCount; p ++){
				const checkbox = document.getElementById("recompose_" + p);
				if(checkbox instanceof HTMLInputElement && checkbox.checked){
					const wrapper = new CanvasWrapper(this.width, this.height, this.decomposeInfo.images[p]);
					canvasWrapper[p] = wrapper;
					data[p] = wrapper.getImageData();
					count ++;
				}else{
					canvasWrapper[p] = null;
					data[p] = null;
				}
			}
			if(count < 2){
				alert("合成対象を1つ以上選んで下さい");
				return;
			}
			
			let j = 0;
			const decomposed_tmp: Uint8ClampedArray = new Uint8ClampedArray(totalCount);
			const decomposed: Uint8ClampedArray = new Uint8ClampedArray(totalCount);
			const rgb: number[] = [];
			const recomp_func = this.decomposeInfo.decomposer.recompose;
			const decomp_func = this.decomposeInfo.decomposer.decompose;
			
			let prepare_funcs: (()=> void)[] = [];
			let recompose_defaults =  this.decomposeInfo.decomposer.recomp_defaults;
			let p: number;
			for(p = 0; p < totalCount; p ++){
				if(data[p] == null){
					prepare_funcs[p] = ()=> {
						decomposed[p] = recompose_defaults[p];
					};
				}else if(this.decomposeInfo.recomped){
					prepare_funcs[p] = ()=> {
						decomp_func(data[p] as any, j, decomposed_tmp, 0);
						decomposed[p] = decomposed_tmp[p];
					};
				}else{
					prepare_funcs[p] = ()=> {
						decomposed[p] = (data[p] as any)[j];
					};
				}
			}
			
			for(let y = 0; y < this.height; y ++){
				for(let x = 0; x < this.width; x ++){
					for(p = 0; p < totalCount; p ++){
						prepare_funcs[p]();
					}
					recomp_func(decomposed, 0, dataT, j);
					dataT[j + A] = 255;
					j += 4;
				}
			}
			canvasWrapperT.putImageData();
			this.open_image_window(canvasWrapperT.canvas.toDataURL());
		}
	
		private decompose(decomposer: Decomposer){
			if(this.currentImage === null){
				return;
			}
			this.clear();
			const captions = (decomposer.captions || decomposer.labels);
			
			const checkbox = document.getElementById("show_monochrome");
			const recomp = checkbox instanceof HTMLInputElement && !checkbox.checked;
			
			const canvasWrapperO = new CanvasWrapper(this.width, this.height, this.currentImage);
			const dataO = canvasWrapperO.getImageData();
	
			const canvasWrapper: CanvasWrapper[] = [];
			const data: Uint8ClampedArray[] = [];
			const decomp_count = decomposer.labels.length;
			for(let p = 0; p < decomp_count; p ++){
				canvasWrapper[p] = new CanvasWrapper(this.width, this.height);
				data[p] = canvasWrapper[p].getImageData();
			}
			
			let j = 0;
//			let rgb = {r : 0, g : 0, b : 0};
			const decomposed = new Uint8ClampedArray(decomp_count);
			const decomposed_tmp: Uint8ClampedArray[] = [];
			if(recomp){
				for(let p = 0; p < decomp_count; p ++){
					decomposed_tmp[p] = new Uint8ClampedArray(decomp_count);
					for(let q = 0; q < decomp_count; q ++){
						const value = decomposer.decomp_defaults[p][q];
						if(value !== null){
							decomposed_tmp[p][q] = value;
						}
					}
				}
			}

			const recomp2tmp: (number | null)[][] = [];
			for(let p = 0; p < decomp_count; p ++){
				recomp2tmp[p] = [];
				for(let q = 0; q < decomp_count; q ++){
					recomp2tmp[p][q] = null;
				}
			}
			for(let y = 0; y < this.height; y ++){
				for(let x = 0; x < this.width; x ++){
//					rgb.r = dataO[j + R];
//					rgb.g = dataO[j + G];
//					rgb.b = dataO[j + B];
					
					decomposer.decompose(dataO, j, decomposed, 0);
					
					if(recomp){
						if(decomposer.recompose2){
							for(let p = 0; p < decomp_count; p ++){
								recomp2tmp[p][p] = decomposed[p];
								decomposer.recompose2(recomp2tmp[p], data[p], j);
								data[p][j + A] = 255;
							}
						}else{
							for(let p = 0; p < decomp_count; p ++){
								decomposed_tmp[p][p] = decomposed[p];
								decomposer.recompose(decomposed_tmp[p], 0, data[p], j);
								data[p][j + A] = 255;
							}
						}
					}else{
						for(let p = 0; p < decomp_count; p ++){
							data[p][j + R] = data[p][j + G] = data[p][j + B] = decomposed[p];
							data[p][j + A] = 255;
						}
					}
					
					j += 4;
				}
			}
		
			const images: HTMLImageElement[] = [];
			const bars: HTMLElement[] = [];
			const rgb = new Uint8ClampedArray(3);
			const recompose_checkboxes = document.getElementById("recompose_checkboxes");
			if(recompose_checkboxes){
				Dom.clear(recompose_checkboxes);
			}
			for(let p = 0; p < decomp_count; p ++){
				canvasWrapper[p].putImageData();
				images[p] = canvasWrapper[p].toImage();
				this.set_click_listener(images[p]);
				
				bars[p] = this.draw_bar(this.width, CAPTION_BAR_HEIGHT, 255, (i: number)=> {
					if(recomp){
						if(decomposer.recompose2){
							const decomposed: (number | null)[] = [];
							for(let q = 0; q < decomp_count; q ++){
								decomposed[q] = null;
							}
							decomposed[p] = i;
							decomposer.recompose2(decomposed, rgb, 0);
						}else{
							const def = decomposer.decomp_defaults[p];
							const decomposed = new Uint8ClampedArray(decomp_count);
							for(let q = 0; q < decomp_count; q ++){
								const value = def[q];
								if(value !== null){
									decomposed[q] = value;
								}
							}
							decomposed[p] = i;
							decomposer.recompose(decomposed, 0, rgb, 0);
						}
						return "rgba(" + rgb[R] + "," + rgb[G] + "," + rgb[B] + ",1.0)";
					}else{
						return "rgba(" + i + "," + i + "," + i + ",1.0)";
					}
				}, captions[p]);
				if(recompose_checkboxes){
					recompose_checkboxes.appendChild(Dom.input("checkbox", {id: "recompose_" + p, checked: true}));
					recompose_checkboxes.appendChild(document.createTextNode(decomposer.labels[p]));
				}
			}
			
			this.append_tr(this.currentImage, [images[0], Dom.br(), bars[0]]);
			this.append_tr([images[1], Dom.br(), bars[1]], [images[2], Dom.br(), bars[2]]);
			if(decomp_count > 3){
				this.append_tr([images[3], Dom.br(), bars[3]]);
			}
			this.decomposeInfo = {images: images, decomposer: decomposer, recomped: recomp};
			this.show_compose_menu();
		}
	

		public readonly rgb = ()=> {
			this.decompose(DecomposerRGB);
		};
	
		public readonly cmy = ()=> {
			this.decompose(DecomposerCMY);
		};
	
		public readonly cmyk = ()=> {
			this.decompose(DecomposerCMYK);
		};
	
		public readonly yuv = ()=> {
			this.decompose(DecomposerYUV);
		};
		
		public readonly yiq = ()=> {
			this.decompose(DecomposerYIQ);
		};
		
		public readonly hsv = ()=> {
			this.decompose(DecomposerHSV);
		};
		
		private zoomData: ZoomData | null = null;
		
		private readonly stop_zoom = ()=>{
			if(this.zoomData){
				this.zoomData.unregister();
				this.zoomData = null;
				if(this.currentImage){
					this.set_current_image(this.currentImage);
				}
			}
		};
		
		private readonly zoom = ()=> {
			if(this.zoomData){
				this.stop_zoom();
			}else if(this.currentImage){
				this.zoomData = new ZoomData(this.width, this.height, this.currentImage, this.mode === "monochrome");
				
				this.clear();
	
				this.append_tr(this.zoomData.targetCanvasWrapper.canvas, this.zoomData.tileCanvasWrapper.canvas);
				this.resultTable.appendChild(Dom.elem("tr", null, Dom.elem("td", {colSpan: 2}, this.zoomData.numCanvasWrapper.canvas)));
				
				this.zoomData.draw_zoom(this.width / 2, this.height / 2);
			}
		};
	
		private readonly open = ()=> {
			this.dialog.hide();
			
			if(this.dialog.target){
				this.open_image_window(this.dialog.target.src);
			}
		};
		private readonly load = ()=> {
			if(this.dialog.target){
				this.set_current_image(this.dialog.target);
			}
			this.dialog.hide();
		};
		
		private windowID = 0;
		private open_image_window(src: string){
			this.windowID ++;
			const sub_window = window.open("about:blank", "画像" + this.windowID, "location=yes,resizable=yes,width=" + this.width + ",height=" + this.height);
			
			if(sub_window){
				sub_window.document.open();
				sub_window.document.writeln("<!DOCTYLE html>");
				sub_window.document.writeln("<html lang=\"ja\">");
				sub_window.document.writeln("<head/>");
				sub_window.document.writeln("<style>body,p,img{border-width:0;margin:0;padding:0;}</style>");
				sub_window.document.writeln("</head>");
				sub_window.document.writeln("<body>");
				sub_window.document.writeln("<p>");
				sub_window.document.writeln("<img id=\"img\" src=\"" + src + "\" alt=\"\" style=\"width:" + this.width + "px;height:" + this.height + "px;\">");
				sub_window.document.writeln("</p>");
				sub_window.document.writeln("</body>");
				sub_window.document.writeln("</html>");
				sub_window.document.close();
	
				const sub_img = sub_window.document.getElementById("img");
				if(sub_img){
					sub_img.addEventListener("click", ()=> {
						if(sub_window.confirm("この画像をターゲットとしてロードしますか?")){
							this.set_current_image(create_image(src, this.width, this.height));
						}
					}, false);
				}
			}
		}
		private readonly dragover = (event: DragEvent)=>{
			this.resultTable.style.borderColor = "red";
			
			event.preventDefault();
			event.stopPropagation();
			if(event.dataTransfer){
				event.dataTransfer.dropEffect = "copy";
			}
			return false;
		}
		
		private readonly dragleave = (event: DragEvent)=> {
			event.preventDefault();
			event.stopPropagation();
			if(this.originalImage != null){
				this.resultTable.style.borderColor = "transparent";
			}else{
				this.resultTable.style.borderColor = "red";
			}
			return false;
		}
	
		
		private readonly drop = (event: DragEvent)=> {
			this.mode = "normal";
			event.preventDefault();
			event.stopPropagation();
			this.resultTable.style.borderColor = "transparent";
			
			if(event.dataTransfer === null){
				return;
			}
			const files = event.dataTransfer.files;
			for(var i = 0; i < files.length; i ++){
				if(files[i].type.match(/^image\//)){
					var reader = new FileReader();
					reader.addEventListener("load", ()=> {
						if(typeof reader.result === "string"){
							const image = Dom.elem("img", {src: reader.result});
							image.addEventListener("load", ()=> {
								this.set_current_image(image);
								this.originalImage = image;
							}, false);
						}
					}, false);
					reader.readAsDataURL(files[i]);
					return;
				}
			}
			const types = event.dataTransfer.types;
			for(var i = 0; i < types.length; i ++){
				if(types[i].match(/^text$/i)){
					var data = event.dataTransfer.getData(types[i]);
					if(data != null){
						if(data.match(/^I_/)){
							const image = document.getElementById(data);
							if(image instanceof HTMLImageElement){
								this.set_current_image(image);
								return;
							}
						}else if(data.match(/^data:/i)){
							const image = Dom.elem("img", {src: data});
							image.addEventListener("load", ()=> {
								this.set_current_image(image);
								this.originalImage = image;
							}, false);
							return;
						}
					}
				}
			}
			alert("画像をダウンロードしてから、ドラッグ&ドロップして下さい");
			return false;
		}
		private readonly reload = ()=> {
			if(this.currentImage){
				this.set_current_image(this.currentImage);
			}
		}
	}
	
	class ZoomData{
		public readonly tileCanvasWrapper: CanvasWrapper;
		public readonly numCanvasWrapper: CanvasWrapper;
		public readonly targetCanvasWrapper: CanvasWrapper;
		private readonly targetImage: HTMLImageElement;
		
		private readonly tileWidth: number;
		private readonly tileHeight: number;
		
		private readonly numWidth: number;
		private readonly numHeight: number;
		
		private readonly mousemove = (event: MouseEvent)=> {
			if(event.target instanceof HTMLCanvasElement){
				const rect = event.target.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				this.draw_zoom(x, y);
			}
		};
		
		public setMonochrome(flag: boolean){
			this.monochrome = flag;
		}

		public constructor(width: number, height: number, image: HTMLImageElement, private monochrome: boolean){
			this.tileCanvasWrapper = new CanvasWrapper(width, height);
			this.numCanvasWrapper = new CanvasWrapper(width * 2 + MARGIN, height);
			this.targetCanvasWrapper = new CanvasWrapper(width, height);
			this.targetImage = image;
			
			this.tileWidth = Math.round(width / ZOOM_TILE_SIZE);
			this.tileHeight = Math.round(height / ZOOM_TILE_SIZE);
			
			this.numWidth = Math.round(width * 2 / ZOOM_NUM_SIZE);
			this.numHeight = Math.round(height / ZOOM_NUM_SIZE);
		
			this.targetCanvasWrapper.canvas.addEventListener("mousemove", this.mousemove, false);
		}
		public unregister(){
			this.targetCanvasWrapper.canvas.removeEventListener("mousemove", this.mousemove, false);
		}

		public draw_zoom(centerX: number, centerY: number){
			var contextI = this.targetCanvasWrapper.context;
			var contextT = this.tileCanvasWrapper.context;
			var contextN = this.numCanvasWrapper.context;
	
			this.targetCanvasWrapper.clear();
			this.tileCanvasWrapper.clear();
			this.numCanvasWrapper.clear();
			
			contextI.drawImage(this.targetImage, 0, 0, this.targetCanvasWrapper.width, this.targetCanvasWrapper.height);
			
			var tileLeft = Math.round(centerX - this.tileWidth / 2) + BORDER;
			var tileTop = Math.round(centerY - this.tileHeight / 2) + BORDER;
			
			var data = this.targetCanvasWrapper.getImageData(tileLeft, tileTop, this.tileWidth, this.tileHeight);
			
			var j = 0;
			var ty = 0;
			for(var y = 0; y < this.tileHeight; y ++){
				var tx = 0;
				for(var x = 0; x < this.tileWidth; x ++){
					contextT.fillStyle = "rgba(" + data[j] + "," + data[j + G] + "," + data[j + B] + ",1.0)";
					contextT.fillRect(tx, ty, ZOOM_TILE, ZOOM_TILE);
					j += 4;
					tx += ZOOM_TILE_SIZE;
				}
				ty += ZOOM_TILE_SIZE;
			}
	
			var numLeft = Math.round(centerX - this.numWidth / 2) + BORDER;
			var numTop = Math.round(centerY - this.numHeight / 2) + BORDER;
	
			var data = this.targetCanvasWrapper.getImageData(numLeft, numTop, this.numWidth, this.numHeight);
			
			var j = 0;
			var ty = 0;
			if(this.monochrome){
				contextN.font = "" + Math.round(ZOOM_NUM / 2) + "px monospace";
				contextN.textBaseline = "top";
				contextN.textAlign = "right";
				contextN.strokeStyle = "black";
				contextN.fillStyle = "white";
				contextN.lineWidth = 3;
			}else{
				contextN.font = "" + Math.round(ZOOM_NUM / 3) + "px monospace";
				contextN.textBaseline = "top";
				contextN.textAlign = "right";
				contextN.strokeStyle = "black";
				contextN.lineWidth = 3;
			}
			for(var y = 0; y < this.numHeight; y ++){
				var tx = 0;
				for(var x = 0; x < this.numWidth; x ++){
					contextN.fillStyle = "rgba(" + data[j] + "," + data[j + G] + "," + data[j + B] + ",1.0)";
					contextN.fillRect(tx, ty, ZOOM_NUM, ZOOM_NUM);
					
					if(this.monochrome){
						contextN.fillStyle = "white";
						contextN.strokeText("" + data[j], tx + ZOOM_NUM - 2, ty);
						contextN.fillText("" + data[j], tx + ZOOM_NUM - 2, ty);
					}else{
						
						contextN.fillStyle = "rgba(255,0,0,1.0)";
						contextN.strokeText("" + data[j], tx + ZOOM_NUM - 2, ty);
						contextN.fillText("" + data[j], tx + ZOOM_NUM - 2, ty);
		
						contextN.fillStyle = "rgba(0,255,0,1.0)";
						contextN.strokeText("" + data[j + G], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.33);
						contextN.fillText("" + data[j + G], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.33);
						
						contextN.fillStyle = "rgba(0,0,255,1.0)";
						contextN.strokeText("" + data[j + B], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.67);
						contextN.fillText("" + data[j + B], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.67);
					}
	
					j += 4;
					tx += ZOOM_NUM_SIZE;
				}
				ty += ZOOM_NUM_SIZE;
			}
			contextI.strokeStyle = "blue";
			contextI.lineWidth = 2;
			contextI.strokeRect(tileLeft, tileTop, this.tileWidth, this.tileHeight);
			
			contextT.strokeStyle = "blue";
			contextT.lineWidth = 2;
			contextT.strokeRect(1, 1, this.tileWidth * ZOOM_TILE_SIZE - 2, this.tileHeight * ZOOM_TILE_SIZE - 2);
	
			contextI.strokeStyle = "red";
			contextI.lineWidth = 2;
			contextI.strokeRect(numLeft, numTop, this.numWidth, this.numHeight);
	
			contextT.strokeStyle = "red";
			contextT.lineWidth = 2;
			contextT.strokeRect((numLeft - tileLeft) * ZOOM_TILE_SIZE, BORDER + (numTop - tileTop) * ZOOM_TILE_SIZE, this.numWidth * ZOOM_TILE_SIZE, this.numHeight * ZOOM_TILE_SIZE);
			
			contextN.strokeStyle = "red";
			contextN.lineWidth = 2;
			contextN.strokeRect(1, 1, this.numWidth * ZOOM_NUM_SIZE - 1, this.numHeight * ZOOM_NUM_SIZE - 1);
	
		}

	}

	const ZOOM_MARGIN = 1;

	const ZOOM_TILE = 10;
	const ZOOM_TILE_SIZE = ZOOM_TILE + ZOOM_MARGIN;
	
	const ZOOM_NUM = 48;
	const ZOOM_NUM_SIZE = ZOOM_NUM + ZOOM_MARGIN;

	class Dialog{
		private readonly dialog: HTMLElement = Dom.getElement(DIALOG_ID);
		public target: HTMLImageElement | null = null;
		
		public is_shown(){
			return this.dialog.style.display != "none";
		}

		public show(x: number, y: number, target: HTMLImageElement){
			this.dialog.style.display = "block";
			this.dialog.style.left = Math.round(x - this.dialog.offsetWidth / 2) + "px";
			this.dialog.style.top = Math.round(y - this.dialog.offsetHeight / 2) + "px";
			this.target = target;
		}
		public hide(){
			this.dialog.style.display = "none";
		}
	}
	
	const R = 0, G = 1, B = 2, RGB = 3, A = 3;
	const H = 0, S = 1, V = 2, HSV = 3;

	type Decomposer = {
		decomp_defaults: (number | null)[][],
		recomp_defaults: number[],
		decompose: (src: Uint8ClampedArray, src_index: number, dst: Uint8ClampedArray, dst_index: number)=> void,
		recompose: (src: Uint8ClampedArray, src_index: number, dst: Uint8ClampedArray, dst_index: number)=> void,
		recompose2?: (src: (number | null)[], dst: Uint8ClampedArray, dst_index: number)=> void | undefined | null,
		labels: string[],
		captions?: string[] | null | undefined,
	};
	
	const DecomposerCMY: Decomposer = {
		labels: ["C", "M", "Y"],
		captions: ["Cyan", "Magenta", "Yellow"],
		decomp_defaults: [[null, 0, 0], [0, null, 0], [0, 0, null]],
		recomp_defaults: [0, 0, 0],
		decompose: (rgb: Uint8ClampedArray, rgb_i: number, cmy: Uint8ClampedArray, cmy_i: number)=> {
			cmy[cmy_i] = 255 - rgb[rgb_i];
			cmy[cmy_i + 1] = 255 - rgb[rgb_i + G];
			cmy[cmy_i + 2] = 255 - rgb[rgb_i + B];
		},
		recompose: (cmy: Uint8ClampedArray, cmy_i: number, rgb: Uint8ClampedArray, rgb_i: number)=> {
			rgb[rgb_i] = 255 - cmy[cmy_i];
			rgb[rgb_i + G] = 255 - cmy[cmy_i + 1];
			rgb[rgb_i + B] = 255 - cmy[cmy_i + 2];
		},
	};

	const DecomposerCMYK: Decomposer = {
		labels: ["C", "M", "Y", "K"],
		captions: ["Cyan", "Magenta", "Yellow", "Key plate"],
		decomp_defaults: [[null, 0, 0, 0], [0, null, 0, 0], [0, 0, null, 0], [0, 0, 0, null]],
		recomp_defaults: [0, 0, 0, 0],
		decompose: (rgb: Uint8ClampedArray, rgb_i: number, cmyk: Uint8ClampedArray, cmyk_i: number)=> {
			const c = 255 - rgb[rgb_i];
			const m = 255 - rgb[rgb_i + G];
			const y = 255 - rgb[rgb_i + B];
			const k = (c <= m && c <= y) ? c : (m <= c && m <= y ? m : y);
			
			cmyk[cmyk_i]     = c - k;
			cmyk[cmyk_i + 1] = m - k;
			cmyk[cmyk_i + 2] = y - k;
			cmyk[cmyk_i + 3] = k;
		},
		recompose: (cmyk: Uint8ClampedArray, cmyk_i: number, rgb: Uint8ClampedArray, rgb_i: number)=> {
			const k = cmyk[cmyk_i + 3];
			rgb[rgb_i] = 255 - cmyk[cmyk_i] - k;
			rgb[rgb_i + G] = 255 - cmyk[cmyk_i + 1] - k;
			rgb[rgb_i + B] = 255 - cmyk[cmyk_i + 2] - k;
		},
	};
	
	const DecomposeFuncRGB = (rgb: Uint8ClampedArray, rgb_i: number, rgb_d: Uint8ClampedArray, rgb_d_i: number)=> {
		rgb_d[rgb_d_i] = rgb[rgb_i];
		rgb_d[rgb_d_i + G] = rgb[rgb_i + G];
		rgb_d[rgb_d_i + B] = rgb[rgb_i + B];
	};
	
	const DecomposerRGB: Decomposer = {
		labels: ["R", "G", "B"],
		captions: ["Red", "Green", "Blue"],
		decomp_defaults: [[null, 0, 0], [0, null, 0], [0, 0, null]],
		recomp_defaults: [0, 0, 0],
		decompose: DecomposeFuncRGB,
		recompose: DecomposeFuncRGB,
	};

	const DecomposerYUV: Decomposer = {
		labels: ["Y", "U", "V"],
//		decomp_defaults: [[null, 128, 128], [178, null, 0], [225, 0, null]],
		decomp_defaults: [[null, null, null], [null, null, null], [null, null, null]],
		recomp_defaults: [255, 0, 0],
		decompose: (rgb: Uint8ClampedArray, rgb_i: number, yuv: Uint8ClampedArray, yuv_i: number)=> {
			const r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
			const y = 0.299 * r + 0.587 * g + 0.114 * b;
			const u = (-0.14713 * r - 0.28886 * g + 0.436 * b + 0.436 * 255.0) / 0.872;
			const v = (0.615 * r - 0.51499 * g - 0.10001 * b + 0.615 * 255.0) / 1.23;
			
			yuv[yuv_i    ] = round255(y);
			yuv[yuv_i + 1] = round255(u);
			yuv[yuv_i + 2] = round255(v);
		},
		recompose: (yuv: Uint8ClampedArray, yuv_i: number, rgb: Uint8ClampedArray, rgb_i: number)=> {
			const y = yuv[yuv_i];
			const u = yuv[yuv_i + 1] * 0.872 - 0.436 * 255;
			const v = yuv[yuv_i + 2] * 1.23 - 0.615 * 255;
			
			let r = y + 1.13983 * v;
			let g = y - 0.39465 * u - 0.58060 * v;
			let b = y + 2.03211 * u;
			
			const max = Math.max(r, g, b);
			if(max > 255){
				const e = max - 255;
				r -= e;
				g -= e;
				b -= e;
			}
			const min = Math.min(r, g, b);
			if(min < 0){
				const e = -min;
				r += e;
				g += e;
				b += e;
			}
			
			rgb[rgb_i    ] = round255(r);
			rgb[rgb_i + G] = round255(g);
			rgb[rgb_i + B] = round255(b);
		},
		recompose2: (yuv: (number | null)[], rgb: Uint8ClampedArray, rgb_i: number)=> {
			const y = yuv[0];
			const u = yuv[1];
			const v = yuv[2];
			let col: number[];
			if(y !== null){
//				col = YUV_table_Y[y];
				col = [y, y, y];
			}else if(u !== null){
				col = YUV_table_U[u];
			}else{
				col = YUV_table_V[v as any];
			}
			rgb[rgb_i    ] = col[R];
			rgb[rgb_i + G] = col[G];
			rgb[rgb_i + B] = col[B];
		},
	};
	
	function round255(val: number){
		if(val <= 0){
			return 0;
		}else if(val >= 255){
			return 255;
		}else{
			return Math.round(val);
		}
	}

	const DecomposerYIQ: Decomposer = {
		labels: ["Y", "I", "Q"],
		decomp_defaults: [[null, 128, 128], [123, null, 137], [65, 102, null]],
		recomp_defaults: [255, 0, 0],
		decompose: (rgb: Uint8ClampedArray, rgb_i: number, yiq: Uint8ClampedArray, yiq_i: number)=> {
			const r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
			const y = 0.299  * r + 0.587  * g + 0.114  * b;
			const i = 0.5959 * r - 0.2746 * g - 0.3213 * b;
			const q = 0.2115 * r - 0.5227 * g + 0.3112 * b;
			
			yiq[yiq_i    ] = round255(y);
			yiq[yiq_i + 1] = round255((i + 0.5957 * 255) / 1.1914);
			yiq[yiq_i + 2] = round255((q + 0.5226 * 255) / 1.0452);
			
		},
		recompose: (yiq: Uint8ClampedArray, yiq_i: number, rgb: Uint8ClampedArray, rgb_i: number)=> {
			const y = yiq[yiq_i];
			const i = yiq[yiq_i + 1] * 1.1914 - 0.5957 * 255;
			const q = yiq[yiq_i + 2] * 1.0452 - 0.5226 * 255;
			
			let r = y + 0.956 * i + 0.619 * q;
			let g = y - 0.273 * i - 0.647 * q;
			let b = y - 1.106 * i + 1.703 * q;
			
			const max = Math.max(r, g, b);
			if(max > 255){
				const e = max - 255;
				r -= e;
				g -= e;
				b -= e;
			}
			const min = Math.min(r, g, b);
			if(min < 0){
				const e = -min;
				r += e;
				g += e;
				b += e;
			}
			
			rgb[rgb_i    ] = round255(r);
			rgb[rgb_i + G] = round255(g);
			rgb[rgb_i + B] = round255(b);
		},
		recompose2: (yiq: (number | null)[], rgb: Uint8ClampedArray, rgb_i: number)=> {
			const y = yiq[0];
			const i = yiq[1];
			const q = yiq[2];
			let col: number[];
			if(y !== null){
//				col = YIQ_table_Y[y];
				col = [y, y, y];
			}else if(i !== null){
				col = YIQ_table_I[i];
			}else{
				col = YIQ_table_Q[q as any];
			}
			rgb[rgb_i    ] = col[R];
			rgb[rgb_i + G] = col[G];
			rgb[rgb_i + B] = col[B];
		},
	};


	const DecomposerHSV: Decomposer = {
		labels: ["H", "S", "V"],
		captions: ["Hue(色相)", "Saturation(彩度)", "Value(明度)"],
		decomp_defaults: [[null, 255, 255], [255, null, 255], [255, 0, null]],
		recomp_defaults: [255, 255, 255],
		decompose: (rgb: Uint8ClampedArray, rgb_i: number, hsv: Uint8ClampedArray, hsv_i: number)=> {
			let r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
			let max = (r >= g && r >= b) ? r : (g >= r && g >= b ? g : b);
			let min = (r <= g && r <= b) ? r : (g <= r && g <= b ? g : b);
	
			let d = max - min;
			hsv[hsv_i + V] = round255(max);
			
			if(d == 0){
				hsv[hsv_i] = 0;
				hsv[hsv_i + S] = 0;
			}else{
				hsv[hsv_i + S] = round255(d * 255 / max);
				let h;
				if(min == b){
					h = 60 * (g - r) / d + 60;
				}else if(min == r){
					h = 60 * (b - g) / d + 180;
				}else{
					h = 60 * (r - b) / d + 300;
				}
				hsv[hsv_i] = round255(h * 256 / 360);
			}
		},
		recompose: (hsv: Uint8ClampedArray, hsv_i: number, rgb: Uint8ClampedArray, rgb_i: number)=> {
			let h = hsv[hsv_i];
			let s = hsv[hsv_i + S];
			let r, g, b;
			r = g = b = hsv[hsv_i + V];
			if (s > 0) {
				h = h * 6 / 256;
				let i = Math.floor(h);
				let f = h - i;
				switch (i) {
					default:
					case 0:
						g *= (1 - s * (1 - f) / 255);
						b *= (1 - s / 255);
						break;
					case 1:
						r *= (1 - s * f / 255);
						b *= (1 - s / 255);
						break;
					case 2:
						r *= (1 - s / 255);
						b *= (1 - s * (1 - f) / 255);
						break;
					case 3:
						r *= (1 - s / 255);
						g *= (1 - s * f / 255);
						break;
					case 4:
						r *= (1 - s * (1 - f) / 255);
						g *= (1 - s / 255);
						break;
					case 5:
						g *= (1 - s / 255);
						b *= (1 - s * f / 255);
						break;
				}
			}
			rgb[rgb_i]     = round255(r);
			rgb[rgb_i + G] = round255(g);
			rgb[rgb_i + B] = round255(b);
		},
	};

	Lib.executeOnDomLoad(ImageViewer.initialize);
}
