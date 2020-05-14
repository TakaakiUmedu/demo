/// <reference path="./lib.ts" />

namespace Lib{
	class Suspend{
		public static readonly Suspend = new Suspend();
		private constructor(){
		}
	}
	class Complete{
		public static readonly Complete = new Complete();
		private constructor(){
		}
	}
	class Break{
		public static readonly Break = new Break();
		private constructor(){
		}
	}
	export const SUSPEND = Suspend.Suspend;
	export const COMPLETE = Complete.Complete;
	export const BREAK = Break.Break;
	
	type Task<T> = (item: T)=> void | Break;
	type Proc = ()=> void;
	
	type NextItemFunc<T> = ()=> T | Suspend | Complete;
	
	export class AsynchronousTask<T>{
		private num_process = 0;
		public constructor(private readonly func: Task<T>, private readonly next_item: NextItemFunc<T> , private readonly complete = Lib.do_nothing, private readonly parallel_count = 1, private readonly sequential_count = 1, private readonly wait = 0){
		}
		private readonly proc = ()=> {
			this.num_process --;
			for(let i = 0; this.sequential_count == 0 || i < this.sequential_count; i ++){
				const item = this.next_item();
				if(item instanceof Complete){
					if(this.num_process == 0){
						this.complete();
					}
					return;
				}else if(item instanceof Suspend){
					return;
				}else{
					if(this.func(item) === BREAK){
						if(this.num_process == 0){
							this.complete();
						}
						return;
					}
				}
			}
			this.start_process(this.wait);
		}
		public start_process(wait: number = 0){
			this.num_process ++;
			setTimeout(this.proc, wait);
		}
		public wake(){
			while(this.num_process < this.parallel_count){
				this.start_process();
			}
		}
	}
	
	
	export class AsynchronousProcessQueue<T>{
		private readonly task: AsynchronousTask<T>;
		private readonly queue: (T | Complete)[] = [];
		private available = true;
		private executing = true;
		public readonly next_item = ()=>{
			if(this.executing){
				const item = this.queue.shift();
				if(item){
					if(item instanceof Complete){
						this.executing = false;
					}
					return item;
				}else{
					return SUSPEND;
				}
			}else{
				return COMPLETE;
			}
		}
		public constructor(func: Task<T>, complete? : Proc, parallel_count? : number, sequential_count? : number, wait? : number){
			this.queue = [];
			this.task = new AsynchronousTask(func, this.next_item, complete, parallel_count, sequential_count, wait);
		}
		private checkAvailable(){
			if(!this.available){
				throw "queue already completed";
			}
		}
		public push(item : T){
			this.checkAvailable();
			this.queue.push(item);
			this.task.wake();
		}
		public complete(){
			this.checkAvailable();
			this.queue.push(Complete);
			this.available = false;
		}
	}
	
	class Iterator{
		private index = 0;
		public constructor(private readonly count: number){
		}
		public readonly next_item = ()=> {
			if(this.index < this.count){
				return this.index++;
			}else{
				return COMPLETE;
			}
		}
	}
	
	class ArrayIterator<T>{
		private index = 0;
		public constructor(private readonly items: T[]){
		}
		public readonly next_item = ()=> {
			if(this.index < this.items.length){
				return this.items[this.index++];
			}else{
				return COMPLETE;
			}
		}
	}

	export function asynchronousExec<T>(target: NextItemFunc<T> | number | string | T[], func: Task<T>, complete?: Proc, parallel_count = 1, sequential_count = 1, wait = 0){
		let next_item_func: NextItemFunc<T>;
		if(typeof target === "string"){
			next_item_func = new Iterator(parseInt(target)).next_item;
		}else if(typeof target === "number"){
			next_item_func = new Iterator(target).next_item;
		}else if(typeof target === "function"){
			next_item_func = target;
		}else{
			next_item_func = new ArrayIterator(target).next_item;
		}
		let task = new AsynchronousTask(func, next_item_func, complete, parallel_count, sequential_count, wait);
		task.wake();
	}

/*
	export function asynchronousExecF<T>(next_item: NextItemFunc<T> , func: Task<T>, complete?: Proc, parallel_count = 1, sequential_count = 1, wait = 0){
		let task = new AsynchronousTask(func, next_item, complete, parallel_count, sequential_count, wait);
		task.wake();
	}

	export function asynchronousExecN(count: number | string, func: Task<number>, complete?: Proc, parallel_count = 1, sequential_count = 1, wait = 0){
		if(typeof(count) == "string"){
			count = parseInt(count);
		}
		asynchronousExecF(new Iterator(count).next_item, func, complete, parallel_count, sequential_count, wait);
	}
	

	export function asynchronousExecA<T>(items: T[] , func: Task<T>, complete?: Proc, parallel_count = 1, sequential_count = 1, wait = 0){
		asynchronousExecF(new ArrayIterator(items).next_item, func, complete, parallel_count, sequential_count, wait);
	}*/
	
