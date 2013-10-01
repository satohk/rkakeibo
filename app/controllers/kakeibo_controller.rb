class KakeiboController < ApplicationController
  before_filter :authenticate_user!

  def update
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])

      #test wait
      sleep 2
      
      entry = KakeiboEntry.update_with_summary(:id => data["update_id"],
                                               :user_id => current_user.id,
                                               :amount => data["amount"],
                                               :creditor_id => data["creditor_id"],
                                               :creditor_sub_id => data["creditor_sub_id"],
                                               :debtor_id => data["debtor_id"],
                                               :debtor_sub_id => data["debtor_sub_id"],
                                               :transaction_date => KakeiboEntry.conv_date(data["transaction_date"]),
                                               :memo => data["memo"]
                                               )
      if entry != nil
        logger.debug "update success" 
        result = {:type => "success", :entry_id => entry.id}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: db error" 
        result = {:type => "error", :msg => "db error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  rescue ArgumentError
    logger.debug "ArgumentError: Date ''#{data["transaction_date"]}'" 
    result = {:type => "error", :msg => "argument error"}
    render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
  end

  
  def add
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])

      #test wait
      sleep 2

      entry = KakeiboEntry.create_with_summary(
                          :user_id => current_user.id,
                          :amount => data["amount"],
                          :creditor_id => data["creditor_id"],
                          :creditor_sub_id => data["creditor_sub_id"],
                          :debtor_id => data["debtor_id"],
                          :debtor_sub_id => data["debtor_sub_id"],
                          :transaction_date => KakeiboEntry.conv_date(data["transaction_date"]),
                          :memo => data["memo"]
                          )
      if entry != nil
        logger.debug "add success" 
        result = {
          :type => "success",
          :temp_id => data["temp_id"],
          :new_id => entry.id
        }
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: db error" 
        result = {:type => "error", :msg => "db error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  rescue ArgumentError
    logger.debug "ArgumentError: Date ''#{data['transaction_date']}'" 
    result = {:type => "error", :msg => "argument error"}
    render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
  end
  

  def remove
    logger.debug "KakeiboController remove"
    
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])

      #test wait
      sleep 2
      
      res = KakeiboEntry.delete_with_summary(data["id_list"], current_user.id)

      if res == true
        logger.debug "remove success" 
        result = {
          :type => "success",
        }
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: db error" 
        result = {:type => "error", :msg => "db error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  end


  def get_entries
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])
      offset = data["offset"]
      limit = data["limit"]
      option = data["option"]

      logger.debug option
      
#       rows = KakeiboEntry.find(:all,
#                                :select=>'*',
#                                :conditions=>"",
#                                :order=>"transaction_date desc",
#                                :limit=>limit,
#                                :offset=>offset)

      condition = KakeiboEntry.conv_option_array2condition_str(option, current_user.id)
      rows = KakeiboEntry.find_with_option_array(offset, limit, condition, "transaction_date desc")

      p "rows="
      p rows

      if rows != nil
        result = {
          :type => "success",
          :offset => offset,
          :limit => rows.size,
          :rows => rows
        }

        if data["req_all_ct"].to_i == 1
          result[:all_ct] = KakeiboEntry.count_by_sql("select count(id) from kakeibo_entries where " + condition)
        end
      
        # test wait
        sleep 2

        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: param error" 
        result = {:type => "error", :msg => "param error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  end
  
  def get_summaries
    if user_signed_in?
      # test wait
      sleep 2

      data = ActiveSupport::JSON.decode(params[:json])
      year = data["year"]
      month = data["month"]
      num_col = data["num_col"]
      
      table = Summary.get_table(current_user.id, year, month, num_col)

      result = {
        :type => "success",
        :table => table
      }
      
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  end


  def import
    if user_signed_in?
      # test wait
      sleep 2

      file = params[:file]

      KakeiboEntry.import_csv(file, current_user.id)

      result = {
        :type => "success",
      }
      
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  end


  def update_budget
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])

      logger.debug data

      #test wait
      sleep 2
      
      budget_hash = {}
      data["budget_hash"].each_pair do |key, val|
        budget_hash[key.to_i] = val.to_i
      end

      result = Summary.update_budget(current_user.id,
                                     data["year"],
                                     data["month"],
                                     budget_hash
                                    )
      if result
        logger.debug "update success" 
        result = {:type => "success"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: db error" 
        result = {:type => "error", :msg => "db error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  rescue ArgumentError
    logger.debug "ArgumentError" 
    result = {:type => "error", :msg => "argument error"}
    render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
  end


  def update_category
    if user_signed_in?
      data = ActiveSupport::JSON.decode(params[:json])

      #test wait
      sleep 2

      result = Category.update(current_user.id,
                               data["add_list"],
                               data["mod_list"],
                               data["del_id_list"],
                               data["id_modify_list"])

      logger.debug data

      if result
        logger.debug "update success" 
        result = {:type => "success"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      else
        logger.debug "Error: db error" 
        result = {:type => "error", :msg => "db error"}
        render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
      end
    else
      logger.debug "Error: not logged in" 
      result = {:type => "error", :msg => "not logged in"}
      render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
    end
  rescue ArgumentError
    logger.debug "ArgumentError" 
    result = {:type => "error", :msg => "argument error"}
    render :json => result.to_json.html_safe, :content_type => 'applicaton/json'
  end

  
  def test_sleep
    logger.debug "SLEEP 2s"
    sleep 2
    render :nothing => true, :status => 200, :content_type => 'text/html'
  end
end
