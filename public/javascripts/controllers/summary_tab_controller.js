

var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};


kakeibo.controller.SummaryTabController = function(context){
	var self = this;

	this.m_context = context;
	this.m_focused_date = {year:0, month:0};
	this.m_view_dirty = false;
	this.m_chart = new kakeibo.component.chart.AbstractChart();
	this.m_download_page_size = 12;
	this.m_chart_num_col = 12;
	this.initSubpane();
	this.initChart();
	this.initTables();
	this.initDateSelector();

	kakeibo.model.Setting.addUpdateListener(function(key){
		if(key == "num-summary-col"){
			var val = kakeibo.model.Setting.getInt(key);
			self.m_pl_table_view.changeNumCol(val);
			self.m_bs_table_view.changeNumCol(val);
			self.updateView();
		}
	});

	kakeibo.model.SummaryTable.addModifyTableListener(function(target){
		self.updateView();
	})

	$(window).resize(function(){
		self.adjustViewSize();
	});

	setTimeout(function(){
		self.adjustViewSize();
	}, 10);
}


kakeibo.controller.SummaryTabController.prototype.initSubpane = function(){
	var self = this;
	this.m_subpane = "";

	var onchange = function(selector_id){
		self.m_subpane_selector_id = selector_id;
		if(selector_id == "summary-pane-pl-table-button"){
			self.m_subpane = "pl-table";
		}
		else if(selector_id == "summary-pane-bs-table-button"){
			self.m_subpane = "bs-table";
		}
		else{
			self.m_subpane = "chart";
		}

		self.updateView();
		self.adjustViewSize();
	}

	this.m_subpane_controller = new kakeibo.controller.TabController("button");
	this.m_subpane_controller.addPane("summary-pane-pl-table-button", onchange);
	this.m_subpane_controller.addPane("summary-pane-bs-table-button", onchange);
	this.m_subpane_controller.addPane("summary-pane-chart-button", onchange);
	this.m_subpane_controller.changePane("summary-pane-pl-table-button");
}


kakeibo.controller.SummaryTabController.prototype.initTables = function(){
	this.m_pl_table_view = new kakeibo.component.SummaryTableView({
		category_set : kakeibo.category_set,
		summary_table : kakeibo.model.SummaryTable,
		num_col : kakeibo.model.Setting.getInt("num-summary-col"),
		container : "summary-pane-pl-table-wrapper",
		caption_budget : $("#summary-pane-caption-budget").html(),
		caption_remain : $("#summary-pane-caption-remain").html(),
		caption_category : $("#summary-pane-caption-category").html(),
		column_type: "sum_amount",
		rows_type: [kakeibo.model.CategoryType.INCOME, kakeibo.model.CategoryType.COST, kakeibo.model.CategoryType.NET_INCOME],
		show_budgets: true,
		header_format_year : $("#summary-pane-grid-header-format").attr("format_year"),
		header_format_month : $("#summary-pane-grid-header-format").attr("format_month")
	});
	this.m_bs_table_view = new kakeibo.component.SummaryTableView({
		category_set : kakeibo.category_set,
		summary_table : kakeibo.model.SummaryTable,
		num_col : kakeibo.model.Setting.getInt("num-summary-col"),
		container : "summary-pane-bs-table-wrapper",
		caption_budget : "",
		caption_remain : "",
		caption_category : $("#summary-pane-caption-category").html(),
		column_type: "balance",
		rows_type: [kakeibo.model.CategoryType.ASSETS, kakeibo.model.CategoryType.LIABILITIES, kakeibo.model.CategoryType.NET_ASSETS],
		show_budgets: false,
		header_format_year : $("#summary-pane-grid-header-format").attr("format_year"),
		header_format_month : $("#summary-pane-grid-header-format").attr("format_month")
	});

	var onclick = function(date, category_id){
		kakeibo.main_tab_controller.changePane("navbar-list-pane-selector");

		var start, end;
		if(date.month == 0){
			start = "" + date.year + "/1/1";
			end = "" + (date.year+1) + "/1/1";
		}
		else{
			var next = kakeibo.utils.calcSummaryColDate(date, 1);
			start = "" + date.year + "/" + date.month + "/1";
			end = "" + next.year + "/" + next.month + "/1";
		}

		var param = {
			start_date: start,
			end_date_under: end,
			category_id: category_id,	// debtor or creditor
		};

		var title = kakeibo.category_set.getById(category_id).getName() + " " + date.year;
		if(date.month != 0){
			title += "/" + date.month;
		}
		var btn_id = kakeibo.list_tab_controller.addSearchButton(param, title);
		$("#" + btn_id).click();
	};

	this.m_pl_table_view.addClickColumnListener(onclick);
	this.m_bs_table_view.addClickColumnListener(onclick);
}