	export type VariableIntervalTick = (interval: number) => number | null;
	export type FixedIntervalTick = (interval: number) => void;
	
	export abstract class IntervalTaskBase{
		private canceled = false;
		private prev_tick: number;
		public constructor(){
			this.prev_tick = new Date().getTime();
		}
		
		protected abstract readonly tick: VariableIntervalTick;
		
		private readonly exec = ()=> {
			if(this.canceled){
				return;
			}
			const cur_time = new Date().getTime();
			
			let next_interval = this.tick(cur_time - this.prev_tick);
			if(next_interval === null){
				this.cancel();
				return;
			}
			if(this.canceled){
				return;
			}
			if(next_interval < 1){
				next_interval = 1;
			}
			this.prev_tick = cur_time;
			setTimeout(this.exec, next_interval);
		}
		
		public cancel(){
			this.canceled = true;
		}
		public start(){
			this.exec();
		}
	}
	export class VariableIntervalTask extends IntervalTaskBase{
		public constructor(protected readonly tick: VariableIntervalTick){
			super();
		}
		public static start(tick: VariableIntervalTick){
			const task = new VariableIntervalTask(tick);
			task.start();
			return task;
		}
	}

	export abstract class FixedIntervalTaskBase extends IntervalTaskBase{
		protected abstract readonly fixed_tick: FixedIntervalTick;
		
		public constructor(protected readonly interval: number){
			super();
			if(this.interval <= 0){
				throw "interval (=" + interval + ") must be positive";
			}
		}
		protected readonly tick = (interval: number)=> {
			this.fixed_tick(interval);
//			return this.interval * 2 - interval;
			return this.interval;
		}
	}
	export class FixedIntervalTask extends FixedIntervalTaskBase{
		public constructor(protected readonly fixed_tick: FixedIntervalTick, public readonly interval: number){
			super(interval);
		}

		public static start(tick: FixedIntervalTick, interval: number){
			const task = new FixedIntervalTask(tick, interval);
			task.start();
			return task;
		}
	}
	
	interface UniqueTask<T extends object>{
		readonly target: T;
	}
	
	type UniqueVariableIntervalTick<T> = (target: T, interval: number)=> number | null;
	type UniqueFixedIntervalTick<T> = (target: T, interval: number)=> void;
	
	class UniqueVariableIntervalTask<T extends object> extends IntervalTaskBase implements UniqueTask<T>{
		protected readonly tick = (interval: number)=> {
			return this.unique_tick(this.target, interval);
		}
		public constructor(public readonly manager: UniqueTaskManager, public readonly target: T, private readonly unique_tick: UniqueVariableIntervalTick<T>){
			super();
		}
		public cancel(){
			super.cancel();
			this.manager.canceled(this);
		}
	}
	
	abstract class UniqueIntervalTaskBase<T extends object> extends FixedIntervalTaskBase implements UniqueTask<T>{
		protected readonly fixed_tick = (interval: number)=> {
			this.unique_tick(this.target, interval);
		}
		protected readonly unique_tick: UniqueFixedIntervalTick<T>;
		public constructor(public readonly manager: UniqueTaskManager, public readonly target: T, interval: number){
			super(interval);
		}
		public cancel(){
			super.cancel();
			this.manager.canceled(this);
		}
	}

