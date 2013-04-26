class CreateKakeiboEntries < ActiveRecord::Migration
  def change
    create_table :kakeibo_entries do |t|
      t.integer :user_id
      t.integer :debtor_id
      t.integer :debtor_sub_id
      t.integer :creditor_id
      t.integer :creditor_sub_id
      t.integer :amount
      t.string :memo
      t.datetime :transaction_date

      t.timestamps
    end
    add_index :kakeibo_entries, [:user_id, :debtor_id],        :unique => false
    add_index :kakeibo_entries, [:user_id, :creditor_id],      :unique => false
    add_index :kakeibo_entries, [:user_id, :transaction_date], :unique => false
  end
end
