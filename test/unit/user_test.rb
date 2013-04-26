require 'test_helper'


class UserTest < ActiveSupport::TestCase

  test "init_user" do
    num_test_user = 10

    num_test_user.times do |user_id|
      init_user_category_and_summary(user_id)
    end

    # check category
    num_test_user.times do |user_id|
      c = Category.find(:all, :conditions=>"user_id=#{user_id}")
      assert_equal NUM_CATEGORIES_FOR_A_USER, c.length
    end

    c = Category.find(:all)
    assert_equal NUM_CATEGORIES_FOR_A_USER * num_test_user, c.length

    # check guard summary
    num_test_user.times do |user_id|
      c_list = Category.find(:all, :conditions=>"user_id=#{user_id}")
      c_list.each do |c|
        s = Summary.find(:all, :conditions=>"category_id=#{c.id}")

        assert_equal 1, s.length
        assert_equal user_id, s[0].user_id
        assert_equal 0, s[0].year
        assert_equal 0, s[0].month
        assert_equal 0, s[0].sum_amount
        assert_equal 0, s[0].balance
        assert_equal 0, s[0].budget
      end

      s = Summary.find(:all, :conditions=>"user_id=#{user_id} and category_id=0")

      assert_equal 1, s.length
      assert_equal user_id, s[0].user_id
      assert_equal 0, s[0].year
      assert_equal 0, s[0].month
      assert_equal 0, s[0].sum_amount
      assert_equal 0, s[0].balance
      assert_equal 0, s[0].budget
    end

    s = Summary.find(:all)
    assert_equal (NUM_CATEGORIES_FOR_A_USER + 1) * num_test_user, s.length

  end

end
