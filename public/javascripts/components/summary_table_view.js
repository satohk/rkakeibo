
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};


kakeibo.component.SummaryTableView = function(params){

	this.m_click_column_listener = null;

	// init params
	this.m_params = {
		category_set : null,
		summary_table : null,
		num_col : 4,
		container : "",
		caption_budget : "budget",
		caption_remain : "remain",
		caption_category : "category",
		column_type: "balance",			// "balance" or "sum_amount"
		rows_type: [kakeibo.model.CategoryType.INCOME, kakeibo.model.CategoryType.COST],
		show_budgets: true,
		header_format_year : "%y",
		header_format_month : "%y/%m",
		date : {year: 2013, month: 1},
		button_col_width: 20,
		caption_col_width: 80,
		col_width: 80
	}

	for(var key in params){
		this.m_params[key] = params[key];
	}


	this.initView();
	this.setCaption();
}


kakeibo.component.SummaryTableView.prototype.initView = function(){
	var self = this;

	var show_row = function($row){
		$row.attr("style", "");
	};

	var onclick_category = function(e){
		var $target = $(e.target);
		var $row = $target.closest("tr");
		var category_id = parseInt($row.attr("category-id"), 10);
		var category = self.m_params.category_set.getById(category_id);
		if(category == null){ // sum category
			return;
		}
		var collapsed = false;

		var $img = $($row.children()[0]).children("i");
		if($img.hasClass("icon-chevron-right")){
			$img.attr("class", "icon-chevron-down clickable pull-right");
			collapsed = true;
		}
		else{
			$img.attr("class", "icon-chevron-right clickable pull-right");
		}

		for(var i = 0; i < category.getNumChildren(); i++){
			var $child_row = $("#summary-table-row-" + category.getChild(i).getId());
			if(collapsed){
				show_row($child_row);
			}
			else{
				$child_row.hide();
			}
		}
	};

	var header_html = function(caption_category, caption_budget, caption_remain, num_col, id){
		var buf =
			' <thead>' +
			'  <tr>' +
			'   <th class="text-info" width="' + self.m_params.button_col_width + '"></th>' + 
 			'   <th class="text-info" width="' + self.m_params.caption_col_width + '">' + caption_category + '</th>';
		for(var i = 0; i < num_col; i++){
			var id_str = "";
			if(i == 0 && id != ""){
				id_str = 'id="' + id + '-col0"';
			}
			buf += '  <th class="text-info" width="' + self.m_params.col_width + '" ' + id_str + '></th>';
		}
		buf += '<th class="text-info" width="' + self.m_params.col_width + '"> <div class="pull-right">' + caption_budget + '</div> </th>' +
			'<th class="text-info" width="' + self.m_params.col_width + '"> <div class="pull-right">' + caption_remain + '</div> </th>' +
			'<th class="blue text-info" width="20"> </th>' +
			'</tr>' +
			'</thead>';
		return buf;
	};

	var row_html = function(category, gray, display, num_col, clickable, bold_caption){
		var has_child = category.getNumChildren() > 0;
		var cap = category.getName();
		if(bold_caption){
			cap = "<strong>" + cap + "</strong>";
		}
		var buf =
			'<tr class="grid-row ' + (gray ? 'grid-gray-tr' : '') + ' ' + (has_child ? 'has-child' : '') + '" ' + (display ? '' : 'style="display:none"') +
			'category-id="' + category.getId() + '" id="summary-table-row-' + category.getId() + '">' +
			'<td collapse> ' + (has_child ? '<i class="icon-chevron-right clickable pull-right">' : '') + '</i> </td>' +
			'<td collapse>' + cap + '</td>';
//			'<td style="color:' + kakeibo.utils.getCategoryColor(category) + '" collapse>' + cap + '</td>';
		for(var i = 0; i < num_col; i++){
			buf += '<td ' + (clickable ? 'class="clickable"' : '') + ' col="' + i + '" ' + (clickable ? "searchable" : "") + '> - </td>';
		}
		buf += '<td></td>' +
			'<td></td>' +
			'<td></td>' +
			'</tr>';
		return buf;
	};

	var sum_category_row_html = function(category, num_col){
		var buf = '<tr class="text-info"><td height="40"></td><td style="vertical-align:bottom"><strong>' + category.getName() + '</strong></td>';
		for(var i = 0; i < num_col; i++){
			buf += '<td></td>';
		}
		buf += '<td></td>' +
			'<td></td>' +
			'<td></td>' +
			'</tr>';
		return buf;
	}

	var dummy_row_html = function(height, num_col){
		var buf = '<tr><td height="' + height + '"></td><td></td>';
		for(var i = 0; i < num_col; i++){
			buf += '<td></td>';
		}
		buf += '<td></td>' +
			'<td></td>' +
			'<td></td>' +
			'</tr>';
		return buf;
	}

	var html = '<table class="table grid-content">';

	// header
	html += header_html(this.m_params.caption_category, this.m_params.caption_budget, this.m_params.caption_remain, this.m_params.num_col, this.m_params.container + "-header");

	// body
	html += '<tbody id="' + this.m_params.container + '-body' + '">';

	// total rows
	for(var i = 0; i < this.m_params.rows_type.length; i++){
		var category = this.m_params.category_set.getSumCategoryOfType(this.m_params.rows_type[i]);
		html += row_html(category, (i+1)%2, true, this.m_params.num_col, false, false);
	}

	var root = this.m_params.category_set.getRoot();

	for(var type_index = 0; type_index < this.m_params.rows_type.length; type_index++){
		var type = this.m_params.rows_type[type_index];

		var num_categories_of_this_type = root.getNumChildrenOfType(type);
		if(num_categories_of_this_type == 0){
			continue;
		}

		var sum_category = this.m_params.category_set.getSumCategoryOfType(type);
		html += sum_category_row_html(sum_category, this.m_params.num_col);

		var row_ct = 0;
		for(var i = 0; i < root.getNumChildren(); i++){
			var parent = root.getChild(i);
			if(parent.getCategoryType() != type){
				continue;
			}
			if(num_categories_of_this_type > 1){
				html += row_html(parent, (row_ct+1) % 2, true, this.m_params.num_col, true, false);
			}
			for(var j = 0; j < parent.getNumChildren(); j++){
				var child = parent.getChild(j);
				if(num_categories_of_this_type > 1){
					html += row_html(child, (row_ct+1) % 2, false, this.m_params.num_col, true, false);
				}
				else{
					html += row_html(child, (row_ct+1) % 2, true, this.m_params.num_col, true, false);
					row_ct++;
				}
			}
			if(num_categories_of_this_type > 1){
				row_ct++;
			}
		}

		// èÉéëéYÇÃÇ∆Ç´ÇÕÅAóòâvÇí«â¡
		if(type == kakeibo.model.CategoryType.NET_ASSETS){
			html += row_html(this.m_params.category_set.getNetIncomeSum(), (row_ct+1) % 2, true, this.m_params.num_col, false, false);
		}
	}

	html += dummy_row_html(1, this.m_params.num_col);

	html += "</tbody>";
	html += "</table>";

	// add to container
	var $container = $("#" + this.m_params.container);
	$container.html(html);

	// set event
	var $collapse = $container.find("[collapse]");
	$collapse.click(onclick_category);

	//
	{
		var $searchable = $container.find("[searchable]");
		var self = this;

		$searchable.click(function(e){
			var $col = $(e.target).closest("td");
			var col_no = $col.attr("col");
			var category_id = $col.closest("tr").attr("category-id");
			var date = kakeibo.utils.calcSummaryColDate(self.m_params.date, -(self.m_params.num_col - 1 - col_no));
			console.log("col:" + col_no + "  category:" + category_id + "  year:" + date.year + "  month:" + date.month);

			var category_id_num = parseInt(category_id);
			if(isNaN(category_id_num)){
				return;
			}
			self.m_click_column_listener(date, category_id_num);
		});
		
		$searchable.hover(
			function(){
				$(this).css("background-color", "#e8e8e8");
			},
			function(){
				$(this).css("background-color", "");
			}
		);
	}
}


