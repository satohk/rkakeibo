var kakeibo; //namespace

if(!kakeibo) kakeibo = {};

kakeibo.utils = {};

kakeibo.utils.addFigure = function(str) {
	var num = new String(str).replace(/,/g, "");
	while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
	return num;
}


kakeibo.utils.calcSummaryColDate = function(date, rhs){
	var result = {year: date.year, month: date.month};
	if(result.month == 0){
		result.year += rhs;
	}
	else{
		result.month += rhs;
		while(result.month > 12){
			result.month -= 12;
			result.year++;
		}
		while(result.month < 1){
			result.month += 12;
			result.year--;
		}
	}
	return result;
}


kakeibo.utils.isValidDate = function(date){
	if(1900 <= date.year && date.year <= 9999 && 0 <= date.month && date.month <= 12){
		return true;
	}
	return false;
}


kakeibo.utils.getCategoryColor = function(c){
	if(c.isAccount()){
		return "#B8860B";
	}
	else if(c.isCreditor()){
		return "#468847";
	}
	else{
		return "#b94a48";
	}
}
