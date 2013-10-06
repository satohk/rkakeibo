
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};
if(!kakeibo.component.chart) kakeibo.component.chart = {}; // namespace

kakeibo.component.chart.LineChart = function(params){
	this.m_title = params.title;
	this.m_render_to = params.render_to;
	this.m_num_cols = params.num_cols;
	this.m_year = 0;
	this.m_month = 0;
	this.m_categories = params.categories;
	this.m_summary_table = params.summary_table;
	this.m_column_type = params.column_type;	// "balance" or "sum_amount"
	
	this.initChartObject();
	this.setDate(params.year, params.month);
	//this.update();
}


kakeibo.component.chart.LineChart.prototype =
	Object.create(kakeibo.component.chart.AbstractChart.prototype);


kakeibo.component.chart.LineChart.prototype.initChartObject = function(){
	var series = [];

	for(var i = 0; i < this.m_categories.length; i++){
		series.push({
			name: this.m_categories[i].getName(),
			data: []
		});
	}

    this.m_chart = new Highcharts.Chart({
        chart: {
            renderTo: this.m_render_to,
            type: 'line'
        },
        title: {
            text: this.m_title
        },
        xAxis: {categories:[]},
        yAxis: {
            title: {
               text: '金額'
            },
			labels: {
				formatter: function(){
					return kakeibo.utils.addFigure(this.value);
				}
			}
        },
        series: series
    });
}


kakeibo.component.chart.LineChart.prototype.setDate = function(year, month){
	this.m_year = year;
	this.m_month = month;
	
	var pair = this.createXAxisArray(this.m_year, this.m_month, this.m_num_cols);
	this.m_x_axis = pair[0];
	this.m_chart.xAxis[0].setCategories(pair[1]);
}


kakeibo.component.chart.LineChart.prototype.update = function(){
	for(var i = 0; i < this.m_chart.series.length; i++){
		var series = this.m_chart.series[i];
		var data = new Array(this.m_num_cols);
		for(var j = 0; j < this.m_num_cols; j++){
			var cell = this.m_summary_table.getCell(
				this.m_x_axis[j][0],
				this.m_x_axis[j][1],
				this.m_categories[i].getId()
			);
			if(cell == null){
				data[j] = 0;
			}
			else{
				if(this.column_type == "balance"){
					data[j] = cell.getBalance();
				}
				else{
					data[j] = cell.getSumAmount();
				}
			}
		}
		series.setData(data, false);
	}
	this.m_chart.redraw();
}


kakeibo.component.chart.LineChart.prototype.setSize = function(width, height){
	this.m_chart.setSize(width, height, false);
}


kakeibo.component.chart.LineChart.prototype.destroy = function(){
	this.m_chart.destroy();
}
