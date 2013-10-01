
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};

kakeibo.controller.SettingTabCategoryController = function(){
	this.initData();
	this.initHandlers();
}

kakeibo.controller.SettingTabCategoryController.prototype.initData = function(){
	this.m_working_category_set = kakeibo.category_set.clone();
	this.m_active_category = null;
	this.m_new_id_ct = 1;
	this.m_id_modify_list = [];

	this.initSelectorOptions();

	var self = this;

	setTimeout(function(){
		self.setSelectorValue(self.m_working_category_set.getRoot().getChild(0));
	}, 10);
}

kakeibo.controller.SettingTabCategoryController.prototype.initHandlers = function(){
	var self = this;

	var $category_select = $("#setting-pane-category-select");
	var $parent_select = $("#setting-pane-category-parent-select");

	$category_select.change(function(e){
		var $selected = $("#setting-pane-category-select option:selected");
		if($selected.length > 0){
			var c_id = $selected.val();
			var $sub_select = $("#setting-pane-subcategory-select");
			$sub_select.empty();

			var parent = self.m_working_category_set.getById(c_id);
			for(i = 0; i < parent.getNumChildren(); i++){
				var category = parent.getChild(i);
				var $option = $("<option />");
				$option.val("" + category.getId());
				$option.text(category.getShortcut() + " : " + category.getName());
				$option.css("color", kakeibo.utils.getCategoryColor(category));
				$sub_select.append($option)
			}

			self.changeActiveCategory(self.m_working_category_set.getById(c_id));
		}
	});

	$category_select.click(function(e){
		var $selected = $("#setting-pane-category-select option:selected");
		if($selected.length > 0){
			var c_id = $selected.val();
			self.changeActiveCategory(self.m_working_category_set.getById(c_id));
		}
	});

	var sub_category_func = function(e){
		var $selected = $("#setting-pane-subcategory-select option:selected");
		if($selected.length > 0){
			var c_id = $selected.val();
			self.changeActiveCategory(self.m_working_category_set.getById(c_id));
		}
	};

	var $sub_category = $("#setting-pane-subcategory-select");

	$sub_category.change(sub_category_func);
	$sub_category.click(sub_category_func);

	$("#setting-pane-category-up-button").click(function(e){
		var parent = self.m_active_category.getParent();
		var upper = null;

		for(i = 0; i < parent.getNumChildren(); i++){
			var category = parent.getChild(i);
			if(category == self.m_active_category){
				break;
			}
			upper = category;
		}
		if(upper != null){
			self.m_working_category_set.exchangeDisplayOrder(self.m_active_category, upper);
			self.initSelectorOptions();
			self.setSelectorValue(self.m_active_category);
		}
	});

	$("#setting-pane-category-down-button").click(function(e){
		var parent = self.m_active_category.getParent();
		var lower = null;

		for(i = 0; i < parent.getNumChildren(); i++){
			var category = parent.getChild(i);
			if(category == self.m_active_category){
				lower = parent.getChild(i + 1);
				break;
			}
		}
		if(lower != null){
			self.m_working_category_set.exchangeDisplayOrder(self.m_active_category, lower);
			self.initSelectorOptions();
			self.setSelectorValue(self.m_active_category);
		}
	});

	$("#setting-pane-category-modify-button").click(function(e){
		var attr = self.getAttrHash();
		if(self.isValidAttr(attr, false)){
			if(attr.parent_id != self.m_active_category.getParent().getId()){
				self.addToIdModifyList(
					self.m_active_category.getParent().getId(),
					self.m_active_category.getId(),
					attr.parent_id,
					self.m_active_category.getId()
				);
			}
			for(var i = 0; i < self.m_active_category.getNumChildren(); i++){
				var child = self.m_active_category.getChild(i);
				self.m_working_category_set.modify(
					child.getId(),
					{is_account:attr.is_account, is_creditor:attr.is_creditor}
				);
			}
			self.m_working_category_set.modify(self.m_active_category.getId(), attr);
			self.initSelectorOptions();
			self.setSelectorValue(self.m_active_category);
		}
	});

	$("#setting-pane-category-add-button").click(function(e){
		var attr = self.getAttrHash();
		if(self.isValidAttr(attr, true)){
			attr.display_order = self.m_working_category_set.getMaxDisplayOrder() + 1;
			attr.id = -self.m_new_id_ct;
			self.m_new_id_ct++;
			self.m_active_category = self.m_working_category_set.add(attr);
			self.initSelectorOptions();
			self.setSelectorValue(self.m_active_category);

			console.log(self.m_working_category_set);
		}
	});

	$("#setting-pane-category-remove-button").click(function(e){
		if(self.m_active_category.isParent()){
			if(self.m_active_category.getNumChildren() > 0){
				jError($("#setting-pane-msg-category-exist-subcategory").html(), {clickOverlay: true});
			}
			else{
				self.m_working_category_set.remove(self.m_active_category.getId());
				self.initSelectorOptions();
				self.setSelectorValue(self.m_working_category_set.getRoot().getChild(0));
			}
		}
		else{
			var $select = $("#setting-pane-category-remove-modal-select");

			$select.empty();
			//$parent_select.empty();

			var root = self.m_working_category_set.getRoot();
			for(i = 0; i < root.getNumChildren(); i++){
				var parent = root.getChild(i);
				var $group = $("<optgroup />");
				$group.attr("label", parent.getName());
				$select.append($group);
				for(j = 0; j < parent.getNumChildren(); j++){
					var child = parent.getChild(j);
					var $option = $("<option />");
					$option.text(child.getName());
					$option.attr("label", child.getName());
					$option.val("" + child.getId());
					if(child.getId() == self.m_active_category.getId()){
						$option.attr("disabled", "disabled");
					}
					$group.append($option);
				}
			}

			$("#setting-pane-category-remove-modal").modal('show');
		}
	});

	$("#setting-pane-category-remove-modal-cancel").click(function(e){
		$("#setting-pane-category-remove-modal").modal('hide');
	});

	$("#setting-pane-category-remove-modal-submit").click(function(e){
		var c_id = parseInt($("#setting-pane-category-remove-modal-select option:selected").val());
		var p_id = self.m_working_category_set.getById(c_id).getParentId();
		self.addToIdModifyList(self.m_active_category.getParentId(), self.m_active_category.getId(), p_id, c_id)
		self.m_working_category_set.remove(self.m_active_category.getId());
		self.initSelectorOptions();
		self.setSelectorValue(self.m_working_category_set.getRoot().getChild(0));
		$("#setting-pane-category-remove-modal").modal('hide');
	});
}


