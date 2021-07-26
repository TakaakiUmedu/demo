/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.dragdrop.ts"/>
/// <reference path="../mylib/mylib.color.ts"/>
/// <reference path="../mylib/mylib.task.ts"/>

{
	const Dom = Lib.Dom;
	const FontSize = 24;
	const execute_button = null;
	const image_area = null;
	
	const Colors: Lib.Color.RGB[] = ["r", "g", "b"];
	
	class RemoveBackground{
		private readonly canvas: HTMLCanvasElement;
		private readonly context: CanvasRenderingContext2D;
		private imagedata : null | ImageData = null;
		private readonly elems = Dom.collect(
			Image, ["result_image"], 
			HTMLElement, ["image_area", "picked_color"],
			HTMLAnchorElement, ["download"],
			HTMLInputElement, ["execute_button", "r", "g", "b"],
			HTMLSelectElement, ["background_mode"]
		);
		private original_image: HTMLImageElement | null = null;
		
		public constructor(){
			const canvas = Dom.canvas2D();
			
			this.canvas = canvas.canvas;
			this.context = canvas.context;
			this.canvas.width = this.elems.result_image.offsetWidth;
			this.canvas.height = this.elems.result_image.offsetHeight;
			
			this.context.font = FontSize + "px 'sans serif'";
			this.context.textAlign = "center";
			this.context.fillStyle = "black";
			this.context.fillText("ここに画像をドラッグ&ドロップ", this.canvas.width / 2, this.canvas.height / 2);
			this.context.fillText("Drag & drop an image here", this.canvas.width / 2, this.canvas.height / 2 + FontSize);
			
			this.elems.result_image.src = this.canvas.toDataURL();
			
			this.elems.execute_button.addEventListener("click", this.process_image, false);
			Lib.set_image_drop(this.elems.result_image, this.drag_drop);
			this.elems.result_image.addEventListener("mousemove", this.view_color, false);
			this.elems.result_image.addEventListener("click", this.pick_color, false);
			
			this.elems.background_mode.addEventListener("change", this.change_background, false);
			
			for(const color of Colors){
				this.elems[color].addEventListener("keyup", this.color_change, false);
			}
			this.color_change();
		}
		
		private to8bits(value: number): number{
			value = Math.round(value);
			if(value < 0){
				return 0;
			}else if(value > 255){
				return 255;
			}else{
				return value;
			}
		}
	
		private calc_min_a(c0: number, c1: number): number{
			// a2 = (c1 - c0) / (c2 - c0)
			if(c0 == c1){
				return 0;
			}else if(c1 > c0){
				return (c1 - c0) / (255 - c0);
			}else{
				return (c1 - c0) / (0 - c0);
			}
		}
	
		private readonly drag_drop = (event: Event, image: HTMLImageElement)=> {
			this.elems.result_image.src = image.src;
			this.elems.result_image.style.width = image.naturalWidth + "px";
			this.elems.result_image.style.height = image.naturalHeight + "px";
		
			this.original_image = image;
			this.elems.execute_button.disabled = false;
	
			this.canvas.width = this.original_image.naturalWidth;
			this.canvas.height = this.original_image.naturalHeight;
			this.canvas.style.width = this.canvas.width + "px";
			this.canvas.style.height = this.canvas.height + "px";
			this.context.drawImage(this.original_image, 0, 0);
			this.imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		}

		private readonly process_image = ()=> {
			if(this.imagedata === null || this.original_image === null){
				return;
			}
			const col = this.get_rgb();
			const r0 = col.r;
			const g0 = col.g;
			const b0 = col.b;
			
			Dom.clear(this.elems.image_area);
			this.elems.image_area.appendChild(this.canvas);
			
			this.elems.execute_button.disabled = true;
			this.elems.download.style.visibility = "hidden";
			
			let i = 0;
			const imagedata = this.imagedata;
			const origina_image = this.original_image;
			Lib.asynchronousIterateNumber(imagedata.height, (y)=> {
				for(let x = 0; x < imagedata.width; x ++){
					const r1 = imagedata.data[i];
					const g1 = imagedata.data[i + 1];
					const b1 = imagedata.data[i + 2];
					const a1 = imagedata.data[i + 3];
					
					if(a1 == 255){
						// r1 = r0 * (1 - a2) + r2 * a2
						// g1 = g0 * (1 - a2) + g2 * a2
						// b1 = b0 * (1 - a2) + b2 * a2
		
						// a2 = (r1 - r0) / (r2 - r0)
						// a2 = (g1 - g0) / (g2 - g0)
						// a2 = (b1 - b0) / (b2 - b0)
		
						const a2_1 = this.calc_min_a(r0, r1);
						const a2_2 = this.calc_min_a(g0, g1);
						const a2_3 = this.calc_min_a(b0, b1);
						const a2 = Math.max(a2_1, a2_2, a2_3);
						
						const r2 = (r1 - r0 * (1 - a2)) / a2;
						const g2 = (g1 - g0 * (1 - a2)) / a2;
						const b2 = (b1 - b0 * (1 - a2)) / a2;
						
						imagedata.data[i    ] = this.to8bits(r2);
						imagedata.data[i + 1] = this.to8bits(g2);
						imagedata.data[i + 2] = this.to8bits(b2);
						imagedata.data[i + 3] = this.to8bits(255 * a2);
					}
					i += 4;
				}
				this.context.putImageData(imagedata, 0, 0, 0, y, imagedata.width, 1);
			}, ()=> {
				this.elems.execute_button.disabled = false;
				const url = this.canvas.toDataURL();
				this.elems.result_image.src = url;
				this.elems.download.href = this.canvas.toDataURL();
				this.elems.download.style.visibility = "visible";
				Dom.clear(this.elems.image_area);
				this.elems.image_area.appendChild(this.elems.result_image);
				this.context.drawImage(origina_image, 0, 0);
				this.imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			}, 1, 1, 0);
		}
		
		private get_color_value(name: Lib.Color.RGB){
			const col = Math.round(parseInt(this.elems[name].value));
			if(col < 0){
				return 0;
			}else if(col > 255){
				return 255;
			}else{
				return col;
			}
		}
		
		private get_rgb(){
			return new Lib.Color(
				this.get_color_value("r"),
				this.get_color_value("g"),
				this.get_color_value("b")
			);
		}
		
		private readonly color_change = ()=> {
			if(this.elems.background_mode.value == "specified"){
				this.set_background_color(this.get_rgb().toString());
			}
		}
		
		private readonly get_color = (event: MouseEvent)=> {
			if(this.imagedata != null){
				const x = Math.round(event.offsetX), y = Math.round(event.offsetY);
				if(x >= 0 && x < this.imagedata.width && y >= 0 && y < this.imagedata.height){
					const index = (this.imagedata.width * y + x) * 4;
					return {
						r: this.imagedata.data[index],
						g: this.imagedata.data[index + 1],
						b: this.imagedata.data[index + 2]
					};
				}
			}
			return null;
		}
	
		private readonly pick_color = (event: MouseEvent)=> {
			const color = this.get_color(event);
			if(color != null){
				for(const c of Colors){
					this.elems[c].value = "" + color[c];
				}
			}
		}
	
		private readonly view_color = (event: MouseEvent)=> {
			let value;
			const color = this.get_color(event);
			if(color != null){
				value = "(" + color.r + "," + color.g + "," + color.b + ")";
			}else{
				value = "(0,0,0)";
			}
			Dom.setText(this.elems.picked_color, value);
		}
		private set_background_color(col: string){
			this.elems.result_image.style.background = col;
			this.canvas.style.background = col;
		}
	
		private readonly change_background = ()=> {
			if(this.elems.background_mode.value == "specified"){
				this.set_background_color(this.get_rgb().toString());
			}else if(this.elems.background_mode.value == "transparent"){
				this.set_background_color("url('transparent.png')");
			}else{
				this.set_background_color(this.elems.background_mode.value);
			}
		}
	}
	Lib.executeOnLoad(()=>{
		new RemoveBackground();
	});
}
