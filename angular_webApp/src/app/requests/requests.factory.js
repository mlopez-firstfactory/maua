/**
 * Created by Jose on 5/29/2014.
 */
request.factory('Users', function(Restangular) {
    return{
        UserInfo: Restangular.service('users')
    }

});


request.factory('Questions', function(Restangular) {

    return Restangular.service('questions')

});



//
//"request": {
//    "Users":"users/",
//        "MultipleChoiceOneorMoreCorrect":"questions/69f3f390-a4ed-012e-035d-1231390ef981.json",
//        "MultipleChoiceTwoCorrect":"questions/37ef3dd0-9f89-012e-5ad5-1231390ef981.json",
//        "MultipleChoiceMatrixTwoByThree":"questions/27e8ef70-a4eb-012e-0320-1231390ef981.json",
//        "MultipleChoiceMatrixThreeByThree":"questions/2dfe7d20-a4eb-012e-0320-1231390ef981.json",
//        "NumericEntry":"questions/2a79f190-9f89-012e-5ad5-1231390ef981.json",
//        "NumericEntryFraction":"questions/c16b675b-4db3-c272-ded1-455be01d586e.json",
//        "SPR":"questions/bde6fff0-30c7-012e-f7bc-1231390ef981.json",
//        "MultipleChoiceOneCorrect":"questions/75f93df0-a4ed-012e-035d-1231390ef981.json"
//}