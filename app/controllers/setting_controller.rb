class SettingController < ApplicationController
  before_filter :authenticate_user!

  def upload
    if user_signed_in?

      data = ActiveSupport::JSON.decode(params[:json])

      table = data["table"]
      result = Setting.import_hash(table, current_user.id)

      if result
        logger.debug "upload success" 
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
  end
end
