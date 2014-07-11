'use strict';
home.controller('SimpleDashController',['$scope','Users','History','Tracks','Utilities','Auth','breadcrumbs','Alerts', function($scope,Users,History,Tracks,Utilities,Auth,breadcrumbs,Alerts) {
    $scope.loading=true;
    $scope.scoreLoading=true;
    Utilities.setActiveTab(0);
    $scope.activeGroupId= Utilities.getActiveGroup();
    $scope.enableScore= !!($scope.activeGroupId == 'gmat' || $scope.activeGroupId == 'act' || $scope.activeGroupId == 'sat');

    var SimpleDashBoard= {
        fetchTracksData: function () {
            $scope.loading=true;
            var tracks = Tracks.one();
                tracks.customGET('', {group_id: $scope.activeGroupId}).then(function (response) {
                    $scope.tracks = response.data.tracks;
                    $scope.loading=false;

                }).catch(function error(error) {

                    Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
                });

        },
        fetchScorePrediction: function () {

            $scope.UserRequest.one($scope.user_id).customGET('score_prediction',{group:$scope.activeGroupId}).then(function(scorePrediction){
                $scope.score = scorePrediction.data;
                if(scorePrediction.data.total_score!=null && scorePrediction.data.range!=null) {

                    $scope.totalScore = scorePrediction.data.total_score;
                    $scope.rangeInit = scorePrediction.data.range[0];
                    $scope.rangeEnd = scorePrediction.data.range[1];

                }

                $scope.scoreLoading=false;

            }).catch(function error(error) {
                Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
            });

        },
        fillGraphic: function (graphicData) {
            if(angular.isDefined(graphicData) && graphicData.history.length>0) {
                $scope.historyVisible = true;
                var response = History.findMissingDates(graphicData.history);
                $scope.chart_options = {
                    data: response.Data,
                    xkey: 'day',
                    ykeys: ['total_questions'],
                    labels: ['Questions Answered'],
                    lineColors: ['#2e9be2'],
                    lineWidth: 2,
                    pointSize: 4,
                    numLines: response.MaxLine,
                    hideHover: true,
                    gridLineColor: '#2e9be2',//'rgba(255,255,255,.5)',
                    resize: true,
                    gridTextColor: '#1d89cf',
                    xLabels: "day",
                    xLabelFormat: function (d) {
                        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getDate();
                    },
                    dateFormat: function (date) {
                        var d = new Date(date);
                        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
                    }
                };

            }
            else {
                $scope.historyVisible = false;
            }
            $scope.loading=false;
        },
        getHistoryInformation: function () {
            $scope.loading=true;
            $scope.UserRequest.one($scope.user_id).customGET('history', {group: $scope.activeGroupId}).then(function (graphicResult) {
                SimpleDashBoard.fillGraphic(graphicResult.data);



            }).catch(function error(error) {

                Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
            });
        }
    };

    $scope.init = function(){
        var userInfo= Auth.getCurrentUserInfo();
        //Declare User RestAngular Object
        $scope.UserRequest = Users.one();
        $scope.user_id= userInfo.userId;

        if($scope.enableScore)
            SimpleDashBoard.fetchScorePrediction();


        SimpleDashBoard.getHistoryInformation();

        SimpleDashBoard.fetchTracksData();


        $scope.breadcrumbs = breadcrumbs;

        $scope.historyVisible=false;


    };

    $scope.StartPractice = function(index){
        if(angular.isDefined(index)) {

            var tracks = [],
                trackTitle = $scope.tracks[index].name;
                tracks.push($scope.tracks[index].id);

            var trackData = {
                tracks: tracks,
                trackTitle: trackTitle
            };
            Utilities.setActiveTab(0);
            Utilities.setActiveTrack(trackData);
            Utilities.redirect('#/' +  $scope.activeGroupId+ '/dashboard/practice');
        }
        else{
            Alerts.showAlert('You must select one track at least', 'warning');
        }


    };

    $scope.init();

}]);
