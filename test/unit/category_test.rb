require 'test_helper'

class CategoryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end


  test "categories_json_for_user" do
    num_test_user = 5

    # add categories
    num_test_user.times do |user_id|
      init_user_category_and_summary(user_id)
    end

    # check categories
    num_test_user.times do |user_id|
      c_db = Category.find(:all, :conditions=>"user_id=#{user_id}", :order=>"display_order asc")
      c_json = Category.categories_json_for_user(user_id)
      c_json_dec = ActiveSupport::JSON.decode(c_json)

      assert_equal NUM_CATEGORIES_FOR_A_USER, c_db.length

      c_json_dec.each_index do |i|
        assert_equal c_db[i].id, c_json_dec[i]["id"]
        assert_equal c_db[i].is_account, c_json_dec[i]["is_account"]
        assert_equal c_db[i].is_creditor, c_json_dec[i]["is_creditor"]
        assert_equal c_db[i].name, c_json_dec[i]["name"]
        assert_equal c_db[i].parent_category_id, c_json_dec[i]["parent_id"]
        assert_equal c_db[i].shortcut, c_json_dec[i]["shortcut"]
        assert_equal c_db[i].display_order, c_json_dec[i]["display_order"]
      end
    end
  end


  test "update" do
  end
end
