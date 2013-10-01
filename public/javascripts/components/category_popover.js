(function(jQuery){
	jQuery.inst_category_popover = null;

	jQuery.initCategoryPopover = function(category_tree){
		if(jQuery.inst_category_popover == null){
			jQuery.inst_category_popover = new CategoryPopover(category_tree);
		}
	};

	var adjustPopoverSizeAndLocation = function(){
		if(jQuery.inst_category_popover.m_owner_id == null){
			return;
		}

		var popover = $('#' + jQuery.inst_category_popover.m_popover_id);
		var owner = $('#' + jQuery.inst_category_popover.m_owner_id);
		var window_width = $(window).width();
		var window_height = $(window).height();
		var content = popover.children();
		var content_width = content.width();
		var content_height = content.height();
		var MARGIN = 20;
		var PADDING = 15;

		var owner_offset = owner.offset()
		var top = owner_offset.top + owner.height() + MARGIN;
		var width = Math.min(window_width - MARGIN * 2, content_width + PADDING);
		var left = Math.min(owner_offset.left, window_width - width - MARGIN - PADDING);
		var height = Math.min(window_height - top - MARGIN - PADDING, content_height + MARGIN);

		console.log("wh" + window_width);
		console.log("cw" + content_width);

		popover.css({
			"width" : width,
			"height" : height,
			"top" : top,
			"left" : left
		});

		//alert("cw : " + content_width + " ch :" + content_height);
		//alert("w:" + width + " h:" + height + " t:" + top + " l:" + left);

		popover.offset()
	};

	var hideCategoryPopover = function(){
		if(jQuery.inst_category_popover.m_owner_id != null){
			jQuery.inst_category_popover.m_owner_id = null;
			$("#" + jQuery.inst_category_popover.m_popover_id).hide();
		}
	}

	function CategoryPopover(category_set){
		this.m_owner_id = null;
		this.m_popover_id = "category-popover";

		var i, j;
		var popover_content = '';
		var max_subcategories_num = 0;

		var make_col = function(category){
			return '<td class="category-popover-td">'
				+ '<a href="#" value="' + category.getShortcut() + " : " + category.getName() + '">'
				+ category.getShortcut() + " : " + category.getName()
				+ '</a></td>';
		}
		var make_root_col = function(category){
			return '<td class="category-popover-td">'
				+ '<a class="category-popover-clickable-root-col" href="#" value="' + category.getShortcut() + " : " + category.getName() + '">'
				+ category.getShortcut() + " : " + category.getName()
				+ '</a>'
				+ '<strong class="category-popover-root-col text-info">'
				+ category.getName()
				+ '</strong></td>';
		}

		var root = category_set.getRoot();

		for(i = 0; i < root.getNumChildren(); i++){
			var category = root.getChild(i);
			if(max_subcategories_num < category.getNumChildren()){
				max_subcategories_num = category.getNumChildren();
			}
		}

		for(i = 0; i < root.getNumChildren(); i++){
			var category = root.getChild(i);
			popover_content += '<tr>'
				+ make_root_col(category);
			for(j = 0; j < max_subcategories_num; j++){
				if(j < category.getNumChildren()){
					popover_content += make_col(category.getChild(j));
				}
				else{
					popover_content += "<td></td>";
				}
			}
			popover_content += "</tr>";
		}
		popover_content =
			'<div id="' + this.m_popover_id + '" class="category-popover"><table class="category-popover-table table-striped">' + popover_content + "</table></div>";
		
		$(document.body).append(popover_content);
		var popover = $("#" + this.m_popover_id);

		{ // init event
			$('a', popover).on('click', function(){
				if(jQuery.inst_category_popover.m_owner_id != null){
					$("#" + jQuery.inst_category_popover.m_owner_id)
					.val($(this).attr("value"))
					.blur();
				}
			});

			$(document).mousedown(function(e){
				var target = $(e.target);

				if (jQuery.inst_category_popover.m_owner_id != null){
					if(target.closest("#" + jQuery.inst_category_popover.m_popover_id).length == 0 &&
					   target.closest("#" + jQuery.inst_category_popover.m_owner_id).length == 0){
						hideCategoryPopover();
					}
				}
			});
		}
	}

	jQuery.fn.categoryPopover = function(root_clickable, state){		
		if(jQuery.inst_category_popover == null){
			return this;
		}

		if(state == "hide"){
			$("#" + jQuery.inst_category_popover.m_popover_id).hide();
			return this;
		}

		var self = this;

		$(this).focus(function(e){
			jQuery.inst_category_popover.m_owner_id = this.id;

			var popover = $("#" + jQuery.inst_category_popover.m_popover_id);
			if(root_clickable){
				$('.category-popover-clickable-root-col', popover).show();
				$('.category-popover-root-col', popover).hide();
			}
			else{
				$('.category-popover-clickable-root-col', popover).hide();
				$('.category-popover-root-col', popover).show();
			}

			popover.show();
			adjustPopoverSizeAndLocation();
			$(this).select();
		})
		.keydown(function(e){
			if(e.keyCode == 9 || e.keyCode == 13){
				self.categoryPopover(false, "hide");
			}
		});

		return this;
	};

})(jQuery);
