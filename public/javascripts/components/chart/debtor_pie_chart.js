
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};
if(!kakeibo.component.chart) kakeibo.component.chart = {}; // namespace

kakeibo.component.chart.DebtorPieChart = function(params){
	this.m_title = params.title;
	this.m_render_to = params.render_to;
	this.m_num_cols = 1;//params.num_cols;
	this.m_year = 0;
	this.m_month = 0;
	
	this.initChartObject();
	this.setDate(params.year, params.month);
	//this.update();
}


kakeibo.component.chart.DebtorPieChart.prototype =
	Object.create(kakeibo.component.chart.AbstractChart.prototype);


kakeibo.component.chart.DebtorPieChart.prototype.initChartObject = function(){
	this.m_category_id_list = [];

	{
		var root = kakeibo.category_set.getRoot();

		for(var i = 0; i < root.getNumChildren(); i++){
			var category = root.getChild(i);
			if(category.isDebtor() && !category.isAccount()){
				this.m_category_id_list.push(category.getId());
			}
		}
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


kakeibo.component.chart.DebtorPieChart.prototype.setDate = function(year, month){
	this.m_year = year;
	this.m_month = month;
}


kakeibo.component.chart.DebtorPieChart.prototype.update = function(){
	var data = [];

	for(var i = 0; i < this.m_category_id_list.length; i++){
		var category_id = this.m_category_id_list[i];
		var category_name = kakeibo.category_set.getById(category_id).getName();
		var sum_cell = kakeibo.model.SummaryTable.getCell(this.m_year, this.m_month, category_id);
		var amount = 0;
		if(sum_cell != null){
			amount = sum_cell.getSumAmount();
		}
		if(amount > 0){
			data.push([category_name, amount]);
		}
	}
	console.log(data);
	this.m_chart.series[0].setData(data);
	this.m_chart.redraw();
}


kakeibo.component.chart.DebtorPieChart.prototype.setSize = function(width, height){
	this.m_chart.setSize(width, height, false);
}


kakeibo.component.chart.DebtorPieChart.prototype.destroy = function(){
	this.m_chart.destroy();
}
