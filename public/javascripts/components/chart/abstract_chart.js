var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};
if(!kakeibo.component.chart) kakeibo.component.chart = {}; // namespace

kakeibo.component.chart.AbstractChart = function(params){
}

kakeibo.component.chart.AbstractChart.prototype.createXAxisArray = function(year, month, num_cols){
	var label_array = new Array(num_cols);
	var date_array = new Array(num_cols);

	var y = year;
	var m = month;
	for(var i = 0; i < num_cols; i++){
		var pt = num_cols - i - 1;

		date_array[pt] = [y, m];

		if(m == 0){
			label_array[pt] = "" + y + "年";
		}
		else if(m == 1 || pt == 0){
			label_array[pt] = "" + y + "年" + m + "月";
		}
		else{
			label_array[pt] = "" + m + "月";
		}

		if(m == 0){
			y--;
		}
		else{
			m--;
			if(m == 0){
				y--;
				m = 12;
			}
		}
	}

	return [date_array, label_array];
}


kakeibo.component.chart.AbstractChart.prototype.setDate = function(year, month){
}

kakeibo.component.chart.AbstractChart.prototype.setSize = function(width, height){
}


kakeibo.component.chart.AbstractChart.prototype.update = function(){

}

kakeibo.component.chart.AbstractChart.prototype.destroy = function(){
}