kakeibo.component.SummaryTableView.prototype.update = function(){
	var make_cell = function(amount, strong, color){
		var result = "";
		if(strong){result += "<strong>";}
		result += "<div class='pull-right " + color + "'>"
			+ kakeibo.utils.addFigure(amount)
			+ "</div>";
		if(strong){result += "</strong>";}
		return result;
	};

	var category_set = this.m_params.category_set;
	var summary_table = this.m_params.summary_table;
	var num_col = this.m_params.num_col;
	var $tbody = $("#" + this.m_params.container + "-body");
	var $tr_list = $tbody.children();

	for(var row = 0; row < $tr_list.length; row++){
		var $tr = $($tr_list[row]);
		var category_id = $tr.attr("category-id");
		if(typeof category_id === "undefined"){
			continue;
		}
		var $td_list = $tr.children();
		
		var text_color = "";
		if(category_id == category_set.getCostSum().getId()){
			text_color = "text-error"
		}
		else if(category_id == category_set.getIncomeSum().getId()){
			text_color = "text-success"
		}
		else if(category_id == category_set.getAssetsSum().getId()){
			text_color = "text-success"
		}
		else if(category_id == category_set.getNetAssetsSum().getId()){
			text_color = "text-success"
		}
		else if(category_id == category_set.getLiabilitiesSum().getId()){
			text_color = "text-error"
		}
		else if(category_id == category_set.getNetIncomeSum().getId()){
			text_color = "text-success"
		}
		
		for(var col = 0; col < num_col; col++){
			var date = kakeibo.utils.calcSummaryColDate(this.m_params.date, -(num_col - 1 - col));
			var cell = summary_table.getCell(date.year, date.month, category_id);
			var strong = (col == num_col - 1);
			var cell_html = "";
			
			if(cell != null){
				var amount = (this.m_params.column_type == "balance") ? cell.getBalance() : cell.getSumAmount();
				cell_html = make_cell(amount, strong, text_color);
			}
			$td_list[2 + col].innerHTML = cell_html;

			// ó\éZ
			if(col == num_col - 1 && cell != null){
				var category = category_set.getById(category_id);
				if(this.m_params.show_budgets){
					if(category.getCategoryType() == kakeibo.model.CategoryType.COST && category.isParent() && date.month != 0){
						$td_list[num_col + 2].innerHTML = make_cell(cell.getBudget(), false, "");
						var rest = cell.getBudget() - cell.getSumAmount();
						var color = rest >= 0 ? "" : "text-error";
						$td_list[num_col + 3].innerHTML = make_cell(rest, false, color);
					}
					else{
						$td_list[num_col + 2].innerHTML = "<div class='pull-right'>-</div>";
						$td_list[num_col + 3].innerHTML = "<div class='pull-right'>-</div>";
					}
				}
			}
			else{
				$td_list[num_col + 2].innerHTML = "";
				$td_list[num_col + 3].innerHTML = "";
			}
		}
	}
}


kakeibo.component.SummaryTableView.prototype.setCaption = function(){
	var num_col = this.m_params.num_col;
	var $th = $("#" + this.m_params.container + "-header-col0");
	var header_format = this.m_params.date.month == 0 ? this.m_params.header_format_year : this.m_params.header_format_month;

	for(var i = 0; i < num_col; i++){
		var date = kakeibo.utils.calcSummaryColDate(this.m_params.date, -(num_col - 1 - i));
		var header = header_format.replace("%y", date.year).replace("%m", date.month);
		header = "<div class='pull-right'>" + header + "</div>";
		$th.html(header);
		$th = $th.next();
	}
}


kakeibo.component.SummaryTableView.prototype.setDate = function(date){
	this.m_params.date = date;
	this.setCaption();
}


kakeibo.component.SummaryTableView.prototype.changeNumCol = function(num_col){
	this.m_params.num_col = num_col;
	this.initView();
	this.setCaption();
}


kakeibo.component.SummaryTableView.prototype.addClickColumnListener = function(fn){
	this.m_click_column_listener = fn;
}