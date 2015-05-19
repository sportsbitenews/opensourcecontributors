(function() {
    var app = angular.module('ghca', ['angularMoment']);

    app.constant("moment", moment);

    app.controller("UserController", ["$http","$log", "moment", function($http, $log, moment) {
        // TODO Is this how you fake enums in JS?! I hate JS.
        this.tabs = {
            none: 0,
            repoList: 1,
            eventList: 2
        };
        this.range = function(x) {
            return Array.apply(null, Array(x)).map(function (_, i) {return i+1;});
        };


        this.currentTab = this.tabs.repoList;
        this.isCurrentTab = function(t) {
            return this.currentTab === t;
        };
        this.setCurrentTab = function(t) {
            this.currentTab = t;
            if(t == this.tabs.eventList) {
                this.getGHEvents();
            }
        };

        this.username = "";
        this.processedUsername = ""; // The data below is for...
        this.userUrl = "";
        this.eventCount = 0;
        this.repos = [];

        // Event-related stuff
        this.eventPages = {}; // a cache of sorts
        this.eventPageCount = 0;
        this.currentEventPage = 1;
        this.events = []; // the current page
        this.eventPageSize = 50; // constant
        this.eventCount = 0;

        // Have we retrieved the user's information (except a list of their events)?
        this.processed = false;
        this.processing = false;
        this.hasResults = false;

        this.setCurrentEventsPage = function(i) {
            this.currentEventPage = i;
            this.getGHEvents();
        };

        this.nextEventsPage = function() {
            if (this.currentEventPage !== this.eventPageCount) {
                this.setCurrentEventsPage(this.currentEventPage+1);
            }
        };

        this.previousEventsPage = function() {
            if (this.currentEventPage !== 1) {
                this.setCurrentEventsPage(this.currentEventPage-1);
            }
        };

        this.getGHEvents = function() {
            // Cache :)
            if (this.eventPages[this.currentEventPage]) {
                this.events = this.eventPages[this.currentEventPage];
                return;
            }

            var userCtrl = this;
            $http.get('/user/'+this.processedUsername+'/events/'+this.currentEventPage, {})
                .success(function(data) {
                    userCtrl.eventPages[userCtrl.currentEventPage] = data.events;
                    userCtrl.events = data.events;
                })
                .error(function(data) {
                    $log.error(data);
                });
        };

        this.setUser = function() {
            var userCtrl = this;
            this.processed = false;
            this.processing = true;
            $http.get('/user/'+this.username, {})
                .success(function(data) {
                    userCtrl.processing = false;
                    userCtrl.eventCount = data.eventCount;
                    userCtrl.hasResults = data.eventCount ? true : false;
                    userCtrl.eventPageCount = Math.ceil(
                        data.eventCount / userCtrl.eventPageSize);
                    userCtrl.multipleEventPages = (
                        userCtrl.eventCount > userCtrl.eventPageSize);
                    userCtrl.repos = data.repos;
                    userCtrl.userUrl = "https://github.com/"+data.username;
                    userCtrl.processedUsername = data.username;
                    userCtrl.processed = true;
                    userCtrl.processing = false;
                })
                .error(function(data) {
                    $log.error(data);
                    userCtrl.processing = false;
                });

        };
    }]);

    app.controller("EventController", ["$http","$log", function($http,$log) {


    }]);

})();