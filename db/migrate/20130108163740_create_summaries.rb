class CreateSummaries < ActiveRecord::Migration
  def change
    create_table :summaries do |t|
      t.integer :user_id
      t.integer :category_id
      t.integer :year
      t.integer :month
      
      t.integer :sum_amount
      t.integer :balance
      t.integer :budget

      t.timestamps
    end
    add_index :summaries, [:user_id, :year, :month, :category_id], :unique => true
  end
end
