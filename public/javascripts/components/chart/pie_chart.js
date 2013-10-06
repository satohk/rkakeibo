
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};
if(!kakeibo.component.chart) kakeibo.component.chart = {}; // namespace

kakeibo.component.chart.PieChart = function(params){
	this.m_title = params.title;
	this.m_render_to = params.render_to;
	this.m_num_cols = 1;//params.num_cols;
	this.m_year = 0;
	this.m_month = 0;
	this.m_categories = params.categories;
	this.m_summary_table = params.summary_table;
	this.m_column_type = params.column_type;	// "balance" or "sum_amount"
	
	this.initChartObject();
	this.setDate(params.year, params.month);
	//this.update();
}


kakeibo.component.chart.PieChart.prototype =
	Object.create(kakeibo.component.chart.AbstractChart.prototype);


kakeibo.component.chart.PieChart.prototype.initChartObject = function(){
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
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: this.m_title
        },
        tooltip: {
        	pointFormat: '{series.name}: <b>{point.percentage}%</b>',
            percentageDecimals: 1
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function() {
                        return '<b>'+ this.point.name +'</b>: '+ kakeibo.utils.addFigure(this.y) +'円';
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: this.m_title,
            data: [
            ]
        }]
    });
}


kakeibo.component.chart.PieChart.prototype.setDate = function(year, month){
	this.m_year = year;
	this.m_month = month;
}


kakeibo.component.chart.PieChart.prototype.update = function(){
	var data = [];

	for(var i = 0; i < this.m_categories.length; i++){
		var sum_cell = this.m_summary_table.getCell(this.m_year, this.m_month, this.m_categories[i].getId());
		var amount = 0;
		if(sum_cell != null){
			if(this.column_type == "balance"){
				amount = sum_cell.getBalance();
			}
			else{
				amount = sum_cell.getSumAmount();
			}
		}
		if(amount > 0){
			data.push([this.m_categories[i].getName(), amount]);
		}
	}
	console.log(data);
	this.m_chart.series[0].setData(data);
	this.m_chart.redraw();
}


kakeibo.component.chart.PieChart.prototype.setSize = function(width, height){
	this.m_chart.setSize(width, height, false);
}


kakeibo.component.chart.PieChart.prototype.destroy = function(){
	this.m_chart.destroy();
}
