#!/usr/bin/env ruby
require "net/http"
require "uri"
require "rubygems"
require "json"

class JotForm
    attr_accessor :apiKey
    attr_accessor :baseURL
    attr_accessor :apiVersion

    # Create the object
    def initialize(apiKey = nil, baseURL = "http://api.jotform.com", apiVersion = "v1")
        @apiKey = apiKey
        @baseURL = baseURL
        @apiVersion = apiVersion
    end

    def _executeHTTPRequest(endpoint, parameters = nil, type = "GET")
        url = [@baseURL, @apiVersion, endpoint].join("/").concat('?apiKey='+@apiKey)
        url = URI.parse(url)

        if type == "GET"
            response = Net::HTTP.get_response(url)
        elsif type == "POST"
            response = Net::HTTP.post_form(url, parameters)
        end

        if response.kind_of? Net::HTTPSuccess
            return JSON.parse(response.body)["content"]
        else
            puts JSON.parse(response.body)["message"]
            return nil
        end
    end

    def _executeGetRequest(endpoint, parameters = [])
        return _executeHTTPRequest(endpoint,parameters, "GET")
    end

    def _executePostRequest(endpoint, parameters = [])
        return _executeHTTPRequest(endpoint,parameters, "POST")
    end

    def getUser
        return _executeGetRequest("user")
    end

    def getUsage
        return _executeGetRequest("user/usage");
    end

    def getForms
        return _executeGetRequest("user/forms")
    end

    def getSubmissions
        return _executeGetRequest("user/submissions")
    end

    def getSubusers
        return _executeGetRequest("user/subusers")
    end

    def getFolders
        return _executeGetRequest("user/folders")
    end

    def getReports
        return _executeGetRequest("user/reports")
    end

    def getSettings
        return _executeGetRequest("user/settings")
    end

    def getHistory
        return _executeGetRequest("user/history")
    end

    def getForm(formID)
        return _executeGetRequest("form/"+ formID)
    end

    def getFormQuestions(formID)
        return _executeGetRequest("form/"+formID+"/questions")
    end

    def getFormQuestion(formID, qid)
        return _executeGetRequest("form/"+formID+"/question/"+qid)
    end

    def getFormProperties(formID)
        return _executeGetRequest("form/"+formID+"/properties")
    end

    def getFormProperty(formID, propertyKey)
        return _executeGetRequest("form/"+formID+"/properties/"+propertyKey)
    end


    def getFormSubmissions(formID)
        return _executeGetRequest("form/"+ formID +"/submissions")
    end

    def getFormFiles(formID)
        return _executeGetRequest("form/"+formID+"/files")
    end

    def getFormWebhooks(formID)
        return _executeGetRequest("form/"+formID+"/webhooks")
    end

    def getSubmission(sid)
        return _executeGetRequest("submission/"+sid)
    end

    def getReport(reportID)
        return _executeGetRequest("report/"+reportID)
    end

    def getFolder(folderID) 
        return _executeGetRequest("folder/"+folderID)
    end

    def createFormWebhook(formID, webhookURL)
        return _executePostRequest("form/"+formID+"/webhooks",{"webhookURL" => webhookURL} );
    end

    def createFormSubmissions(formID, submission)
        return _executePostRequest("form/"+ formID +"/submissions", submission);
    end
end
