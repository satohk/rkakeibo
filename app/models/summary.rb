class Summary < ActiveRecord::Base
  # attr_accessible :title, :body
  
  attr_accessible :user_id, :category_id, :year, :month, :sum_amount, :balance, :budget
  
  
  def Summary.add_guard_summaries_for_user(user_id, categories)
    categories.each do |category|
      summary = Summary.create!(:user_id => user_id,
                               :category_id => category.id,
                               :year => 0,
                               :month => 0,
                               :sum_amount => 0,
                               :balance => 0,
                               :budget => 0
                               )
    end
    summary = Summary.create!(:user_id => user_id,
                              :category_id => 0,  # dummy category
                              :year => 0,
                              :month => 0,
                              :sum_amount => 0,
                              :balance => 0,
                              :budget => 0
                              )
  end


  def Summary.add_category_for_user(user_id, category_id)
    dummy_sums = Summary.find(:all,
                              :select=>'year, month',
                              :conditions=>"user_id=#{user_id} and category_id=0")

    new_sums = []
    dummy_sums.each do |dummy|
      Summary.create!(:user_id => user_id,
                      :category_id => category_id,
                      :year => dummy.year,
                      :month => dummy.month,
                      :sum_amount => 0,
                      :balance => 0,
                      :budget => 0
                      )
    end
  end


  def Summary.delete_category_for_user(user_id, category_id)
    Summary.destroy_all "user_id=#{user_id} and category_id=#{category_id}"
  end


  def Summary.update_summaries(entry, amount)
    t_date = entry.transaction_date
    date_list = [[t_date.year, t_date.month], [t_date.year, 0]]
    
    date_list.each do |date|
      year = date[0]
      month = date[1]

      Summary.copy_last_summary(entry.user_id, year, month)

      Summary.update_all(["sum_amount = sum_amount + ?", amount],
                         "user_id=#{entry.user_id} and year = #{year} and month = #{month} and " +
                         "(category_id=#{entry.debtor_id} or category_id=#{entry.debtor_sub_id})")
      
      Summary.update_all(["sum_amount = sum_amount - ?", amount],
                         "user_id=#{entry.user_id} and year = #{year} and month = #{month} and " +
                         "(category_id=#{entry.creditor_id} or category_id=#{entry.creditor_sub_id})")
    end

    Summary.update_all(["balance = balance + ?", amount],
                       "user_id=#{entry.user_id} and ((year = #{t_date.year} and (month >= #{t_date.month} or month = 0)) or " +
                       "(year >= #{t_date.year+1})) and " +
                       "(category_id =#{entry.debtor_id} or category_id =#{entry.debtor_sub_id})")

    Summary.update_all(["balance = balance - ?", amount],
                       "user_id=#{entry.user_id} and ((year = #{t_date.year} and (month >= #{t_date.month} or month = 0)) or " +
                       "(year >= #{t_date.year+1})) and " +
                       "(category_id =#{entry.creditor_id} or category_id =#{entry.creditor_sub_id})")
  end


  def Summary.update_budget(user_id, year, month, budget_hash)
    ActiveRecord::Base.transaction do
      Summary.copy_last_summary(user_id, year, month)

      sums = Summary.find(:all,
                          :select=>'id, category_id, budget',
                          :conditions=>"user_id = #{user_id} and year = #{year} and month = #{month}")

      sums.each do |sum|
        budget = budget_hash[sum.category_id]
        if budget != nil then
          sum.update_attributes!(:budget => budget)
          budget_hash.delete(sum.category_id)
        end
      end

      return budget_hash.size == 0
    end
  rescue => e
    logger.debug e
    return false
  end


  def Summary.rebuild(user_id)
    Summary.destroy_all "user_id=#{user_id} and year > 0"

    all_entries = KakeiboEntry.find(:all,
                                    :select=>'user_id, amount, creditor_id, creditor_sub_id, debtor_id, debtor_sub_id, transaction_date',
                                    :order=>"transaction_date asc",
                                    :conditions=>"user_id=#{user_id}")
    all_entries.each do |entry|
      Summary.update_summaries(entry, entry.amount)
    end
  end


  def Summary.get_table(user_id, year, month, num_col)
    table = {}
    
    num_col.times do |col|
      cond = ""
      if month == 0 then
        cond = "user_id=#{user_id} and " +
          "month=0 and year<=#{year}"
      else
        cond = "user_id=#{user_id} and " +
          "((year=#{year} and 0 < month and month<=#{month}) or (year<#{year}))"
      end
      last_sum = Summary.find(:all,
                              :select=>'year, month',
                              :conditions=>cond,
                              :order=>"year desc, month desc",
                              :limit=>1).first

      rows = Summary.find(:all,
                          :select=>'category_id, sum_amount, balance, budget',
                          :conditions=>"user_id=#{user_id} and year=#{last_sum.year} and month=#{last_sum.month}"
                          )

      hash = {}
      rows.each do |v|
        next if v.category_id == 0
        if year == last_sum.year and month == last_sum.month then
          hash[v.category_id] = [v.sum_amount, v.balance, v.budget]
        else
          hash[v.category_id] = [0, v.balance, 0]
        end
      end
    
      key = sprintf("%04d%02d", year, month)
      table[key] = hash

      if month == 0
        year += 1
      else
        month += 1
        if month == 13
          month = 1
          year += 1
        end
      end
    end
    
    return table
  end


  private
  def Summary.copy_last_summary(user_id, year, month)
    cond = ""
    if month == 0 then
      cond = "user_id=#{user_id} and " +
        "month=0 and year<=#{year}"
    else
      cond = "user_id=#{user_id} and " +
        "((year=#{year} and 0 < month and month<=#{month}) or (year<#{year}))"
    end
    last_sum = Summary.find(:all,
                            :select=>'year, month',
                            :conditions=>cond,
                            :order=>"year desc, month desc",
                            :limit=>1).first
    
    if last_sum.year == year and last_sum.month == month then
      # do nothing
    else
      # copy last sums
      cond = "user_id=#{user_id} and month=#{last_sum.month} and year=#{last_sum.year}"
      last_sums = Summary.find(:all,
                               :select=>'category_id, balance, budget',
                               :conditions=>cond)
      last_sums.each do |last_sum|
        Summary.create!(:user_id => user_id,
                        :year => year,
                        :month => month,
                        :sum_amount => 0,
                        :category_id => last_sum.category_id,
                        :balance => last_sum.balance,
                        :budget => 0)
      end
    end
  end


  private
  def Summary.calc_amount_table(user_id)
    all_entries = KakeiboEntry.find(:all,
                                    :select=>'amount, creditor_id, creditor_sub_id, debtor_id, debtor_sub_id, transaction_date',
                                    :conditions=>"user_id=#{user_id}")

    table = {}
    all_entries.each do |e|
      date1 = e.transaction_date.strftime("%Y%m")
      date2 = e.transaction_date.strftime("%Y00")

      [date1, date2].each do |date|
        if not table.key?(date) then
          table[date] = {}
        end

        category_amount_pair = [[e.creditor_id, -e.amount],
                                [e.creditor_sub_id, -e.amount],
                                [e.debtor_id, e.amount],
                                [e.debtor_sub_id, e.amount]]
        category_amount_pair.each do |pair|
          category = pair[0]
          amount = pair[1]
          if not table[date].key?(category) then
            table[date][category] = 0
          end
          table[date][category] += amount
        end
      end
    end

    return table
  end
end

