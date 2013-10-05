class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.integer :user_id
      t.integer :parent_category_id
      t.string  :name
      t.boolean :is_creditor
      t.integer :category_type
      t.string  :shortcut
      t.integer :display_order

      t.timestamps
    end
    # add_index :categories, [:user_id, :id], :unique => true
    add_index :categories, [:user_id, :display_order], :unique => false
  end
end
