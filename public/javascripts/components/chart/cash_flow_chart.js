
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};
if(!kakeibo.component.chart) kakeibo.component.chart = {}; // namespace

kakeibo.component.chart.CashFlowChart = function(params){
	this.m_title = params.title;
	this.m_render_to = params.render_to;
	this.m_num_cols = params.num_cols;
	this.m_year = 0;
	this.m_month = 0;
	
	this.initChartObject();
	this.setDate(params.year, params.month);
	//this.update();
}


kakeibo.component.chart.CashFlowChart.prototype =
	Object.create(kakeibo.component.chart.AbstractChart.prototype);


kakeibo.component.chart.CashFlowChart.prototype.initChartObject = function(){
	var series = [];
	this.m_category_id_list = [];

	{
		series.push({
			name: "資産合計",
			data: []
		});
		this.m_category_id_list.push(kakeibo.category_set.getAccountSum().getId());
		series.push({
			name: "支出合計",
			data: []
		});
		this.m_category_id_list.push(kakeibo.category_set.getDebtorSum().getId());
		series.push({
			name: "収入合計",
			data: []
		});
		this.m_category_id_list.push(kakeibo.category_set.getCreditorSum().getId());
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


kakeibo.component.chart.CashFlowChart.prototype.setDate = function(year, month){
	this.m_year = year;
	this.m_month = month;
	
	var pair = this.createXAxisArray(this.m_year, this.m_month, this.m_num_cols);
	this.m_x_axis = pair[0];
	this.m_chart.xAxis[0].setCategories(pair[1]);
}


kakeibo.component.chart.CashFlowChart.prototype.update = function(){
	for(var i = 0; i < this.m_chart.series.length; i++){
		var series = this.m_chart.series[i];
		var data = new Array(this.m_num_cols);
		for(var j = 0; j < this.m_num_cols; j++){
			var cell = kakeibo.model.SummaryTable.getCell(
				this.m_x_axis[j][0],
				this.m_x_axis[j][1],
				this.m_category_id_list[i]
			);
			if(cell == null){
				data[j] = 0;
			}
			else if(this.m_category_id_list[i] == kakeibo.category_set.getAccountSum().getId()){
				data[j] = cell.getBalance();
			}
			else{
				data[j] = cell.getSumAmount();
			}
		}
		series.setData(data, false);
	}
	this.m_chart.redraw();
}


kakeibo.component.chart.CashFlowChart.prototype.setSize = function(width, height){
	this.m_chart.setSize(width, height, false);
}


kakeibo.component.chart.CashFlowChart.prototype.destroy = function(){
	this.m_chart.destroy();
}
