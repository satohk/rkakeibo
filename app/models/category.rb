# -*- coding: utf-8 -*-
class Category < ActiveRecord::Base
  module CategoryType
    INCOME = 1		# 収入
    COST = 2		# 費用
    ASSETS = 3		# 資産
    LIABILITIES = 4	# 負債
    NET_ASSETS = 5	# 純資産
    NET_INCOME = 6	# 純利益（収支差額）
  end

  attr_accessible :category_type, :is_creditor, :name, :parent_category_id, :user_id, :shortcut, :display_order
  
  def Category.add_initial_categories_for_user(user_id)
    food        = Category.create!(:name => "食費",               :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "010", :display_order => 1)
    livingware  = Category.create!(:name => "生活費",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "020", :display_order => 2)
    energy      = Category.create!(:name => "公共料金",           :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "030", :display_order => 3)
    fashion     = Category.create!(:name => "ファッション",       :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "040", :display_order => 4)
    travel      = Category.create!(:name => "交通費",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "050", :display_order => 5)
    childcase   = Category.create!(:name => "育児・教育",         :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "060", :display_order => 6)
    hobby       = Category.create!(:name => "趣味・娯楽",         :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "070", :display_order => 7)
    business    = Category.create!(:name => "交際費",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "080", :display_order => 8)
    medical     = Category.create!(:name => "医療費",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "090", :display_order => 9)
    duty        = Category.create!(:name => "税金・保険",         :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "100", :display_order => 10)
    special     = Category.create!(:name => "特別出費",           :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "110", :display_order => 11)
    others      = Category.create!(:name => "その他",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::COST,   :is_creditor => false, :shortcut => "120", :display_order => 12)
    creditor    = Category.create!(:name => "収入",               :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::INCOME, :is_creditor => true,  :shortcut => "130", :display_order => 13)
    account     = Category.create!(:name => "資産",               :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::ASSETS,  :is_creditor => false, :shortcut => "140", :display_order => 14)
    liabilities = Category.create!(:name => "負債",               :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::LIABILITIES, :is_creditor => true, :shortcut => "150", :display_order => 15)
    net_assets  = Category.create!(:name => "純資産",             :parent_category_id => 0, :user_id => user_id, :category_type => CategoryType::NET_ASSETS,  :is_creditor => true, :shortcut => "160", :display_order => 16)
    
    food1       = Category.create!(:name => "食材",               :parent_category_id => food.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "011", :display_order => 111)
    food2       = Category.create!(:name => "外食",               :parent_category_id => food.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "012", :display_order => 112)
    food3       = Category.create!(:name => "菓子・飲料",         :parent_category_id => food.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "013", :display_order => 113)
    food4       = Category.create!(:name => "その他",             :parent_category_id => food.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "014", :display_order => 114)
    
    livingware1 = Category.create!(:name => "消耗品",             :parent_category_id => livingware.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "021", :display_order => 121)
    livingware2 = Category.create!(:name => "家具",               :parent_category_id => livingware.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "022", :display_order => 122)
    livingware3 = Category.create!(:name => "電化製品",           :parent_category_id => livingware.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "023", :display_order => 123)
    livingware4 = Category.create!(:name => "その他",             :parent_category_id => livingware.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "024", :display_order => 124)

    energy1     = Category.create!(:name => "通信費",             :parent_category_id => energy.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "031", :display_order => 131)
    energy2     = Category.create!(:name => "光熱費",             :parent_category_id => energy.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "032", :display_order => 132)
    energy3     = Category.create!(:name => "その他",             :parent_category_id => energy.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "033", :display_order => 133)

    fashion1    = Category.create!(:name => "衣類",               :parent_category_id => fashion.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "041", :display_order => 141)
    fashion2    = Category.create!(:name => "美容院",             :parent_category_id => fashion.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "042", :display_order => 142)
    fashion3    = Category.create!(:name => "化粧品",             :parent_category_id => fashion.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "043", :display_order => 143)
    fashion4    = Category.create!(:name => "その他",             :parent_category_id => fashion.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "044", :display_order => 144)

    travel1     = Category.create!(:name => "ガソリン代",         :parent_category_id => travel.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "051", :display_order => 151)
    travel2     = Category.create!(:name => "高速道路",           :parent_category_id => travel.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "052", :display_order => 152)
    travel3     = Category.create!(:name => "公共交通機関",       :parent_category_id => travel.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "053", :display_order => 153)
    travel4     = Category.create!(:name => "その他",             :parent_category_id => travel.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "054", :display_order => 154)

    childcase1  = Category.create!(:name => "授業料",             :parent_category_id => childcase.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "061", :display_order => 161)
    childcase2  = Category.create!(:name => "書籍",               :parent_category_id => childcase.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "062", :display_order => 162)
    childcase3  = Category.create!(:name => "その他",             :parent_category_id => childcase.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "063", :display_order => 163)

    hobby1      = Category.create!(:name => "書籍",               :parent_category_id => hobby.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "071", :display_order => 171)
    hobby2      = Category.create!(:name => "映画・音楽",         :parent_category_id => hobby.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "072", :display_order => 172)
    hobby3      = Category.create!(:name => "レジャー",           :parent_category_id => hobby.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "073", :display_order => 173)
    hobby4      = Category.create!(:name => "その他",             :parent_category_id => hobby.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "074", :display_order => 174)

    business1   = Category.create!(:name => "交遊費",             :parent_category_id => business.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "081", :display_order => 181)
    business2   = Category.create!(:name => "贈答品",             :parent_category_id => business.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "082", :display_order => 182)
    business3   = Category.create!(:name => "冠婚葬祭",           :parent_category_id => business.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "083", :display_order => 183)
    business4   = Category.create!(:name => "その他",             :parent_category_id => business.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "084", :display_order => 184)

    medical1    = Category.create!(:name => "治療費",             :parent_category_id => medical.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "091", :display_order => 191)
    medical2    = Category.create!(:name => "医薬品",             :parent_category_id => medical.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "092", :display_order => 192)
    medical3    = Category.create!(:name => "その他",             :parent_category_id => medical.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "093", :display_order => 193)
    
    duty1       = Category.create!(:name => "税金",               :parent_category_id => duty.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "101", :display_order => 201)
    duby2       = Category.create!(:name => "保険",               :parent_category_id => duty.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "102", :display_order => 202)
    duby3       = Category.create!(:name => "その他",             :parent_category_id => duty.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "103", :display_order => 203)

    special1    = Category.create!(:name => "旅行",               :parent_category_id => special.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "111", :display_order => 211)
    special2    = Category.create!(:name => "設備投資",           :parent_category_id => special.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "112", :display_order => 212)
    special2    = Category.create!(:name => "交際費",             :parent_category_id => special.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "113", :display_order => 213)
    special3    = Category.create!(:name => "その他",             :parent_category_id => special.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "114", :display_order => 214)

    others1     = Category.create!(:name => "その他",             :parent_category_id => others.id, :user_id => user_id, :category_type => CategoryType::COST, :is_creditor => false, :shortcut => "121", :display_order => 221)

    creditor1   = Category.create!(:name => "給与",               :parent_category_id => creditor.id, :user_id => user_id, :category_type => CategoryType::INCOME, :is_creditor => true, :shortcut => "131", :display_order => 231)
    creditor2   = Category.create!(:name => "賞与",               :parent_category_id => creditor.id, :user_id => user_id, :category_type => CategoryType::INCOME, :is_creditor => true, :shortcut => "132", :display_order => 232)
    creditor3   = Category.create!(:name => "その他",             :parent_category_id => creditor.id, :user_id => user_id, :category_type => CategoryType::INCOME, :is_creditor => true, :shortcut => "133", :display_order => 233)

    account1    = Category.create!(:name => "財布（夫）",         :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "141", :display_order => 241)
    account2    = Category.create!(:name => "財布（妻）",         :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "142", :display_order => 242)
    account3    = Category.create!(:name => "生活費口座",         :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "143", :display_order => 243)
    account4    = Category.create!(:name => "特別出費口座",       :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "144", :display_order => 244)
    account5    = Category.create!(:name => "貯蓄口座",           :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "145", :display_order => 245)
    account6    = Category.create!(:name => "タンス預金",         :parent_category_id => account.id, :user_id => user_id, :category_type => CategoryType::ASSETS, :is_creditor => false, :shortcut => "146", :display_order => 246)

    liabilities1= Category.create!(:name => "借金",               :parent_category_id => liabilities.id, :user_id => user_id, :category_type => CategoryType::LIABILITIES, :is_creditor => true, :shortcut => "151", :display_order => 251)
    liabilities2= Category.create!(:name => "ローン",             :parent_category_id => liabilities.id, :user_id => user_id, :category_type => CategoryType::LIABILITIES, :is_creditor => true, :shortcut => "152", :display_order => 252)

    net_assets1= Category.create!(:name => "資本金",              :parent_category_id => net_assets.id,  :user_id => user_id, :category_type => CategoryType::NET_ASSETS,  :is_creditor => true, :shortcut => "161", :display_order => 261)
  end
  
  
  def Category.categories_for_user(user_id)
    categories = Category.where(:user_id => user_id).order('display_order asc')
    
    categories_list = categories.map do |val|
      {
        :id => val.id,
        :category_type => val.category_type,
        :is_creditor => val.is_creditor,
        :name => val.name,
        :parent_id => val.parent_category_id,
        :shortcut => val.shortcut,
        :display_order => val.display_order
      }
    end
    return categories_list
  end


  def Category.update(user_id, add_list, mod_list, del_id_list, id_modify_list)
    ActiveRecord::Base.transaction do
      list = []

      add_list.each do |val|
        new_c = Category.create!(:name => val["name"],
                                 :parent_category_id => val["parent_id"],
                                 :user_id => user_id,
                                 :category_type => val["category_type"],
                                 :is_creditor => val["is_creditor"],
                                 :shortcut => val["shortcut"],
                                 :display_order => val["display_order"])
        Summary.add_category_for_user(user_id, new_c.id)
      end
      
      mod_list.each do |val|
        categories = Category.where(:user_id => user_id, :id => val["id"])
        if categories.length == 0
          raise ActiveRecord::Rollback
        end
        category = categories.first

        category.update_attributes!(:name => val["name"],
                                    :parent_category_id => val["parent_id"],
                                    :user_id => user_id,
                                    :category_type => val["category_type"],
                                    :is_creditor => val["is_creditor"],
                                    :shortcut => val["shortcut"],
                                    :display_order => val["display_order"])
      end

      del_id_list.each do |id|
        categories = Category.where(:id => id, :user_id => user_id)
        if categories.length == 0
          raise ActiveRecord::Rollback
        end
        Summary.delete_category_for_user(user_id, id)
        categories.first!.destroy
      end

      id_modify_list.each do |pair|
        to_id = pair["to_id"]
        from_id = pair["from_id"]
        to_sub_id = pair["to_sub_id"]
        from_sub_id = pair["from_sub_id"]
        KakeiboEntry.update_all("creditor_id=#{to_id}, creditor_sub_id=#{to_sub_id}",
                                "creditor_id=#{from_id} and creditor_sub_id=#{from_sub_id} and " +
                                "user_id=#{user_id}")
        KakeiboEntry.update_all("debtor_id=#{to_id}, debtor_sub_id=#{to_sub_id}",
                                "debtor_id=#{from_id} and debtor_sub_id=#{from_sub_id} and " +
                                "user_id=#{user_id}")
      end

      Summary.rebuild(user_id)
    end

    return true

  rescue => e
    logger.debug e.backtrace.join("\n")
    return false
  end
end
