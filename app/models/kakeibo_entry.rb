class KakeiboEntry < ActiveRecord::Base
  attr_accessible :user_id, :amount, :creditor_id, :creditor_sub_id, :debtor_id, :debtor_sub_id, :transaction_date, :memo
  
  
  def KakeiboEntry.update_with_summary(args)
    ActiveRecord::Base.transaction do
      entries = KakeiboEntry.where(:user_id => args[:user_id], :id => args[:id])
      if entries.length == 0
        return nil
      end
      entry = entries.first
      
      Summary.update_summaries(entry, -entry.amount)

      res = entry.update_attributes(
                             :amount => args[:amount],
                             :creditor_id => args[:creditor_id],
                             :creditor_sub_id => args[:creditor_sub_id],
                             :debtor_id => args[:debtor_id],
                             :debtor_sub_id => args[:debtor_sub_id],
                             :transaction_date => args[:transaction_date],
                             :memo => args[:memo]
                             )
      
      Summary.update_summaries(entry, entry.amount)
      
      return entry
    end
  rescue => e
    logger.debug e
    return nil
  end
  

  def KakeiboEntry.create_with_summary(args)
    ActiveRecord::Base.transaction do
      entry = KakeiboEntry.create!(
                          :user_id => args[:user_id],
                          :amount => args[:amount],
                          :creditor_id => args[:creditor_id],
                          :creditor_sub_id => args[:creditor_sub_id],
                          :debtor_id => args[:debtor_id],
                          :debtor_sub_id => args[:debtor_sub_id],
                          :transaction_date => args[:transaction_date],
                          :memo => args[:memo]
                          )

      Summary.update_summaries(entry, entry.amount)
      return entry
    end
  rescue => e
    logger.debug e
    return nil
  end
  
  def KakeiboEntry.delete_with_summary(id_list, user_id)
    ActiveRecord::Base.transaction do
      id_list.each do |id|
        entries = KakeiboEntry.where(:id => id, :user_id => user_id)
        if entries.length == 0
          raise ActiveRecord::Rollback
        end
        entry = entries.first
        Summary.update_summaries(entry, -entry.amount)
        entry.destroy
      end
    end
    return true
  rescue => e
    logger.debug e
    return false
  end


  def KakeiboEntry.import_csv(file, user_id)
    categories = Category.find(:all,
                               :select=>'name, parent_category_id, id',
                               :conditions=>"user_id=#{user_id}")

    name2id = {}
    categories.each do |val|
      name2id[val.name + val.parent_category_id.to_s] = val.id
    end

    file.tempfile.each do |line|
      line_utf8 = line.encode("UTF-8", "Shift_JIS")
      debtor, debtor_sub, creditor, creditor_sub, amount_str, memo, date_str = line_utf8.split(',')
      amount = amount_str.to_i
      year, month, day = date_str.split("/").map{|v| v.to_i}
      date = DateTime.new(year, month, day, 0, 0, 0, 0)

      debtor_id = name2id[debtor + "0"]
      creditor_id = name2id[creditor + "0"]
      debtor_sub_id = name2id[debtor_sub + debtor_id.to_s]
      creditor_sub_id = name2id[creditor_sub + creditor_id.to_s]

      entry = KakeiboEntry.create_with_summary(
                          :user_id => user_id,
                          :amount => amount,
                          :creditor_id => creditor_id,
                          :creditor_sub_id => creditor_sub_id,
                          :debtor_id => debtor_id,
                          :debtor_sub_id => debtor_sub_id,
                          :transaction_date => date,
                          :memo => memo
                          )
      if entry == nil
        return false
      end
    end

  rescue => e
    logger.debug e
    return false
  end
end
