angular.module('grockitApp.services', ['webStorageModule'])
    .factory('Utilities', function($http,webStorage,$rootScope,$location,$routeParams,$route,VideoService,$q) {


        var internalUtilities ={
            grockitHostEvaluation : function (isNewGrockit) {
                if (isNewGrockit) {
                    return location.host == '127.0.0.1:9000' ? 'https://grockit.com' : location.origin + '/2.0';
                }
                else {
                    return location.host == '127.0.0.1:9000' ? 'https://staging.grockit.com' : location.host == 'ww2.grockit.com' ? 'https://grockit.com' : location.origin
                }
                /*local enviroment*/
                /* if(isNewGrockit){

                 return location.host== '127.0.0.1:9000'  ? 'http://127.0.0.1:9000/' : location.origin+'/2.0';
                 }
                 else{
                 return location.host== '127.0.0.1:9000' ? 'https://staging.grockit.com' : location.host=='ww2.grockit.com' ? 'https://grockit.com' :location.origin
                 }*/

            },
            getYoutubeVideosId: function(url) {
                var deferred = $q.defer();

                var id = '';
                url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                if (url[2] !== undefined) {
                    id = url[2].split(/[^0-9a-z_]/i);
                    id = id[0];
                }
                else {
                    id = url;
                }

                deferred.resolve(id);
                return deferred.promise;
            },
            getResourceObject: function(resourceObject) {
                var nDeferred = $q.defer();
                var videoObject = {},videoId='';
                if (resourceObject.resource_type=="youtube") {
                        var video = internalUtilities.getYoutubeVideosId(resourceObject.resource);
                        video.then(function(idVid){
                            videoId=idVid;
                           return  VideoService.setYouTubeTitle(idVid);

                        }).then(function (videoTime) {
                            videoObject = {
                                videoTime: videoTime,
                                videoId: videoId,
                                resourceType: resourceObject.resource_type
                            };
                            nDeferred.resolve(videoObject);
                        });
                }
                else {
                    videoObject = {
                        videoTime: null,
                        videoId: decodeURIComponent(resourceObject.resource).replace(/"/g, ""),
                        resourceType: resourceObject.resource_type
                    };
                    nDeferred.resolve(videoObject);
                }



                return nDeferred.promise;



            }

        };


        return {
            newGrockit: function(){
                return {
                    url : internalUtilities.grockitHostEvaluation(true)
                };
            },
            originalGrockit: function(){
                return {
                    url : internalUtilities.grockitHostEvaluation(false)
                };
            },
            getActiveGroup: function() {
                $rootScope.activeGroupId = webStorage.get('currentUser').currentGroup;
                return  $rootScope.activeGroupId;
            },
            setActiveGroup: function(activeGroupId){
                $rootScope.activeGroupId = activeGroupId;
            },
            getActiveTrack: function () {
                return webStorage.get('currentUser').trackData;
            },
            setActiveTrack: function (data) {
                var currentUser = webStorage.get('currentUser');
                currentUser.trackData=data;
                webStorage.add('currentUser', currentUser);
            },
            findInArray: function (element, array, filter) {
                return  $.grep(array, function (val) {
                    return val[filter] == element;
                })[0];
            },
            getIndexArray : function (arr, key, val){
               for(var i = 0; i < arr.length; i++){
                   if(arr[i][key] == val)
                       return i;
               }
               return -1;
           },
            existsInArray: function (element, array) {
                return  ($.inArray(element, array)!==-1);
            },
            encodeRedirect: function (redirectUrl, url) {
                window.location.href = redirectUrl + encodeURIComponent(url);
            },
            redirect: function (url) {
                var basePath = $location.host=='127.0.0.1' || 'grockit.firstfactoryinc.com' ? '' : 'v2';
                window.location.href = basePath+url;
            },
            setActiveTab: function (position) {
                this.clearActiveTab();
                var menuList = angular.element('div#main-menu-inner ul.navigation li');
                angular.element(menuList[position]).addClass('active');

            },
            clearActiveTab: function () {
                angular.element('div#main-menu-inner ul.navigation li').removeClass('active');
            },
            dialogService: function(options){
                bootbox.dialog(options);
            },
            getCurrentParam: function(key){
                return $route.current.pathParams[key];
            },
            setCurrentParam: function(key,param){
                $route.current.pathParams[key]=null;
                $route.current.pathParams[key]= param;
            },
            getYoutubeVideosInfo: function(resources) {
                var videoDataList = [];

                angular.forEach(resources, function (value) {

                    internalUtilities.getResourceObject(value).then(function(rObject) {
                        videoDataList.push(rObject);
                    });

                });

                return videoDataList;

            }




        }
    })

    .factory('Alerts', function() {
        return {
            showAlert: function (alertMsg, type) {

                var options = {
                    type: type,
                    namespace: 'pa_page_alerts_dark',
                    classes: 'alert-dark',
                    auto_close: 30 /*seconds*/
                };
                setTimeout(function () {
                    PixelAdmin.plugins.alerts.add(alertMsg, options);
                },250);
            },
            setErrorApiMsg: function (error) {
                return 'Uh oh! We\'re having difficulty retrieving your data.';
            }
        }

    })

    .factory('GrockitNewFeatures', function($http, Utilities) {

        return {
            showDialog: function () {
                var dialogOptions = {
                    title: "Welcome to Grockit 2.0 Beta",
                    message: ""
                    },
                url= location.host== '127.0.0.1:9000'  ? 'http://127.0.0.1:9000/' : location.origin+'/2.0';
                $http.get(url+'/common/templates/newFeatures2.0.html').success(function(data) {
                    dialogOptions.message=data;
                    Utilities.dialogService(dialogOptions);

                }).error(function (jqXHR, textStatus, errorThrown) {

               });
            }

        }

    });