kakeibo.controller.SummaryTabController.prototype.initDateSelector = function(){
	var self = this;

	$("#summary-pane-year-button").click(function(e){
		if($(e.target).hasClass("active") == false){
			var now = new Date();
			self.setDate({year: now.getFullYear(), month:0});
		}
	});

	$("#summary-pane-month-button").click(function(e){
		if($(e.target).hasClass("active") == false){
			var now = new Date();
			self.setDate({year: now.getFullYear(), month:now.getMonth() + 1});
		}
	});

	$("#summary-pane-prev-button").click(function(e){
		var new_date = kakeibo.utils.calcSummaryColDate(self.m_focused_date, -1);
		self.setDate(new_date);
	});

	$("#summary-pane-next-button").click(function(e){
		var new_date = kakeibo.utils.calcSummaryColDate(self.m_focused_date, 1);
		self.setDate(new_date);
	});	

	var refresh_func = function(){
		$input = $("#summary-pane-date-input");
		token = $input.val().split("/");
		
		for(var i = 0; i < token.length; i++){
			if(!token[i].match( /^[0-9]+$/ )){
				return;
			}
		}
		if(token.length != 1 && token.length != 2){
			return;
		}

		if(token.length == 1){
			if(self.setDate({year:parseInt(token[0], 10), month:0})){
				$("#summary-pane-year-button").addClass("active");
				$("#summary-pane-month-button").removeClass("active");
			}
		}
		if(token.length == 2){
			if(self.setDate({year:parseInt(token[0], 10), month:parseInt(token[1], 10)})){
				$("#summary-pane-year-button").removeClass("active");
				$("#summary-pane-month-button").addClass("active");
			}
		}
	}

	$("#summary-pane-refresh-button").click(function(e){
		refresh_func();
	});

	$("#summary-pane-date-input").keydown(function(e){
		if(e.keyCode == 13){ // Enter
			refresh_func();
			return false;
		}
	});

	setTimeout(function(e){
		$("#summary-pane-month-button").click();
	}, 10);
}


kakeibo.controller.SummaryTabController.prototype.setDate = function(new_date){
	if(kakeibo.utils.isValidDate(new_date)){
		this.m_focused_date.year = new_date.year;
		this.m_focused_date.month = new_date.month;

		var $input = $("#summary-pane-date-input");
		if(this.m_focused_date.month == 0){
			$input.val("" + this.m_focused_date.year);
		}
		else{
			$input.val("" + this.m_focused_date.year + "/" + this.m_focused_date.month);
		}

		this.m_pl_table_view.setDate(this.m_focused_date);
		this.m_bs_table_view.setDate(this.m_focused_date);
		this.m_chart.setDate(this.m_focused_date.year, this.m_focused_date.month);
		this.updateView();

		return true;
	}
	return false;
}


