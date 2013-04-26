class Setting < ActiveRecord::Base
  attr_accessible :user_id, :key, :value


  def Setting.settings_json_for_user(user_id)
    settings = Setting.where(:user_id => user_id)
    
    settings_hash = {}
    settings.each do |val|
      settings_hash[val.key] = val.value
    end
    return settings_hash.to_json.html_safe
  end

  def Setting.import_hash(hash, user_id)
    settings = []

    hash.each do |key, val|
      settings << Setting.new(:user_id => user_id, :key => key, :value => val)
    end

    Setting.import settings
  end
end
