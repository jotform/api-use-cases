#!/usr/bin/env ruby

# Include JotForm Ruby module
require_relative 'JotForm'

# Net::HTTP necessary for downloads
require 'net/http'

# FileUtils module is necessary for recursive folder creation
require 'fileutils'

$stdout.sync = true

# Initialize JotFormAPI Ruby client with apiKey
jotform = JotForm.new(ARGV[0])

# Set formID to download your files in submissions
formID = ARGV[1]

# Get list of files from JotFormAPI
files = jotform.getFormFiles(formID)

successfulDownloads = 0

def fetch(fileURI, limit = 3)
    # set URI to download uploaded files
    url = URI(fileURI)
    req = Net::HTTP::Get.new(url.path)
    response = Net::HTTP.start(url.host, url.port, :use_ssl => url.scheme == 'https') { |http| http.request(req) }
    case response
    when Net::HTTPSuccess     then response
    when Net::HTTPRedirection then fetch(response['location'], limit - 1)
    else
        response.error!
    end
end

files.each do |uploadedFile|
    # replace spaces in url
    fileURL = uploadedFile['url']
    if ( fileURL =~ /\s/ )
        fileURL = fileURL.gsub! /\s+/, '+'
    end
    puts fileURL

    print "Downloading "+ uploadedFile["name"] 
    
    # Path to download files
    folder = File.join(Dir.home,"JotForm",formID, uploadedFile["submission_id"])

    # Create path if it's not exist
    FileUtils.mkpath folder

    begin
        resp = fetch(fileURL)
	open(File.join(folder, uploadedFile["name"]), "wb") do |file|
            file.write(resp.body)
            print " -- Completed\n"
	    # Increment the successful downloads for stats
            successfulDownloads += 1
        end
    rescue Exception => e
        resp = nil
        print "Error while downloading " + uploadedFile['name'] + ": " + e.message + "\n"
    end
end

puts "\n\n\####################################"
puts successfulDownloads.to_s + " files downloaded successfully"
puts "You can find your files in "+ File.join(Dir.home,"JotForm",formID)
puts "####################################\n\n"
