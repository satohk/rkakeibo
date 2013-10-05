# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130310140232) do

  create_table "categories", :force => true do |t|
    t.integer  "user_id"
    t.integer  "parent_category_id"
    t.string   "name"
    t.boolean  "is_creditor"
    t.integer  "category_type"
    t.string   "shortcut"
    t.integer  "display_order"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
  end

  add_index "categories", ["user_id", "display_order"], :name => "index_categories_on_user_id_and_display_order"

  create_table "kakeibo_entries", :force => true do |t|
    t.integer  "user_id"
    t.integer  "debtor_id"
    t.integer  "debtor_sub_id"
    t.integer  "creditor_id"
    t.integer  "creditor_sub_id"
    t.integer  "amount"
    t.string   "memo"
    t.datetime "transaction_date"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
  end

  add_index "kakeibo_entries", ["user_id", "creditor_id"], :name => "index_kakeibo_entries_on_user_id_and_creditor_id"
  add_index "kakeibo_entries", ["user_id", "debtor_id"], :name => "index_kakeibo_entries_on_user_id_and_debtor_id"
  add_index "kakeibo_entries", ["user_id", "transaction_date"], :name => "index_kakeibo_entries_on_user_id_and_transaction_date"

  create_table "settings", :force => true do |t|
    t.integer  "user_id"
    t.string   "key"
    t.string   "value"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "settings", ["user_id", "key"], :name => "index_settings_on_user_id_and_key", :unique => true
  add_index "settings", ["user_id"], :name => "index_settings_on_user_id"

  create_table "summaries", :force => true do |t|
    t.integer  "user_id"
    t.integer  "category_id"
    t.integer  "year"
    t.integer  "month"
    t.integer  "sum_amount"
    t.integer  "balance"
    t.integer  "budget"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "summaries", ["user_id", "year", "month", "category_id"], :name => "index_summaries_on_user_id_and_year_and_month_and_category_id", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
