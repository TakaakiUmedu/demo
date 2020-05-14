namespace Lib{
	export function bsearch(min: number, max: number, cond: (x: number)=>boolean): number{
		if(max < min){
			return -1;
		}

		if(!cond(max)){
			return -1;
		}
		
		while(min < max){
			let mid = Math.floor((min + max) / 2);
			if(cond(mid)){
				max = mid;
			}else{
				min = mid + 1;
			}
		}
		return min;
	}
}
