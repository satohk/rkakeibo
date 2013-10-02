
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};


kakeibo.component.SummaryTableView = function(params){

	this.m_click_column_listener = null;

	// init params
	this.m_params = {
		category_set : null,
		summary_table : null,
		num_col : 5,
		container : "",
		caption_budget : "budget",
		caption_remain : "remain",
		caption_category : "category",
		caption_creditor_sum : "creditor_sum",
		caption_debtor_sum : "debtor_sum",
		caption_account : "account",
		caption_account_sum : "account_sum",
		caption_account_total : "account_total",
		header_format_year : "%y",
		header_format_month : "%y/%m",
		date : {year: 2013, month: 1}
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
		var collapsed = false;

		var $img = $($row.children()[0]).children("i");
		if($img.hasClass("icon-chevron-right")){
			$img.attr("class", "icon-chevron-down clickable");
			collapsed = true;
		}
		else{
			$img.attr("class", "icon-chevron-right clickable");
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

	var header_html = function(caption_category, caption_budget, caption_remain, num_col, thead_no){
		var buf =
			' <thead>' +
			'  <tr ' + (thead_no == 1 ? 'height="60"' : '')  + '>' +
			'   <th class="text-info" width="20"></th>' +
			'   <th class="text-info" width="100">' + caption_category + '</th>';
		for(var i = 0; i < num_col; i++){
			buf += '  <th class="text-info" width="100" id="summary-table-thead' + thead_no + '-col' + i + '"> - </th>';
		}
		buf += '<th class="text-info" width="100"> <div class="pull-right">' + caption_budget + '</div> </th>' +
			'<th class="text-info" width="100"> <div class="pull-right">' + caption_remain + '</div> </th>' +
			'<th class="blue text-info" width="20"> </th>' +
			'</tr>' +
			'</thead>';
		return buf;
	};

	var row_html = function(category, caption, gray, display, num_col, clickable){
		var cap = (caption == "" ? category.getName() : caption);
		var has_child = category.getNumChildren() > 0;
		var buf =
			'<tr class="grid-row ' + (gray ? 'grid-gray-tr' : '') + ' ' + (has_child ? 'has-child' : '') + '" ' + (display ? '' : 'style="display:none"') +
			'category-id="' + category.getId() + '" id="summary-table-row-' + category.getId() + '">' +
			'<td width="20"> ' + (has_child ? '<i class="icon-chevron-right clickable">' : '') + '</i> </td>' +
			'<td width="100">' + cap + '</td>';
		for(var i = 0; i < num_col; i++){
			buf += '<td width="100" ' + (clickable ? 'class="clickable"' : '') + ' col="' + i + '" searchable> - </td>';
		}
		buf += '<td width="100"></td>' +
			'<td width="100"></td>' +
			'<td width="20"></td>' +
			'</tr>';
		return buf;
	};

	var html = '<table id="summary-table" class="table table-hover grid-content">';

	// header 1
	html += header_html(this.m_params.caption_category, this.m_params.caption_budget, this.m_params.caption_remain, this.m_params.num_col, 0);

	// body 1
	html += '<tbody id="summary-table-tbody1">';
	html += row_html(this.m_params.category_set.getCreditorSum(), this.m_params.caption_creditor_sum, false, true, this.m_params.num_col, false);
	html += row_html(this.m_params.category_set.getDebtorSum(), this.m_params.caption_debtor_sum, false, true, this.m_params.num_col, false);

	var root = self.m_params.category_set.getRoot();
	var row_ct = 0;
	for(var i = 0; i < root.getNumChildren(); i++){
		var parent = root.getChild(i);
		if(parent.isAccount()){
			continue;
		}
		html += row_html(parent, "", (row_ct+1) % 2, true, this.m_params.num_col, true);
		for(var j = 0; j < parent.getNumChildren(); j++){
			var child = parent.getChild(j);
			html += row_html(child, "", (row_ct+1) % 2, false, this.m_params.num_col, true);
		}
		row_ct++;
	}
	html += "</tbody>";

	// header 2
	html += header_html(this.m_params.caption_account, this.m_params.caption_account_total, '', this.m_params.num_col, 1);

	// body 2
	html += '<tbody id="summary-table-tbody2">';
	html += row_html(this.m_params.category_set.getAccountSum(), this.m_params.caption_account_sum, false, true, this.m_params.num_col, false);

	var parent = this.m_params.category_set.getAccountParent();
	for(var i = 0; i < parent.getNumChildren(); i++){
		html += row_html(parent.getChild(i), "", (i+1) % 2, true, this.m_params.num_col, true);
	}
	html += "</tbody>";
	html += "</table>";

	var $tbody = $("#summary-table-tbody1 > * > ")

	// add to container
	$("#" + this.m_params.container).html(html);

	// set event
	var $tbody = $("#summary-table-tbody1");
	var $rows = $tbody.children();
	for(i = 0; i < $rows.length; i++){
		$row = $($rows[i]);
		if($row.hasClass("has-child")){
			var $cols = $row.children();
			$($cols[0]).click(onclick_category);
			$($cols[1]).click(onclick_category);
		}
	}

	//
	{
		var $table = $("#summary-table");
		var $searchable = $table.find("[searchable]");
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
		})
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
	var body_list = [$("#summary-table-tbody1"), $("#summary-table-tbody2")];
	for(var body = 0; body < body_list.length; body++){
		var $tr_list = body_list[body].children();

		for(var row = 0; row < $tr_list.length; row++){
			var $tr = $($tr_list[row]);
			var category_id = $tr.attr("category-id");
			if(typeof category_id === "undefined"){
				continue;
			}
			var $td_list = $tr.children();

			var text_color = "";
			if(category_id == category_set.getDebtorSum().getId()){
				text_color = "text-error"
			}
			else if(category_id == category_set.getCreditorSum().getId()){
				text_color = "text-success"
			}
			else if(category_id == category_set.getAccountSum().getId()){
				text_color = "text-success"
			}

			for(var col = 0; col < num_col; col++){
				var date = kakeibo.utils.calcSummaryColDate(this.m_params.date, -(num_col - 1 - col));
				var cell = summary_table.getCell(date.year, date.month, category_id);
				var strong = (col == num_col - 1);
				var cell_html = "";

				if(cell != null){
					cell_html = make_cell(cell.getSumAmount(), strong, text_color);
				}
				$td_list[2 + col].innerHTML = cell_html;

				if(col == num_col - 1 && cell != null){
					var category = category_set.getById(category_id);
					if(!category.isAccount()){
						if(category.isDebtor() && category.isParent() && date.month != 0){
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
					else {
						$td_list[num_col + 2].innerHTML = make_cell(cell.getBalance(), false, "");
						$td_list[num_col + 3].innerHTML = "";
					}
				}
				else{
					$td_list[num_col + 2].innerHTML = "";
					$td_list[num_col + 3].innerHTML = "";
				}
			}
		}
	}
}


kakeibo.component.SummaryTableView.prototype.setCaption = function(){
	var num_col = this.m_params.num_col;
	var $th1 = $("#summary-table-thead0-col0");
	var $th2 = $("#summary-table-thead1-col0");
	var header_format = this.m_params.date.month == 0 ? this.m_params.header_format_year : this.m_params.header_format_month;

	for(var i = 0; i < num_col; i++){
		var date = kakeibo.utils.calcSummaryColDate(this.m_params.date, -(num_col - 1 - i));
		var header = header_format.replace("%y", date.year).replace("%m", date.month);
		header = "<div class='pull-right'>" + header + "</div>";
		$th1.html(header);
		$th2.html(header);
		$th1 = $th1.next();
		$th2 = $th2.next();
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