#!/usr/bin/env ruby

# Include JotForm Ruby module
require_relative 'JotForm'

# Net::HTTP necessary for downloads
require 'net/http'

# FileUtils module is necessary for recursive folder creation
require 'fileutils'

$stdout.sync = true

# Initialize JotFormAPI Ruby client with apiKey
jotform = JotForm.new("#apiKey")

# Set formID to download your files in submissions
formID = "#formID"

# Get list of files from JotFormAPI
files = jotform.getFormFiles(formID)

successfulDownloads = 0

files.each do |uploadedFile|
    # set URI to download uploaded files
    uri = URI(uploadedFile['url'])

    print "Downloading "+ uploadedFile["name"] 
    
    # Path to download files
    folder = File.join(Dir.home,"JotForm",formID, uploadedFile["submission_id"])

    # Create path if it's not exist
    FileUtils.mkpath folder

    # Start Net::HTTP
    Net::HTTP.start(uri.host, uri.port) do |http|

        # Get response from URL on HTTP protocol
        resp = Net::HTTP.get_response(uri)

        # Check if it's a redirect or not
        while resp.code == '301' || resp.code == '302'
            resp = Net::HTTP.get_response(URI.parse(resp.header['location']))
        end

        # If URL returns with HTTP 200 OK, then save the response to file with fileName
        if resp.code == '200'  
            open(File.join(folder, uploadedFile["name"]), "wb") do |file|
                file.write(resp.body)
                print " -- Completed\n"
            end
            # Increment the successful downloads for stats
            successfulDownloads += 1
        else
            puts "Error while downloading uploadedFile[\"name\"]"
        end
    end
end
puts "\n\n\####################################"
puts successfulDownloads.to_s + " files downloaded successfully"
puts "You can find your files in "+ File.join(Dir.home,"JotForm",formID)
puts "####################################\n\n"