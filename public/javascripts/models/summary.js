
if(!kakeibo.model){
	kakeibo.model = {}; // namespace
}


/*
 * SummaryCell
 */
kakeibo.model.SummaryCell = function(args){
	this.m_sum_amount = args[0];
	this.m_balance = args[1];
	this.m_budget = args[2];
}

kakeibo.model.SummaryCell.prototype.getSumAmount = function(){
	return this.m_sum_amount;
}

kakeibo.model.SummaryCell.prototype.getBalance = function(){
	return this.m_balance;
}

kakeibo.model.SummaryCell.prototype.getBudget = function(){
	return this.m_budget;
}

kakeibo.model.SummaryCell.prototype.add = function(rhs){
	this.m_sum_amount += rhs.m_sum_amount;
	this.m_balance += rhs.m_balance;
	this.m_budget += rhs.m_budget;
}

kakeibo.model.SummaryCell.prototype.multi = function(rhs){
	this.m_sum_amount *= rhs;
	this.m_balance *= rhs;
	this.m_budget *= rhs;
}


/*
 * SummaryTable (singleton)
 */
kakeibo.model.SummaryTable = {};
kakeibo.model.SummaryTable.m_zero_cell = new kakeibo.model.SummaryCell([0,0,0]);
kakeibo.model.SummaryTable.m_all_summaries_hash = {};
kakeibo.model.SummaryTable.m_on_modify_table = [];
kakeibo.model.SummaryTable.m_current_page = {year: 0, month: 0, num_cols: 0};
kakeibo.model.SummaryTable.m_downloading = false;


kakeibo.model.SummaryTable.requestSummaries = function(year, month, num_col){
	var self = this;

	var param = {
		year: year,
		month: month,
		num_col: num_col
	};

	var call_back = function(status, data){
		if(status == "success"){
			var table = data.table;
			for(var key_col in table){
				var debtor_sum = new kakeibo.model.SummaryCell([0, 0, 0]);
				var creditor_sum = new kakeibo.model.SummaryCell([0, 0, 0]);
				var account_sum = new kakeibo.model.SummaryCell([0, 0, 0]);
				var new_col = {};
				
				for(var key_row in table[key_col]){
					var category = kakeibo.category_set.getById(key_row);

					if(category == null){
						console.log(table);
						console.log(key_col);
						console.log(key_row);
					}

					cell = new kakeibo.model.SummaryCell(table[key_col][key_row]);
					if(category.isCreditor()){
						cell.multi(-1);
					}

					if(category.isParent()){
						if(category.isAccount()){
							account_sum.add(cell);
						}
						else if(category.isCreditor()){
							creditor_sum.add(cell);
						}
						else if(category.isDebtor()){
							debtor_sum.add(cell);
						}
					}
					new_col[key_row] = cell;
				}
				new_col[kakeibo.category_set.getAccountSum().getId()] = account_sum;
				new_col[kakeibo.category_set.getCreditorSum().getId()] = creditor_sum;
				new_col[kakeibo.category_set.getDebtorSum().getId()] = debtor_sum;

				self.m_all_summaries_hash[key_col] = new_col;
			}

			for(var i = 0; i < self.m_on_modify_table.length; i++){
				self.m_on_modify_table[i](self);
			}

			if(self.currentPageIsLoaded()){
				self.m_downloading = false;
			}
			else{
				self.m_downloading = false;
				self.requestSummaries(
					self.m_current_page.year,
					self.m_current_page.month,
					self.m_current_page.num_cols
				);
			}
		}
		else{
			alert("kakeibo/get_summaries/1 is failed!!");
		}
	};

	//kakeibo.model.RequestQueue.removeRequest("GET", "kakeibo/get_summaries/1");
	if(!this.m_downloading){
		kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/get_summaries", param, call_back);
		this.m_downloading = true;
	}
}


kakeibo.model.SummaryTable.setPage = function(year, month, num_cols){
	this.m_current_page.year = year;
	this.m_current_page.month = month;
	this.m_current_page.num_cols = num_cols;

	if(!this.currentPageIsLoaded()){
		this.requestSummaries(year, month, num_cols);
		return false;
	}
	else{
		return true;
	}
}


kakeibo.model.SummaryTable.currentPageIsLoaded = function(){
	var year = this.m_current_page.year;
	var month = this.m_current_page.month;
	for(var i = 0; i < this.m_current_page.num_cols; i++){
		var key = year * 100 + month;

		if(typeof this.m_all_summaries_hash[key] === "undefined"){
			return false;
		}

		if(month == 0){
			year++;
		}
		else{
			month++;
			if(month == 13){
				month = 1;
				year++;
			}
		}
	}

	return true;
}

// return null if downloading
kakeibo.model.SummaryTable.getCell = function(year, month, category_id){
	var key = year * 100 + month;

	col = this.m_all_summaries_hash[key];
	if(typeof col === "undefined"){
		return null;
	}
	else{
		if(typeof col[category_id] === "undefined"){
			return this.m_zero_cell;
		}
		else{
			return col[category_id];
		}
	}
}


kakeibo.model.SummaryTable.refresh = function(){
	this.m_all_summaries_hash = {};
	for(var i = 0; i < this.m_on_modify_table.length; i++){
		this.m_on_modify_table[i](this);
	}
}


kakeibo.model.SummaryTable.updateBudget = function(year, month, budget_hash, call_back){
	// update local data
	for(var category_id in budget_hash){
		var cell = this.getCell(year, month, category_id);
		cell.m_budget = budget_hash[category_id];
	}

	// update remote data
	var param = {
		year: year,
		month: month,
		budget_hash: budget_hash
	};

	//kakeibo.model.RequestQueue.removeRequest("GET", "kakeibo/get_summaries/1");
	kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/update_budget", param, call_back);

	for(var i = 0; i < this.m_on_modify_table.length; i++){
		this.m_on_modify_table[i](this);
	}
}


kakeibo.model.SummaryTable.addModifyTableListener = function(func){
	this.m_on_modify_table.push(func);
}
