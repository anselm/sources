require 'uri'
require 'cgi'
require 'net/http'


require "rubygems" 
require "activerecord" 

ActiveRecord::Base.establish_connection(
  :adapter  => "postgresql",
  :database => "meedan",
  :username => "meedan",
  :password => "meedan" 
)

class Note < ActiveRecord::Base
end

blah = Net::HTTP.start("sources.meedan.net")
score = 0

File.open("s.log").each { |line|
    score = score + 1
    a = line.index("GET /notes/save") + 4
    b = line.index("HTTP") - 2
    command = CGI::unescape(line[a..b])
    c = command.index("?") - 1
    num = command[12..c]
    res = Note.first(:conditions => { :id => num } )
    if res
      puts ". #{score} #{num} ignoring"
    else
      puts "* #{score} #{num} replaying"
      puts command
      puts "**************"
      res = blah.get(line[a..b])
      puts res
    end
}