kakeibo.controller.SettingTabCategoryController.prototype.isValidAttr = function(attr, addxmodify){
	if(!this.m_active_category.isParent()){
		var shortcut_c = this.m_working_category_set.getByShortcut(attr.shortcut);
		if(shortcut_c != null && (shortcut_c != this.m_active_category || addxmodify)){
			jError($("#setting-pane-msg-category-shortcut-duplicated").html(), {clickOverlay: true});
			return false;
		}

		if(parseInt(attr.shortcut) == 0){
			jError($("#setting-pane-msg-category-invalid-input").html(), {clickOverlay: true});
			return false;
		}
	}

	if(attr.name.length == 0){
		jError($("#setting-pane-msg-category-invalid-input").html(), {clickOverlay: true});
		return false;
	}

	return true;
}


kakeibo.controller.SettingTabCategoryController.prototype.getAttrHash = function(){
	var result = {};

	if(this.m_active_category.isParent()){
		result.parent_id = 0;
		result.parent = this.m_working_category_set.getById(result.parent_id);
		result.is_account = $("#setting-pane-category-type-account").attr("checked") == "checked";
		result.is_creditor = $("#setting-pane-category-type-creditor").attr("checked") == "checked";
	}
	else{
		result.parent_id = parseInt($("#setting-pane-category-parent-select option:selected").val());
		result.parent = this.m_working_category_set.getById(result.parent_id);
		result.is_account = result.parent.isAccount();
		result.is_creditor = result.parent.isCreditor();
	}
	result.name = $("#setting-pane-category-name-input").val();
	result.shortcut = $("#setting-pane-category-shortcut-input").val();

	return result;
}


