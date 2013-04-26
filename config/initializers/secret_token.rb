# Be sure to restart your server when you modify this file.

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
Rkakeibo::Application.config.secret_token = ENV['SECRET_TOEKN'] || '59bdc09407dcce8574b99183b3ccc49b3a3415eb91c42275eae1a2fd7e323baf52299d0c370d7390b9ad5da535198b0b72fd0350ad5f0e01a5bfc461062ca0f6'
