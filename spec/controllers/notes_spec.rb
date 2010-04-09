require File.join(File.dirname(__FILE__), "..", 'spec_helper.rb')

describe Notes, "index action" do
  before(:each) do
    dispatch_to(Notes, :index)
  end
end