kakeibo.controller.SettingTabCategoryController.prototype.addToIdModifyList = function(from_id, from_sub_id, to_id, to_sub_id){
	for(var i = 0; i < this.m_id_modify_list.length; i++){
		var val = this.m_id_modify_list[i];
		if(val.to_id == from_id && val.to_sub_id == from_sub_id){
			val.to_id = to_id;
			val.to_sub_id = to_sub_id;
			this.m_id_modify_list[i] = val;
			console.log(this.m_id_modify_list);
			return;
		}
	}
	var val = {};
	val.to_id = to_id;
	val.to_sub_id = to_sub_id;
	val.from_id = from_id;
	val.from_sub_id = from_sub_id;
	this.m_id_modify_list.push(val);

	console.log(this.m_id_modify_list);
}


kakeibo.controller.SettingTabCategoryController.prototype.initSelectorOptions = function(){
	var $category_select = $("#setting-pane-category-select");
	var $parent_select = $("#setting-pane-category-parent-select");

	$category_select.empty();
	$parent_select.empty();

	var root = this.m_working_category_set.getRoot();

	for(i = 0; i < root.getNumChildren(); i++){
		var category = root.getChild(i);
		var $option = $("<option />");
		$option.val("" + category.getId());
		$option.text(category.getName());
		$option.css("color", kakeibo.utils.getCategoryColor(category));
		$category_select.append($option);
		$parent_select.append($option.clone());
	}
}


kakeibo.controller.SettingTabCategoryController.prototype.setSelectorValue = function(category){
	console.log(category);
	if(category.isParent()){
		var $category = $("#setting-pane-category-select");
		$category.val(category.getId());
		$category.change();
	}
	else{
		var $category = $("#setting-pane-category-select");
		$category.val(category.getParent().getId());
		$category.change();
		var $subcategory = $("#setting-pane-subcategory-select");
		$subcategory.val(category.getId());
		$subcategory.change();
	}
}


kakeibo.controller.SettingTabCategoryController.prototype.changeActiveCategory = function(category){
	this.m_active_category = category;

	$("#setting-pane-category-name-input").val(category.getName());

	var $shortcut = $("#setting-pane-category-shortcut-input");
	var $parent = $("#setting-pane-category-parent-select");
	var $type = $("#setting-pane-category-type");

	if(category.isAccount()){
		$("#setting-pane-category-type-account").attr("checked", true);
	}
	else if(category.isDebtor()){
		$("#setting-pane-category-type-debtor").attr("checked", true);
	}
	else if(category.isCreditor()){
		$("#setting-pane-category-type-creditor").attr("checked", true);
	}

	$shortcut.val(category.getShortcut());

	if(category.isParent()){
// 		$shortcut.parent().parent().hide();
		$parent.parent().parent().hide();
		$type.show();
	}
	else{
		$parent.val(category.getParent().getId());
// 		$shortcut.parent().parent().show();
		$parent.parent().parent().show();
		$type.hide();
	}
}


kakeibo.controller.SettingTabCategoryController.prototype.submit = function(){
	var num_account_parent = 0;
	var num_creditor_parent = 0;
	var root = this.m_working_category_set.getRoot()

	for(var i = 0; i < root.getNumChildren(); i++){
		if(root.getChild(i).isAccount()){
			num_account_parent++;
		}
		if(root.getChild(i).isCreditor()){
			num_creditor_parent++;
		}
	}

	if(num_account_parent == 1 && num_creditor_parent == 1){
		var call_back = function(status, data){
			kakeibo.loading_screen.hide();

			if(status == "success"){
				jSuccess($("#setting-pane-msg-category-success-update").html(),
						 {
							 autoHide : false,
							 ShowOverlay : true,
							 HorizontalPosition : 'center',
							 onClosed : function(){
								 document.location.reload(true);
							 }
						 });
			}
			else{
				alert("kakeibo/update_category is failed!!");
			}
		};

		kakeibo.category_set.update(this.m_working_category_set, this.m_id_modify_list, call_back);
		kakeibo.loading_screen.show();
	}
	else{
		jError($("#setting-pane-msg-category-invalid-account-creditor-num").html(), {clickOverlay: true});
	}
}


kakeibo.controller.SettingTabCategoryController.prototype.cancel = function(){
	this.initData();
}


kakeibo.controller.SettingTabCategoryController.prototype.onActivated = function(){
}
