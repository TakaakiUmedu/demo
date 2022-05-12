



type PrioritizedDo<T> = (priority: number)=> void;
function prioritizedExecute<T>(target: T, action: (prioritizedDo: PrioritizedDo)=> void){
	const tasks: {
		name: string,
		args: any[],
	} = [];
	const targets: T[] = [];
	
	const getTarget = (priority: number): T => {
		let pseudoTarget = targets[priority];
		if(pseudoTarget !== undefined){
			return pseudoTarget;
		}else{
			pseudoTarget = {};
			for(const name in T){
				const org = T[name];
				if(typeof(org) === "function"){
					pseudoTarget[name] = (...args: any[]) => {
						let list = tasks[priority];
						if(list === undefined){
							tasks[priority] = list = [];
						}
						list.push({name, args});
					};
				}else{
					pseudoTarget[name] = org;
				}
			}
			return targets[priority] = (T)pseudoTarget;
		}
	};
	const prioritizedDo = (priority: number, action: (target: T)=> {
		action(getTarget(priority);
	});
	
	action(prioritizedDo);
	
	for(const list of tasks){
		if(list !== undefined){
			for(const task of list){
				T[task.name].call(task.args);
			}
		}
	}
}

prioritizedExecute((prioritizedDo)=> {
	prioritizedDo(0, (target)=> {
		target.hoge(0, 1, 2);
	});
};
