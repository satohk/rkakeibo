class CreateSettings < ActiveRecord::Migration
  def change
    create_table :settings do |t|
      t.integer :user_id
      t.string :key
      t.string :value

      t.timestamps
    end

    add_index :settings, [:user_id],       :unique => false
    add_index :settings, [:user_id, :key], :unique => true
  end
end
