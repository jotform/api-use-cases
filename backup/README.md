Back-up utility for Jotform

Uses jotform javascript api to authenticate users and then schedules data migration to redis backed servers

Also includes a submissions viewer & submissions search for users to navigate through submissions

frontend directory will include angular.js app and all controllers&views etc.,

backend directory will include an ajax responder written in go

the ajax responder will serve through port 8080 which can be re-routed to port 80 with nginx or another webserver

nginx will be used to serve frontend files to clients