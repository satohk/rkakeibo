
if(!kakeibo.model){
	kakeibo.model = {}; // namespace
}


/*
 * CategoryType
 */
kakeibo.model.CategoryType = {
    INCOME: 1,		// Žû“ü
    COST: 2,		// ”ï—p
    ASSETS: 3,		// Ž‘ŽY
    LIABILITIES: 4,	// •‰Â
    NET_ASSETS: 5,	// ƒŽ‘ŽY
	NET_INCOME: 6	// ƒ—˜‰v (ŽûŽx·Šz)
};

/*
 * Category
 */
kakeibo.model.Category = function(params, category_set){
	this.m_id = params.id;
	this.m_category_type = params.category_type;
	this.m_is_creditor = params.is_creditor;
	this.m_name = params.name;
	this.m_parent_id = params.parent_id
	this.m_parent = category_set.getById(this.m_parent_id);
	if(this.m_parent != null){
		this.m_parent.m_children.push(this);
	}
	this.m_shortcut = params.shortcut;
	this.m_display_order = params.display_order;
	this.m_children = [];

	this.m_category_set = category_set;
}

kakeibo.model.Category.prototype.changeAttr = function(params){
	if("category_type" in params){
		this.m_category_type = params.category_type;
	}
	if("is_creditor" in params){
		this.m_is_creditor = params.is_creditor;
	}
	if("name" in params){
		this.m_name = params.name;
	}
	if("shortcut" in params){
		this.m_shortcut = params.shortcut;
	}
	if("display_order" in params){
		this.m_display_order = params.display_order;
	}
}

kakeibo.model.Category.prototype.changeParent = function(parent){
	this.m_parent.removeChild(this);
	this.m_parent_id = parent.getId();
	this.m_parent = parent;

	if(parent.getNumChildren() > 0){
		this.m_display_order = parent.getChild(parent.getNumChildren() - 1).getDisplayOrder() + 1;
	}
	else{
		this.m_display_order = parent.getDisplayOrder() + 1;
	}
	this.m_parent.m_children.push(this);
}


kakeibo.model.Category.prototype.getAttrHash = function(){
	return {
		id: this.m_id,
		category_type: this.m_category_type,
		is_creditor: this.m_is_creditor,
		parent_id: this.m_parent_id,
		name: this.m_name,
		shortcut: this.m_shortcut,
		display_order: this.m_display_order
	};
}

kakeibo.model.Category.prototype.equalTo = function(rhs){
	if(this.id != rhs.id){
		return false;
	}
	else if(this.m_category_type != rhs.m_category_type){
		return false;
	}
	else if(this.m_is_creditor != rhs.m_is_creditor){
		return false;
	}
	else if(this.m_parent_id != rhs.m_parent_id){
		return false;
	}
	else if(this.m_name != rhs.m_name){
		return false;
	}
	else if(this.m_shortcut != rhs.m_shortcut){
		return false;
	}
	else if(this.m_display_order != rhs.m_display_order){
		return false;
	}
	return true;
}


kakeibo.model.Category.prototype.getId = function(){
	return this.m_id;
}

kakeibo.model.Category.prototype.getCategoryType = function(){
	return this.m_category_type;
}

kakeibo.model.Category.prototype.isCreditor = function(){
	return this.m_is_creditor;
}

kakeibo.model.Category.prototype.isDebtor = function(){
	return !this.m_is_creditor;
}

kakeibo.model.Category.prototype.isParent = function(){
	return this.m_parent == this.m_category_set.m_root;
}

kakeibo.model.Category.prototype.getName = function(){
	return this.m_name;
}

kakeibo.model.Category.prototype.getParentId = function(){
	return this.m_parent_id;
}

kakeibo.model.Category.prototype.getShortcut = function(){
	return this.m_shortcut;
}

kakeibo.model.Category.prototype.getDisplayOrder = function(){
	return this.m_display_order;
}

kakeibo.model.Category.prototype.getParent = function(){
	return this.m_parent;
}

kakeibo.model.Category.prototype.getChild = function(i){
	return this.m_children[i];
}

kakeibo.model.Category.prototype.getNumChildren = function(){
	return this.m_children.length;
}

