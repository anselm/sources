class User
  include DataMapper::Resource
  property :login, String
  property :password, String
end