	class UniqueIntervalTask<T extends object> extends UniqueIntervalTaskBase<T>{
		public constructor(public readonly manager: UniqueTaskManager, public readonly target: T, protected readonly unique_tick: UniqueFixedIntervalTick<T>, interval: number){
			super(manager, target, interval);
		}
	}
	
	
	export class UniqueTaskManager{
		private tasks: (IntervalTaskBase & UniqueTask<object>) [] = [];
		public constuctor(){
		}
		
		public canceled<T extends object>(task: UniqueTask<T>){
			this.remove_task(task.target);
		}
		
		public start_task<T extends object>(task: IntervalTaskBase & UniqueTask<T>){
			this.remove_task(task.target);
			this.tasks.push(task);
			task.start();
		}
		
		private remove_task<T extends object>(target: T){
			for(let i = 0; i < this.tasks.length; i ++){
				const task = this.tasks[i];
				if(task.target === target){
					this.tasks.splice(i, 1);
					task.cancel();
					return;
				}
			}
		}
		
		public start_variable<T extends object>(target: T, tick: UniqueVariableIntervalTick<T>){
			this.start_task(new UniqueVariableIntervalTask(this, target, tick));
		}
		public start_fixed<T extends object>(target: T, tick: UniqueFixedIntervalTick<T>, interval: number): void{
			this.start_task(new UniqueIntervalTask(this, target, tick, interval));
		}
		
		public forEachTask(func: (task: IntervalTaskBase & UniqueTask<object>)=> undefined | Complete): boolean{
			for(let i = 0; i < this.tasks.length; i ++){
				if(func(this.tasks[i]) === COMPLETE){
					return true;
				}
			}
			return false;
		}
		public cancelAll(){
			for(let i = 0; i < this.tasks.length; i ++){
				this.tasks[i].cancel();
			}
		}
		

		/*
		public addTask(task: IntervalTaskBase){
			this.tasks.push(task);
			this.tick_one(task);
		}
		public addIntervalTick(task: IntervalTick, interval: number){
			this.addTask(new IntervalTask(task, interval));
		}
		public addVariableTick(task: VariableTick, interval: number){
			this.addTask(new IntervalTask(task, interval));
		}
		public forEachTask(func: (task: IntervalTaskBase)=> undefined | Complete){
			for(let i = 0; i < this.tasks.length; i ++){
				if(func(this.tasks[i]) === COMPLETE){
					return true;
				}
			}
			return false;
		}
		*/
	}
	type FadeCallback<T extends object> = (target: T, alpha: number)=> void;
	type FadeComplete<T extends object> = (target: T)=> void;
	
	class FaderTask<T extends object> extends UniqueIntervalTaskBase<T>{
		private fade: FadeCallback<T>;
		private complete: FadeComplete<T> | undefined;
		private alpha: number;
		private speed: number;
		public constructor(manager: UniqueTaskManager, target: T, interval: number, time: number, fade: FadeCallback<T>, initial_alpha: number, complete?: FadeComplete<T>){
			super(manager, target, interval);
			this.alpha = initial_alpha;
			this.setParams(time, fade, complete);
		}
		protected readonly unique_tick = (target: T, interval: number)=>{
			let alpha = this.alpha + interval * this.speed;
			if(alpha >= 1.0){
				alpha = 1;
			}else if(alpha <= 0.0){
				alpha = 0;
			}
			this.alpha = alpha;
			this.fade(target, this.alpha);
			
			if(this.speed > 0 && alpha == 1 || this.speed < 0 && alpha == 0){
				if(this.complete){
					this.complete(this.target);
				}
				this.cancel();
			}
		}
		public setParams(time: number, fade: FadeCallback<T>, complete?: FadeComplete<T>){
			this.speed = 1.0 / time;
			this.fade = fade;
			this.complete = complete;
		}
	}

	export class Fader<T extends object>{
		private readonly manager: UniqueTaskManager;
		public constructor(private readonly interval: number, manager?: UniqueTaskManager){
			if(manager){
				this.manager = manager;
			}else{
				this.manager = new UniqueTaskManager();
			}
		}
		
		private start(target: T, time: number, fade: FadeCallback<T>, initial_alpha: number, complete?: FadeComplete<T>): FaderTask<T>{
			const task = new FaderTask<T>(this.manager, target, this.interval, time, fade, initial_alpha, complete);
			this.manager.start_task(task);
			return task;
		}
		
