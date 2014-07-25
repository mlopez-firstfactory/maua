NavController = function($rootScope,$scope, $location, Auth, Utilities, GrockitNewFeatures, ListenloopUtility, Tracks,$cookies,Groups,Alerts) {
    $scope.url= Utilities.originalGrockit().url;
    $scope.logOutUrl= Utilities.originalGrockit().url+'/logout';


    var Application = {
        loadGroupMembership: function(){
            $scope.groups={
                linkedGroups:[],
                unLinkedGroups:[]
            };

            if( $scope.currentUser.groupMemberships.length>0) {

                Groups.getGroups().membershipGroups().then(function (result) {
                    var responseGroups = result.data.groups;

                    if (!!responseGroups) {

                        var studyingFor = Utilities.findInArray($scope.selectedGroup, responseGroups, 'id');

                        /*save the Group Name to rootScope*/
                        $rootScope.groupTitle = studyingFor.name;

                        var linkedGroups = $scope.currentUser.groupMemberships;

                        angular.forEach(linkedGroups, function (val, index) {

                            if (!!linkedGroups[index]) {
                                var linkGroup = Utilities.findInArray(val.group_id, responseGroups, 'id');

                                if (angular.isDefined(linkGroup)) {
                                    $scope.groups.linkedGroups.push(linkGroup);
                                    var indexToRemove = Utilities.getIndexArray(responseGroups, 'id', val.group_id);
                                    responseGroups.splice(indexToRemove, 1);
                                }
                            }
                        });
                        $scope.groups.unLinkedGroups = responseGroups;
                    }

                }).catch(function error(error) {

                    Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
                });
            }
            else{
                Alerts.showAlert('We are getting problems to find your subjects, if the problem persist please let\'s us know.','warning');

            }
        },
        fetchLeftNavTracksData: function(){
            Tracks.getTracks().allByGroup($scope.selectedGroup).then(function(result){
                var response = result.data;
                $scope.tracksList = response.tracks;

            }).catch(function error(error) {
                Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
            });
        },
        init: function(){
            Auth.getUpdateUserData().then(function(response) {
                if(response!=null){
                    $scope.currentUser = response;
                    $scope.selectedGroup =  Utilities.getActiveGroup();
                    Application.fetchLeftNavTracksData();
                    Application.loadGroupMembership();
                    ListenloopUtility.base(response);
                }
            }).catch(function error(error) {
                Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
            });
        }
    };

    $scope.showDialog = function(){
        GrockitNewFeatures.showDialog();
    };

    $scope.selectGroup = function(index){

        /*update group Name*/
        $rootScope.groupTitle= $scope.groups.linkedGroups[index].name;

        $scope.currentUser.currentGroup=$scope.groups.linkedGroups[index].id;

        Auth.updateUserInfo($scope.currentUser);
        Application.fetchLeftNavTracksData();
    };

    $scope.logOut= function(){
        Auth.logout();
    };

    $scope.select= function(index) {

        if(angular.isDefined(index)) {

            if(index>=0) {

                Utilities.clearActiveTab();
                $scope.selected = index;

                var tracks = [];
                    tracks.push($scope.tracksList[index].id);

                var trackData = {
                    'id': $scope.tracksList[index].id,
                    tracks: tracks,
                    trackTitle: $scope.tracksList[index].name
                };
                Utilities.setActiveTrack(trackData);



            }

        }

    };

    if(angular.isDefined($cookies.authorization_token)){
        if($cookies.authorization_token!=null || $cookies.authorization_token!=''){
            Application.init();
        }
    }

};