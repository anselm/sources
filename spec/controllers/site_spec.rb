require File.join(File.dirname(__FILE__), "..", 'spec_helper.rb')

describe Site, "index action" do
  before(:each) do
    dispatch_to(Site, :index)
  end
end