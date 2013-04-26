ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'


NUM_CATEGORIES_FOR_A_USER = 64


class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...

  def init_user_category_and_summary(user_id)
    Category.add_initial_categories_for_user(user_id)
    Summary.add_guard_summaries_for_user(user_id, Category.where(:user_id=>user_id))
  end

end
