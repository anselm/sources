
class Note

  include DataMapper::Resource

  ###########################################################################
  # MODEL PROPERTIES HELPER
  # Allows storage of extra tags in a fashion similar to java and c#
  ###########################################################################

  @@__marks = []
  def self.property_tag(a,c={})
    c[:layout] = :text if !c[:layout]
    @@__marks << { :name => a, :kind => Text, :layout => c[:layout], :tokens => c[:tokens], :help => c[:help], :mandatory => c[:mandatory ] } 
    c.delete(:layout)
    c.delete(:mandatory)
    c.delete(:tokens)
    c.delete(:help)
    self.property(a,Text,c)
  end
  def self.property_banner(a,c={})
    @@__marks << { :name => a, :layout => :banner, :help => c[:help] } 
  end
  def self.property_box_start(a=nil,c={})
    @@__marks << { :name => a, :layout => :box_start } 
  end
  def self.property_box_end
    @@__marks << { :name => nil, :layout => :box_end } 
  end
  def self.get_marks()
    return @@__marks
  end

  ###########################################################################
  # MODEL PROPERTIES
  ###########################################################################

  # Not displayed - ordinary properties
  property :id, Integer, :serial => true
  property :created_at, DateTime
  property :updated_at, DateTime

  # SUMMARY AREA
  property_banner :media_source_summary
  property_tag :name, :mandatory => true
  property_tag :other_names, :layout => :big, :mandatory => true
  property_tag :website, :mandatory => true
  property_tag :rss_feed

  property_box_start :description_details
  property_tag :description, :layout => :big
  property_tag :description_link
  property_box_end

  property_box_start :location_details 
  property_tag :location_street
  property_tag :location_city
  property_tag :location_state
  property_tag :location_country, :mandatory => true
  property_tag :location_zip
  property_tag :latitude, :layout => :hidden
  property_tag :longitude, :layout => :hidden
  property_box_end

  property_box_start :media_details
  property_tag :media_type,
                      :layout => :menu, 
                      :tokens => [ :Mainstream, :Independent ]
  property_tag :primary_media_operation,
                      :layout => :checkbox,
                      :tokens => [ :Blog, :Newspaper, :Group, 
                                   :TV, :Radio, :WireService ]
  property_tag :ownership, :help => "if available", :layout => :menu,
               :tokens => [ :Individual, :Proprietorship, :Partnership,
                            :Corporation, :NonProfit, :Government ]
  property_tag :owners, :help => "if available"
  property_tag :language,
                      :layout => :checkbox,
                      :tokens => [ :English, :Arabic, :Farsi, :German, :French,
                                   :Italian, :Spanish, :Hebrew, :Hindi, :Urdu ]


  property_tag :audience_size,
               :layout => :radio, 
               :tokens => [ :A10k, :A100k, :A1Million, :Millions, :Billion ]

  property_box_end

  # 'TAGS' AREA

  property_banner :tags
  property_tag :featured_authors, 
               :layout => :big, 
               :help => "if any - separate each name with a comma"
  property_tag :reviewed_authors,
               :layout => :big,
               :help => "from story reviews"
  property_tag :managers, :help => "if available"
  property_tag :scope
  property_tag :other_tags, :layout => :big, :help => "if any"

  # SOURCE

  property_banner :contact_info, 
                  :help => "Indicate how members can contact source"

  property_box_start :web_info
  property_tag :contact_name, :help => "if available"
  property_tag :contact_phone
  property_tag :contact_email
  property_tag :contact_website
  property_box_end

  # EDITORIAL AREA

  property_banner :editorial
  property_tag :about_this_source,
               :layout => :radio,
               :tokens => [ :hide, :show, :feature ]
  property_tag :discuss_this_source, 
               :layout => :radio, 
               :tokens => [ :hide, :show, :feature ]
  property_tag :contact_this_source,
               :layout => :radio, 
               :tokens => [ :hide, :show, :feature ]
  property_tag :show_logo, 
               :layout => :radio,
               :tokens => [ :hide, :show ]
  property_tag :priority,
               :layout => :menu,
               :tokens => [ "Very High", "Medium", "Low", "None" ]
  property_tag :hosted_by,
               :help => "Enter full member names separated by commas"
  property_tag :edited_by
  property_tag :last_edit_date
  property_tag :editor_notes,
               :layout => :big,
               :help => "Add any editorial notes here with your initials"


  property_tag :destroyed, :layout => :hidden

  property :content_language, Text
  property :content_friend, Integer

end
