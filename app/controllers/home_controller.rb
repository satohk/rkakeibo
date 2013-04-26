
class HomeController < ApplicationController
  def index
    if user_signed_in?
      @categories_json = Category.categories_for_user(current_user.id).to_json.html_safe
      @settings_json = Setting.settings_json_for_user(current_user.id)
    else
      # @categories_json = "[]"
      # @settings_json = "[]"
      redirect_to new_user_session_path
    end
  end
end