kakeibo.controller.SummaryTabController.prototype.updateView = function(){
	if($("#summary-pane:hidden").length != 0){
		this.m_view_dirty = true;
		return;
	}
	this.m_view_dirty = false;

	var downloading = false;

	{
		var date = kakeibo.utils.calcSummaryColDate(this.m_focused_date, -(this.m_download_page_size - 1));
		downloading = !kakeibo.model.SummaryTable.setPage(date.year, date.month, this.m_download_page_size);
	}

	if(this.m_subpane == "pl-table"){
		this.m_pl_table_view.update();
	}
	else if(this.m_subpane == "bs-table"){
		this.m_bs_table_view.update();
	}
	else{
		this.m_chart.update();
	}

	if(downloading){
		$("#summary-pane-loading-img").show();
	}
	else{
		$("#summary-pane-loading-img").hide();
	}
}


kakeibo.controller.SummaryTabController.prototype.adjustViewSize = function(){
	if($("#summary-pane:hidden").length != 0){
		return;
	}

	if(this.m_subpane == "pl-table"){
		this.adjustGridSize("summary-pane-pl-table-wrapper");
	}
	if(this.m_subpane == "bs-table"){
		this.adjustGridSize("summary-pane-bs-table-wrapper");
	}
	else{
		this.adjustChartSize();
	}
}


kakeibo.controller.SummaryTabController.prototype.adjustGridSize = function(table_id){
	var MARGIN = 20 + 40;
	var window_height = $(window).height();
	var grid = $('#' + table_id);
	var grid_top = grid.offset().top;
	grid.height(window_height - grid_top - MARGIN);
}


kakeibo.controller.SummaryTabController.prototype.initChart = function(){
	var $selector_parent = $("#summary-pane-chart-selector");
	var $selectors = $selector_parent.children().children("a");

	var self = this;
	var onclick = function(target){
		var $target = $(target);

		if($target.parent().hasClass("active")){
			return;
		}

		$("#summary-pane-chart-selector").children("li").removeClass("active");
		$target.parent().addClass("active");

		var chart_name = $target.attr("chart");
		var chart_class = kakeibo.component.chart[chart_name];

		self.m_chart.destroy();

		// init categories
		var root = kakeibo.category_set.getRoot();
		var categories = [];
		var data_type = $target.attr("data");
		var column_type;

		if(data_type == "cost"){
			for(var i = 0; i < root.getNumChildren(); i++){
				var c = root.getChild(i);
				if(c.getCategoryType() == kakeibo.model.CategoryType.COST){
					categories.push(c);
				}
			}
			column_type = "sum_amount";
		}
		else if(data_type == "assets"){
			categories.push(kakeibo.category_set.getAssetsSum());
			categories.push(kakeibo.category_set.getLiabilitiesSum());
			categories.push(kakeibo.category_set.getNetAssetsSum());
			column_type = "balance";
		}
		else if(data_type == "income-cost-sum"){
			categories.push(kakeibo.category_set.getIncomeSum());
			categories.push(kakeibo.category_set.getCostSum());
			categories.push(kakeibo.category_set.getNetIncomeSum());
			column_type = "sum_amount";
		}

		self.m_chart = new chart_class({
			title: $target.html(),
			render_to: "summary-pane-chart",
			year: self.m_focused_date.year,
			month: self.m_focused_date.month,
			num_cols: self.m_chart_num_col,
			summary_table: kakeibo.model.SummaryTable,
			categories: categories,
			column_type: column_type
		});

		self.updateView();
	}
	$selectors.click(function(e){onclick(e.target);});

	onclick($selectors[0]);
}


kakeibo.controller.SummaryTabController.prototype.adjustChartSize = function(){
	var MARGIN = 20;
	var window_height = $(window).height();
	var chart = $('#summary-pane-chart');
	var chart_top= chart.offset().top;
	chart.height(window_height - chart_top - MARGIN);

	var height = window_height - chart_top - MARGIN;
	this.m_chart.setSize(chart.width(), chart.height());
}


kakeibo.controller.SummaryTabController.prototype.onActivated = function(){
	if(this.m_view_dirty){
		this.updateView();
	}
	this.adjustViewSize();
}
