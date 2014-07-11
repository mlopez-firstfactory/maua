practiceGame.controller('PracticeController',['$scope','Questions','Utilities','PracticeGames','RoundSessions','breadcrumbs','VideoService','Alerts',function($scope,Questions,Utilities,PracticeGames,RoundSessions,breadcrumbs,VideoService,Alerts) {

    $scope.loading=true;
    $scope.activeTracks =Utilities.getActiveTrack();
    $scope.titleQuest=$scope.activeTracks.trackTitle;
    $scope.activeGroupId= Utilities.getActiveGroup();
    $scope.breadcrumbs = breadcrumbs;
    breadcrumbs.options = { 'practice': $scope.titleQuest };

    $scope.optionList = "abcdefghijklmnopqrstuvwxyz";
    $scope.nextActionTitle='Confirm Choice';
    $scope.questionItems=[];
    $scope.items=[];

    $scope.showExplanation = false;
    $scope.showVideo = false;
    $scope.setPosition=0;
    $scope.position=0;
    $scope.lastAnswerLoaded='';
    $scope.directives =
        [   { id:'1', type: 'MultipleChoiceOneCorrect'},
            { id:'2', type: 'MultipleChoiceOneOrMoreCorrect'},
            { id:'3', type: 'MultipleChoiceMatrixTwoByThree'},
            { id:'4', type: 'MultipleChoiceMatrixThreeByThree'},
            { id:'5', type: 'NumericEntryFraction'},
            { id:'6', type: 'NumericEntry'},
            { id:'7', type: 'sat'},
            {id:'8', type: 'MultipleChoiceTwoCorrect'}
        ];

    var Practice = {
        setLayoutBasedOnQuestionInfo: function (setLayout) {
            var panel1 = angular.element('#Panel1'),
                panel2 = angular.element('#Panel2');

            if (setLayout) {
                panel1.removeClass('col-md-offset-3');
                panel2.removeClass('col-md-offset-3');
            }
            else {
                panel1.addClass('col-md-offset-3');
                panel2.addClass('col-md-offset-3');
            }
        },
        loadQuestion: function () {
            if ($scope.QuestionSetList.length > 0) {
                $scope.titleQuest = $scope.activeTracks.trackTitle;
                var setLayoutType = false,
                    setPosition = $scope.setPosition,

                /* Iterate between all the question sets retrieved it by the API */
                    questionSetResult = $scope.QuestionSetList[setPosition],

                    position = $scope.position,
                    questionsCount = questionSetResult.questions.length;


                if (position < questionsCount) {

                    /* Iterate between all the question retrieved it by the API which belong to a specific Question set */
                    var questionResult = questionSetResult.questions[position];

                    /*Create Round Session by Question*/
                    RoundSessions.one().post('', {game_id: $scope.practiceGameResponse.id, question_id: questionResult.id}).then(function (result) {
                        $scope.answerObject = result.data;
                        $scope.roundSessionAnswer = $scope.answerObject.round_session;

                        angular.element('.choice.active').removeClass('active');

                        if ($scope.lastAnswerLoaded == '' || $scope.lastAnswerLoaded != questionResult.kind) {
                            $scope.currentA = Utilities.findInArray(questionResult.kind, $scope.directives, 'type').id;
                            $scope.lastAnswerLoaded = questionResult.kind;
                        }

                        $scope.items = [];
                        $scope.stimulus = "";
                        $scope.template = $scope.actualView;
                        $scope.questionItems = questionResult;

                        $scope.questionInformation = questionSetResult.info;

                        /*Find if there is a question info defined or retrieve it by the API*/
                        setLayoutType = angular.isDefined($scope.questionInformation) && $scope.questionInformation != null && $scope.questionInformation != '' ? true : false;

                       /*Set the layout based on the question info*/
                        Practice.setLayoutBasedOnQuestionInfo(setLayoutType);
                        $scope.stimulus = $scope.questionItems.stimulus;

                        var options = $scope.optionList.toUpperCase().split(""),
                            answers = $scope.questionItems.answers;
                        angular.forEach(answers, function (value, index) {

                            value["option"] = options[index];
                            $scope.items.push(value);
                        });

                        $scope.position++;

                    }).catch(function error(error) {

                        Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
                    });


                }
                else {
                    $scope.position = 0;
                    $scope.setPosition++;
                    this.loadQuestion();
                }
            }
            else {

                var dialogOptions = {
                    message: "Sorry, we can't show you questions for this topic yet. We're still working on them and should have them ready soon. " +
                        "Please select a different topic for now or also you can answer" + '' +
                        " questions in the old Grockit.. Thanks.",
                    buttons: {
                        success: {
                            label: "Stay on New Grockit!",
                            className: "btn-success",
                            callback: function () {
                                Utilities.redirect('#/' + $scope.activeGroupId + '/dashboard');
                            }
                        },
                        main: {
                            label: "Continue to Original Grockit!",
                            className: "btn-primary",
                            callback: function () {
                                var url = Utilities.originalGrockit().url + '/' + $scope.activeGroupId;
                                Utilities.redirect(url);
                            }
                        }
                    }
                };

                Utilities.dialogService(dialogOptions);
            }
        },
        resetLayout: function () {
            $scope.titleQuest = $scope.titleQuest + ' Explanation';
            this.setLayoutBasedOnQuestionInfo(true);
            angular.element('#skipAction').addClass('hide');
            angular.element('#nextAction').removeClass('btn-primary').addClass('btn-success');
            angular.element('.list-group *').addClass('no-hover');
            $scope.nextActionTitle = 'Next Question';


        },
        nextQuestion: function () {
            this.loadQuestion();

            //Enable/disable answer section
            angular.element('.choice *').removeClass('btn-primary btn-danger btn-success').removeAttr('disabled');
            $scope.showVideo = false;
            $scope.showExplanation = false;
            $scope.nextActionTitle = 'Confirm Choice';
            $scope.messageConfirmation='';
            angular.element('#nextAction').removeClass('btn-success');
            angular.element('#skipAction').removeClass('hide');
            angular.element('#answersPanels').removeClass().addClass('fadeIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                angular.element(this).removeClass();
            });

        },
        seeAnswer: function () {
            this.resetLayout();

            /*Question Explanation*/
            $scope.questionExplanation = $scope.questionItems.explanation;

            if ($scope.questionExplanation != null)
                $scope.showExplanation = true;


            /*video validation*/
            if ($scope.questionItems.youtube_video_id !== null) {
                $scope.showVideo = true;
                $scope.videoId = $scope.questionItems.youtube_video_id;
                VideoService.setYouTubeTitle($scope.videoId).then(function(videoTime){
                    $scope.videoText='Video Explanation ('+videoTime+')';
                });
            }

            /*Get answers from the previous request and Explain*/
            var answers = $scope.questionItems.answers;
            $scope.tags = $scope.questionItems.tags;
            $scope.xpTag = $scope.questionItems.experience_points;


            /*   Work with the styles to shown result
             define is some answer is bad.*/
            angular.element('.choice button').removeClass('btn-primary');

            angular.forEach(answers, function (value, key) {
                var selectIdButton = '#' + value.id;
                if (value.correct) {
                    angular.element(selectIdButton).addClass('btn-success');
                }
            });

            angular.element(".choice *").prop('disabled', true);

        },
        confirmChoice: function () {
            this.resetLayout();

            var selectedPosition = '', selectedOptions = [], selectedOptionsCount, i=0;

            /*Get selected answers*/
            angular.element('.choice input[value=true]').each(function () {
                selectedPosition = $(this).attr('id');
                selectedOptions.push(selectedPosition);
            });

                selectedOptionsCount= selectedOptions.length;
            if (selectedOptionsCount > 0) {


                /* Question Explanation*/
                $scope.questionExplanation = $scope.questionItems.explanation;

                if ($scope.questionExplanation != null)
                    $scope.showExplanation = true;


                /* video validation*/
                if ($scope.questionItems.youtube_video_id !== null) {
                    $scope.showVideo = true;
                    $scope.videoId = $scope.questionItems.youtube_video_id;
                    VideoService.setYouTubeTitle($scope.videoId).then(function(videoTime){
                        $scope.videoText='Video Explanation ('+videoTime+')';
                    });
                   // $scope.videoId = $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$scope.questionItems.youtube_video_id);
                }

                /*Get answers from the previous request and Explain*/
                var answers = $scope.questionItems.answers;
                $scope.tags = $scope.questionItems.tags;
                $scope.xpTag = $scope.questionItems.experience_points;

                /* Work with the styles to shown result
                 define is some answer is bad.*/
                 $scope.answerStatus=true;
                angular.element('.choice button').removeClass('btn-primary');
                angular.forEach(answers, function (value) {

                    var selectIdButton = ('#' + value.id);

                    /*set the correct class on the button*/
                    if (value.correct) {
                        if(Utilities.existsInArray(value.id,selectedOptions)) {
                            /*Send answer response to server, important this line have to be inside this if
                             * since just the users answers get into this evaluation
                             * */
                            $scope.answerObject.one($scope.roundSessionAnswer.id).put({answer_id: value.id });
                        }
                        else{
                            $scope.answerStatus = false;
                        }
                        angular.element(selectIdButton).addClass('btn-success');

                    }
                    else{
                        if(Utilities.existsInArray(value.id,selectedOptions)) {
                            /*Send answer response to server, important this line have to be inside this if
                             * since just the users answers get into this evaluation
                             * */
                            $scope.answerObject.one($scope.roundSessionAnswer.id).put({answer_id: value.id });
                            angular.element(selectIdButton).addClass('btn-danger');
                            $scope.answerStatus = false;
                        }

                    }

                });


                $scope.messageConfirmation=  $scope.answerStatus ? 'Your answer was correct': 'Your answer was incorrect';
                angular.element(".choice *").prop('disabled', true);
            }
            else {
                Alerts.showAlert('Please select an option!','warning');

            }
        }
    };

    $scope.CreatePracticeGame= function(){
        if($scope.activeTracks.tracks.length > 0){
            var practiceGame =  PracticeGames.one();
            practiceGame.post('',{group_id:$scope.activeGroupId}).then(function(result) {
                var PracticeObject = result.data;
                $scope.practiceGameResponse = PracticeObject.practice_game;

                PracticeObject.one($scope.practiceGameResponse.id,'sample').customGET('',{'tracks[]':$scope.activeTracks.tracks}).then(function(result){
                    var QuestionSetObject= result.data;
                    $scope.QuestionSetList= QuestionSetObject.question_sets;
                    Practice.loadQuestion();
                    $scope.loading=false;

                }).catch(function error(error) {

                    Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
                });


            }).catch(function error(error) {

                Alerts.showAlert(Alerts.setErrorApiMsg(error), 'danger');
            });
        }
        else{
            bootbox.alert('You must select one track at least',function(){
                $scope.loading=false;
                Utilities.redirect('#/' +  $scope.activeGroupId+ '/dashboard');
            });
        }

    };

    $scope.answerHasExplanation = function(index){
        var answer = $scope.questionItems.answers[index];
        return !(answer.explanation == null || angular.isUndefined(answer.explanation));

    };

    //confirm choice
    $scope.nextAction = function() {

        if($scope.nextActionTitle=='Confirm Choice'){
            Practice.confirmChoice();
        }
        else{
            Practice.nextQuestion();
        }

    };

    $scope.revealExplanation = function(){
        $scope.numerator=5;
        Practice.seeAnswer();
    };

    $scope.entryChange = function(){

    }


}]);
