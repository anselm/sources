require 'uri'

class Notes < Merb::Controller

  before :setup # :only :show, :edit, :save

  def setup
    @lang = params[:lang]
    @lang = "" if !@lang
    #DataObjects::Postgres.logger = DataObjects::Logger.new("test.log",:debug)
    #DataMapper.logger.warn("***************************** what the heck")
    @note = nil
    begin
      @note = Note[params[:id]]
      @lang = params[:lang]
      if @lang && @lang != nil && @lang != "" && @lang.length >1 && @note && @note.content_language != @lang 
        @note = Note.first(:content_friend => @note.id, :content_language => @lang )
      end
    rescue
        puts "notes controller error : #{$!}"
    end
    puts "Note_Controller: looking at note #{@note.id}"
  end

  def index

    @notes = []

    @search = params[:search]
    @lang = params[:lang]
    @lang = "" if !@lang
    if @search
      @search = @search.downcase
      Note.all.each do |n|
        next if params[:lang] == "arabic" && n.content_language != "arabic" 
        next if params[:lang] != "arabic" && n.content_language == "arabic"
        Note.get_marks.each do |mark|
          @name = mark[:name].to_s
          @layout = mark[:layout]
          next if @layout == :banner
          next if @layout == :box_start
          next if @layout == :box_end
          @value = n.attribute_get(mark[:name]) 
          if @value && @value.downcase.include?(@search)
            @notes << n
            break
          end
        end
        #elsif n.name.downcase.include?(@search)
        #  @notes << n
        #elsif n.website.downcase.include?(@search)
        #  @notes << n
        #end
      end
    else 
      @temp = Note.all(:order => [:id.asc], :offset => 0 )
      @temp.each do |n|
        if params[:lang] == "arabic" 
          @notes << n if n.content_language == "arabic"
        elsif @lang != "arabic" 
          @notes << n if n.content_language != "arabic"
        end
      end
    end

    # paging

    @offset = 0
    @offset = params[:offset].to_i if params[:offset] 
    @total = 0
    @cap = 50
    @total = @notes.length if @notes
    @notes = @notes[@offset..@offset+49]
    @notes = [] if !@notes
    render
  end

  def show
    if @note
      build_form @note, true
    else
      return "Bug # 123: Sorry there seems to be no valid note here? Please mention this as a bug with the url"
    end
  end

  def edit
    if @note
      build_form @note, false
    else
      return "Bug # 124: Sorry there seems to be no valid note here? Please mention this as a bug with the url"
    end
  end

  def new
    if params[:website] && params[:website].length > 1
      @note = find_similar(:website => params[:website] ) 
    end
    @note = Note.new if !@note
    if @note
      build_form @note, false
    else
      return "Bug # 125: Sorry there seems to be no valid note here? Please mention this as a bug with the url"
    end
  end

  def delete
    render
  end

  def destroy
    @friend = Note.first(:content_friend => "#{@note.id}" )
    #@friend.update_attributes(:destroyed => "true" )
    #@note.update_attributes(:destroyed => "true" )
    @friend.destroy
    @note.destroy
    redirect "/" # url("redirect url(:note,@note)
  end

  def note_copy(note)
    temp = Note.create!
    Note.get_marks.each do |mark|
      @name = mark[:name].to_s
      @layout = mark[:layout]
      next if @layout == :banner
      next if @layout == :box_start
      next if @layout == :box_end
      @value = note.attribute_get(mark[:name]) 
      temp.attribute_set(mark[:name],@value)
    end
    return temp
  end

  def find_valid(website)
    begin
      result = URI.parse(website)
      return result
    rescue
    end
    return false
  end

  def find_similar(website,avoid=nil)
      find_url = URI.parse(website)
      find_host = find_url.host.downcase
      find_host = find_host[4..-1] if find_host[0..3] == "www."
      Note.all.each do |n|
        next if avoid != nil && ( avoid.id == n.id || n.content_friend == avoid.id )
        note_url = URI.parse(n.website)
        note_host = note_url.host.downcase
        note_host = note_host[4..-1] if note_host[0..3] == "www."
        return n if note_host == find_host
      end
    return nil
  end

  def save
    @is_new = false
    @is_new = true if !@note || @note.id < 1 || !@note.id

 # fix the url for the user...
 if params[:note][:website] && params[:note][:website][0..6] != "http://"
   params[:note][:website] = "http://#{params[:note][:website]}"
 end

    if !find_valid(params[:note][:website])
      errors = []
      errors << "the website appears to be invalid? #{params[:note][:website]}"
      return "sorry the website appears to be invalid? #{params[:note][:website]}"
    end
  
    @similar = find_similar(params[:note][:website],@note)

    if @similar
      @error = "Sorry, found a different similar note at <a href='/notes/#{@similar.id}'>#{@similar.id}</a>"
      return @error
    end

    @note = Note.create!() if !@note
  
    if @note
      # TODO: learn how to get error state back from datamapper 
      errors = []
      success = true
      Note.get_marks.each do |mark|
        layout = mark[:layout]
        name = mark[:name] 
        if ![:text,:checkbox,:big,:menu,:radio,:hidden].index(layout)
          errors << "skipping #{name} with layout #{layout}"
          next
        end
        if layout == :radio
          # TODO FIX 
          next
        end
        if layout == :checkbox
          temp = mark[:tokens].collect { 
                      |token| token if params[:note]["#{name}_#{token}"]
                    }
          value = temp.join(" ")
        else
          value = params[:note][name]
        end
        local_success = true
        begin
          if @note.update_attributes(name => value)
            local_success = true
          else
            local_success = false
          end
        rescue
          local_success = false
        end
        success = false if !local_success
        if !local_success
          errors << "<font color=red>Problem setting #{name} => #{value}</font>"
        else
          errors << "<font color=green>Successfully #{name} => #{value}</font>"
        end
      end
    
      if success
        @note.update_attributes(:destroyed => "false" );
        if !Note.first(:content_friend => "#{@note.id}" )
          if @note.content_language == "arabic"
            @arabic = @note
            @english = note_copy(@arabic)
            puts " we were previously arabic "
          elsif @note.content_language == "english"
            @english = @note
            @arabic = note_copy(@english)
            puts " previously english "
          elsif params[:note][:content_language] == "arabic"
            @arabic = @note
            @english = note_copy(@arabic)
            puts "new arabic"
          else
            @english = @note
            @arabic = note_copy(@english)
            puts "new english due to #{params[:note][:content_language]}"
          end
          @english.update_attributes(:content_friend => "#{@arabic.id}" )
          @english.update_attributes(:content_language => "english" )
          @arabic.update_attributes(:content_friend => "#{@english.id}" )
          @arabic.update_attributes(:content_language => "arabic" )
        end
        redirect url(:note,@note)
        return "redirecting you to note"
      end
      return errors.join("<br/>\n")
    end
  end

  def remake
    str = "new pairs"
    Note.all.each do |@note|
      if !Note.first(:content_friend => "#{@note.id}" )
        if @note.content_language == "arabic"
          @arabic = @note
          @english = note_copy(@note)
        else
          @english = @note
          @arabic = note_copy(@note)
        end
        @english.update_attributes(:content_friend => "#{@arabic.id}" )
        @english.update_attributes(:content_language => "english" )
        @arabic.update_attributes(:content_friend => "#{@english.id}" )
        @arabic.update_attributes(:content_language => "arabic" )
        str = "#{str} pair made #{@english.id} => #{@arabic.id} <br/>"
      end
    end
    return str 
  end

  def build_form(note,show=false)

    @@params = params

      # get previous and next
      @@prev = nil
      @@previous = nil
      @@postious = nil
      Note.all(:order => [:id.asc], :limit => 999, :offset => 0 ).each do |n|
        storeme = false
        if params[:lang] == "arabic" 
          storeme = true if n.content_language == "arabic"
        elsif @lang != "arabic" 
          storeme = true if n.content_language != "arabic"
        end
        if storeme == true
          @@previous = @@prev if ( n.id == note.id  && @@previous == nil )
          @@postious = n if ( @@prev && @@prev.id == note.id && @@postious == nil )
          @@prev = n
        end
      end

    Markaby::Builder.set(:indent, 1)
    mab = Markaby::Builder.new
    mab.div(:style=>"padding:16px;") do

      ######################################################################## 
      # render a form
      ######################################################################## 
      text("<table><tr><td>");

      if show
        div do
          a("Delete this note",
            :style=>"float:right;border:1px solid red; padding: 4px;",
             :href=>"/notes/destroy/#{note.id||0}" );
          a("Edit this note",
            :style=>"float:right;border:1px solid red; padding: 4px;",
             :href=>"/notes/edit/#{note.id||0}" );
          if @@postious
            a("NEXT>>",
            :style=>"float:right;border:1px solid red; padding: 4px;",
             :href=>"/notes/#{@@postious.id||0}" );
          end
          if @@previous
             a("<<PREV",
            :style=>"float:right;border:1px solid red; padding: 4px;",
             :href=>"/notes/#{@@previous.id||0}" );
          end
        end
      end

      if note.destroyed == "true"
        h1 "This note is already in a deleted state - save it to undelete"
      end

      ######################################################################## 
      # render property fields
      ######################################################################## 
 
      form(:action=>"/notes/save/#{note.id||0}") do 
        button("Create!", :type => :submit) if !show

          if @@params[:lang] == "arabic"
            input( :type => "hidden", 
                   :id => "note[content_language]",
                   :name => "note[content_language]",
                   :value => "arabic" )
  
          else
            input( :type => "hidden", 
                   :id => "note[content_language]",
                   :name => "note[content_language]",
                   :value => "english" )
          end

        Note.get_marks.each do |mark|
          @name = mark[:name].to_s
          @say = @name.split("_").collect {|s| s.capitalize } .join(" ")
          @layout = mark[:layout]
          @mandatory = mark[:mandatory]
          ################################################################### 
          # banner
          ################################################################### 
          if @layout == :banner
            h1 "", @say 
            next
          end
          ################################################################### 
          # boxes - bounding artwork to group elements
          ################################################################### 
          if @layout == :box_start
            text ("<div class='form_box'>")
            h2 @say
            br
            next
          elsif @layout == :box_end
            br
            text("</div>")
            next
          end
          ################################################################### 
          # fetch the value of this field
          ################################################################### 
          @value = ""
          begin
            @value = note.attribute_get(mark[:name]) 
          rescue
          end
          begin
            @value = @@params[mark[:name]] if @@params[mark[:name]]
          rescue
          end
          @semantic = "note[#{@name}]"
          ################################################################### 
          # HIDDEN
          ################################################################### 
          if mark[:layout] == :hidden
            input( :type => "hidden", 
                   :id => @semantic, :name => @semantic,
                   :value => @value )
          end
          ################################################################### 
          # TEXT
          ################################################################### 
          if mark[:layout] == :text 
            a @say , :href=>"#",
                     :onclick=>"openpopup('/help/form_faq#{@name}')",
                     :class=>"form_label"
            if !show
              input( :name => @semantic, 
                     :class=>"form_text",
                     :value => @value ) if !show
              span("*", :style => "color:red" ) if @mandatory
            else
              div @value, :class => "form_show"
            end
            div :style=>"clear:both;"
          end
          ################################################################### 
          # TEXTAREA
          ################################################################### 
          if @layout == :big
            a @say , :href=>"#",
                     :onclick=>"openpopup('/help/form_faq#{@name}')",
                     :class=>"form_label"
            if !show
                textarea( @value,
                       :class => "form_textarea",
                       :name => @semantic ) 
            else 
              div @value, :class => "form_show"
            end
            div :style=>"clear:both;"
          end
          ################################################################### 
          # RADIO
          ################################################################### 
          if mark[:layout] == :radio
            a @say , :href=>"#",
                     :onclick=>"openpopup('/help/form_faq#{@name}')",
                     :class=>"form_label"
            mark[:tokens].each do |token|
              span token.to_s if !show
              @checked = @temp == token.to_s
              if !show && @checked
                input(:type => "radio" ,
                      :class => "subhead_small_plain",
                      :name=> @semantic,
                      :value => token.to_s, 
                      :checked => "checked" )
              elsif !show && !@checked
                input(:type => "radio" ,
                      :class => "subhead_small_plain",
                      :name => @semantic,
                      :value => token.to_s)
              end
            end
            span(@value,:class=>"form_show") if show
            div :style=>"clear:both;"
          end
          ################################################################### 
          # CHECKBOX
          ################################################################### 
          if @layout == :checkbox
            table { tr { td {
              a @say , :href=>"#", 
                     :onclick=>"openpopup('/help/form_faq#{@name}')", 
                     :class=>"form_label"
            }
            td {
              @values = []
              @values = @value.split(" ") if @value
              mark[:tokens].each do |token|
                @magic = "note[#{@name}_#{token}]"
                @checked = @values.index(token.to_s)
                span token.to_s.capitalize if !show
                if !show && @checked
                  input( :type => "checkbox", 
                         :class => "subhead_small_plain", 
                         :name => @magic, 
                         :checked => "checked" ) 
                end
                if !show && !@checked
                  input( :type => "checkbox", 
                         :class => "subhead_small_plain", 
                         :name => @magic  )
                end
                p(@value,:style=>"padding:4px;") if show && @checked
              end
            } } }
          end

          ################################################################### 
          # PULL DOWN MENU
          ################################################################### 
          if @layout == :menu && !show
            a @say , :href=>"#", 
                     :onclick=>"openpopup('/help/form_faq#{@name}')",
                     :class=>"form_label"
            select(:class => "subhead_small_plain", :name => @semantic) do
              mark[:tokens].each do |token|
                if @value == token.to_s
                  text "<option value=\"#{token}\" selected>#{token}</option>"
                else
                  option(token.to_s, :value => token ) 
                end
              end
            end
            div :style=>"clear:both;"
          elsif @layout == :menu && show
            a @say , :href=>"#", 
                     :onclick=>"openpopup('/help/form_faq#{@name}')", 
                     :class=>"form_label"
            span(@value,:class=>"form_show")
            div :style=>"clear:both;"
          end

          #################################################################### 
          # done iteration
          #################################################################### 
        end
        # end of form
        button("Create!", :type => :submit) if !show
      end

      ######################################################################## 
      # present a map
      # TODO: later this should be a property field of the subject
      ######################################################################## 
      text("</td><td valign=top width=500px>");
      div :id=>"map", 
          :style=>"float:right;width:400px;height:400px;border:3px solid red;"
    
      text("</td></tr></table>");
    end

    render mab.to_s 

  end
  
end