		public fade_in(target: T, time: number, fade: FadeCallback<T>, initial_alpha: number = 0, complete?: FadeComplete<T>): FaderTask<T>{
			return this.start(target, time, fade, initial_alpha, complete);
		}
		public fade_out(target: T, time: number, fade: FadeCallback<T>, initial_alpha: number = 1, complete?: FadeComplete<T>): FaderTask<T>{
			return this.start(target, -time, fade, initial_alpha, complete);
		}
		public stop(target: T){
			this.manager.forEachTask((t: UniqueTask<object>)=> {
				if(t instanceof FaderTask){
					if(t.target === target){
						t.cancel();
						return COMPLETE;
					}
				}
				return undefined;
			});
		}
		public cancelAll(){
			this.manager.cancelAll();
		}
	}
	
	class ComposedCallback<T>{
		public constructor(private readonly callback1: (target: T)=> void, private readonly callback2: (target: T)=> void){
		}
		public callback = (target: T)=> {
			this.callback1(target);
			this.callback2(target);
		}
	}
	/*
	class ElementFaderTask{
		public constructor(private readonly complete1: FadeComplete<T>, private readonly complete2: FadeComplete<T>){
		}
		public complete: FadeComplete<T> = (element: HTMLElement) => {
			this.complete1(element);
			this.complete2(element);
		}
	}*/
	
	export class ElementFader{
		private readonly fader: Fader<HTMLElement>;
		public constructor(interval: number, manager?: UniqueTaskManager){
			this.fader = new Fader<HTMLElement>(interval, manager);
		}
		private static fade(target: HTMLElement, alpha: number){
			target.style.opacity = "" + alpha;
		}
		private static fade_in_complete(target: HTMLElement){
			target.style.opacity = "";
		}
		private static fade_out_complete(target: HTMLElement){
			target.style.display = "none";
			target.style.opacity = "";
		}

		public fade_in(target: HTMLElement, time: number, complete?: FadeComplete<HTMLElement>){
			let initial_alpha;
			if(target.style.display == "none" || target.style.visibility == "hidden"){
				initial_alpha = 0;
				target.style.display = "";
				target.style.visibility = "visible";
			}else if(target.style.opacity === null || target.style.opacity == ""){
				if(complete){
					complete(target);
				}
				return
			}else{
				initial_alpha = parseFloat(target.style.opacity);
			}
			
			if(complete){
				complete = new ComposedCallback(ElementFader.fade_in_complete, complete).callback;
			}else{
				complete = ElementFader.fade_in_complete;
			}
			return this.fader.fade_in(target, time, ElementFader.fade, initial_alpha, complete);
		}
		public fade_out(target: HTMLElement, time: number, complete?: FadeComplete<HTMLElement>){
			if(target.style.display == "none" || target.style.visibility == "hidden"){
				target.style.display = "none";
				if(complete){
					complete(target);
				}
				return;
			}
			let initial_alpha: number;
			if(target.style.opacity === null || target.style.opacity == ""){
				initial_alpha = 1;
			}else{
				initial_alpha = parseFloat(target.style.opacity);
			}

			if(complete){
				complete = new ComposedCallback(ElementFader.fade_out_complete, complete).callback;
			}else{
				complete = ElementFader.fade_out_complete;
			}
			return this.fader.fade_out(target, time, ElementFader.fade, initial_alpha, complete);
		}
		public fade_after_load = (target: HTMLImageElement, time: number, onload_callback: FadeComplete<HTMLImageElement>, fade_in_callback: FadeComplete<HTMLImageElement>)=> {
			Lib.execute_on_load((target: HTMLImageElement)=> {
				onload_callback(target);
				this.fade_in(target, time, fade_in_callback);
			}, target);
/*			let task = function(){
				if(onload_callback != null){
					onload_callback(target);
				}
				this.fade_in(target, time, fade_in_callback);
			}
			if(target.complete){
				task();
			}else{
				target.addEventListener("load", task, true);
			}*/
		};
		public stop(target: HTMLElement){
			this.fader.stop(target);
		}
		public cancelAll(){
			this.fader.cancelAll();
		}
	}

}