kakeibo.model.Category.prototype.getNumChildrenOfType = function(type){
	var num = 0;
	for(var i = 0; i < this.m_children.length; i++){
		if(this.m_children[i].getCategoryType() == type){
			num++;
		}
	}
	return num;
}



kakeibo.model.Category.prototype.removeChild = function(child){
	var index = -1;

	for(var i = 0; i < this.m_children.length; i++){
		if(this.m_children[i] == child){
			index = i;
			break;
		}
	}
	if(index != -1){
		this.m_children.splice(index, 1);
	}
}



/*
 * CategorySet
 */
kakeibo.model.CategorySet = function(array){
	this.m_id2category = {};
	this.m_shortcut2category = {};
	this.m_original_array = array;
	this.m_max_display_order = 0;

	// create root
	this.m_root = this.add({
		id: 0,
		category_type: 0,
		is_creditor: false,
		name: "-",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});

	this.m_income_sum = this.add({
		id: "income_sum",
		category_type: kakeibo.model.CategoryType.INCOME,
		is_creditor: true,
		name: "income_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});

	this.m_cost_sum = this.add({
		id: "cost_sum",
		category_type: kakeibo.model.CategoryType.COST,
		is_creditor: false,
		name: "cost_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});

	this.m_assets_sum = this.add({
		id: "assets_sum",
		category_type: kakeibo.model.CategoryType.ASSETS,
		is_creditor: false,
		name: "assets_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});
	this.m_liabilities_sum = this.add({
		id: "liabilities_sum",
		category_type: kakeibo.model.CategoryType.LIABILITIES,
		is_creditor: true,
		name: "liabilities_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});
	this.m_net_assets_sum = this.add({
		id: "net_assets_sum",
		category_type: kakeibo.model.CategoryType.NET_ASSETS,
		is_creditor: true,
		name: "net_assets_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});
	this.m_net_income_sum = this.add({
		id: "net_income_sum",
		category_type: kakeibo.model.CategoryType.NET_INCOME,
		is_creditor: false,
		name: "net_income_sum",
		parent_id: -1,
		display_order: -1,
		shortcut: 0
	});

	for(var i = 0; i < array.length; i++){
		var category = this.add(array[i]);
	}
}

kakeibo.model.CategorySet.prototype.add = function(attr){
	var category = new kakeibo.model.Category(attr, this);
	this.m_id2category[category.getId()] = category;
	if(parseInt(category.getShortcut()) != 0){
		this.m_shortcut2category[category.getShortcut()] = category;
	}
	if(category.getDisplayOrder() > this.m_max_display_order){
		this.m_max_display_order = category.getDisplayOrder();
	}

	return category;
}

kakeibo.model.CategorySet.prototype.remove = function(id){
	var c = this.getById(id);
	if(c != null){
		delete this.m_id2category[id];
		if(this.getByShortcut(c.getShortcut()) != null){
			delete this.m_shortcut2category[c.getShortcut()];
		}
		c.getParent().removeChild(c);
	}
}

kakeibo.model.CategorySet.prototype.modify = function(id, attr){
	var c = this.getById(id);
	if(c != null){
		if("shortcut" in attr && attr.shortcut != c.getShortcut()){
			delete this.m_shortcut2category[c.getShortcut()];
			this.m_shortcut2category[attr.shortcut] = c;
		}

		if("parent_id" in attr && attr.parent_id != c.getParentId()){
			c.changeParent(this.getById(attr.parent_id));
		}

		c.changeAttr(attr);
	}
}

kakeibo.model.CategorySet.prototype.getById = function(id){
	var c = this.m_id2category[id];
	if(c == undefined || c == null){
		return null;
	}
	else{
		return c;
	}
}

kakeibo.model.CategorySet.prototype.getByShortcut = function(shortcut){
	var c = this.m_shortcut2category[shortcut];
	if(c == undefined || c == null){
		return null;
	}
	else{
		return c;
	}
}

kakeibo.model.CategorySet.prototype.getRoot = function(){
	return this.m_root;
}

kakeibo.model.CategorySet.prototype.getSumCategoryOfType = function(type){
	switch(type){
	case kakeibo.model.CategoryType.INCOME: return this.getIncomeSum();
	case kakeibo.model.CategoryType.COST: return this.getCostSum();
	case kakeibo.model.CategoryType.ASSETS: return this.getAssetsSum();
	case kakeibo.model.CategoryType.LIABILITIES: return this.getLiabilitiesSum();
	case kakeibo.model.CategoryType.NET_ASSETS: return this.getNetAssetsSum();
	case kakeibo.model.CategoryType.NET_INCOME: return this.getNetIncomeSum();
	}
	return null;
}

kakeibo.model.CategorySet.prototype.getIncomeSum = function(){
	return this.m_income_sum;
}

kakeibo.model.CategorySet.prototype.getCostSum = function(){
	return this.m_cost_sum;
}

kakeibo.model.CategorySet.prototype.getAssetsSum = function(){
	return this.m_assets_sum;
}

kakeibo.model.CategorySet.prototype.getLiabilitiesSum = function(){
	return this.m_liabilities_sum;
}

kakeibo.model.CategorySet.prototype.getNetAssetsSum = function(){
	return this.m_net_assets_sum;
}

kakeibo.model.CategorySet.prototype.getNetIncomeSum = function(){
	return this.m_net_income_sum;
}

kakeibo.model.CategorySet.prototype.getMaxDisplayOrder = function(){
	return this.m_max_display_order;
}

kakeibo.model.CategorySet.prototype.exchangeDisplayOrder = function(a, b){
	if(a.m_parent != b.m_parent){
		return;
	}

	var tmp;
	tmp = b.m_display_order;
	b.m_display_order = a.m_display_order;
	a.m_display_order = tmp;

	var parent = a.m_parent;
	var a_index = -1;
	var b_index = -1;

	for(var i = 0; i < parent.getNumChildren(); i++){
		var child = parent.getChild(i);
		if(a == child){
			a_index = i;
		}
		if(b == child){
			b_index = i;
		}
	}

	if(a_index != -1 && b_index != -1){
		parent.m_children[a_index] = b;
		parent.m_children[b_index] = a;
	}
}


kakeibo.model.CategorySet.prototype.clone = function(){
	return new kakeibo.model.CategorySet(this.m_original_array);
}


kakeibo.model.CategorySet.prototype.update = function(new_set, id_modify_list, call_back){
	var add_list = [];
	var mod_list = [];
	var del_id_list = [];

	// modify, add
	for(id in new_set.m_id2category){
		if(isNaN(parseInt(id))){
			continue;
		}

		var old_c = this.getById(id);
		var new_c = new_set.getById(id);

		if(old_c == null){
			add_list.push(new_c.getAttrHash());
		}
		else if(!new_c.equalTo(old_c)){
			mod_list.push(new_c.getAttrHash());
		}
	}

	// delete
	for(id in this.m_id2category){
		var new_c = new_set.getById(id);

		if(new_c == null){
			del_id_list.push(parseInt(id));
		}
	}

	var param = {
		add_list: add_list,
		mod_list: mod_list,
		del_id_list: del_id_list,
		id_modify_list: id_modify_list
	};

	console.log(param);

	//kakeibo.model.RequestQueue.removeRequest("GET", "kakeibo/get_summaries/1");
	kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/update_category", param, call_back);
}


// kakeibo.model.CategorySet.prototype.upload = function(id_modify_list){
// 	var categories = [];

// 	var root = this.getRoot();
// 	for(var i = 0; i < root.getNumChildren(); i++){
// 		var parent = root.getChild(i);
// 		categories.push(parent.getAttrHash());
// 		for(var j = 0; j < parent.getNumChildren(); j++){
// 			var child = parent.getChild(j);
// 			categories.push(child.getAttrHash());
// 		}
// 	}

// 	var param = {
// 		categories: categories,
// 		id_modify_list: id_modify_list
// 	};

// 	var call_back = function(status, data){
// 		if(status == "success"){
// 			// do nothing
// 		}
// 		else{
// 			alert("kakeibo/update_budget is failed!!");
// 		}
// 	};

// 	//kakeibo.model.RequestQueue.removeRequest("GET", "kakeibo/get_summaries/1");
// 	kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/update_budget", param, call_back);
// }
