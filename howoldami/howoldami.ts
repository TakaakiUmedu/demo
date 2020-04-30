window.addEventListener("DOMContentLoaded", ()=> {
	const birthday = document.getElementById("birthday");
	const ageNode = document.getElementById("age");
	const ageText = (ageNode !== null ? ageNode.firstChild : null);
	if(birthday instanceof HTMLInputElement && ageNode !== null && ageText instanceof Text){
		const update = ()=> {
			const match: RegExpMatchArray | null = birthday.value.match(/^(\d+)-(\d\d)-(\d\d)/);
			if(match !== null){
				const [year, month, day] = match.slice(1).map((s)=> parseInt(s));
				const now = new Date();
				let age = now.getFullYear() - year;
				if((month > now.getMonth() + 1) || month == now.getMonth() + 1 && day > now.getDate()){
					age -= 1;
				}
				ageText.nodeValue = "" + age;
				ageNode.style.color = "";
			}else{
				ageText.nodeValue = "Invalid date. Date must be YYYY-MM-DD.";
				ageNode.style.color = "red";
			}
		};
		birthday.addEventListener("change", ()=>{
			window.location.hash = "#" + birthday.value;
			update();
		});
		const match: RegExpMatchArray | null = window.location.hash.match(/^#(\d+-\d\d-\d\d)/);
		if(match !== null){
			birthday.value = match[1];
			update();
		}
	}
});
