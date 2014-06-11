home.factory('History', function() {

    function  getIndex(srcArray, field){
        var i, l, index;
        index = {};
        for(i = 0, l = srcArray.length; i < l; i++) {
            index[srcArray[i][field]] = srcArray[i];
        }
        return index;
    }

    function formatDate(date){
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }

    function createDefaultObject(datestr) {
        return {
            "day": datestr,
            "total_questions": 0,
            "total_correct": 0,
            "total_seconds": 0,
            "total_xp_earned": 0,
            "total_experience_points": 0
        };
    }

    return {
        findMissingDates:function(test){
            var dest = [], datestr = '', src = test,
                index = getIndex(src, 'day'),max= 0,i=0,
                //get boundaries
                first = new Date(src[0].day),
                last = new Date(src[src.length-1].day);

            for(var d = first; d.getTime() <= last.getTime(); d.setDate(d.getDate()+1)) {

                datestr = formatDate(d);
                if(index[datestr]) {
                    //this date exists in response , copy it
                    dest.push(index[datestr]);
                } else {
                    //this date does not exist,then create a default
                    dest.push(createDefaultObject(datestr));
                }
                if (dest[i].total_questions>max){
                    max = dest[i].total_questions;
                }
                i++;
            }
            max= max >= 5 ? 5 : max+1;
            return {"Data":dest,"MaxLine":max };
        }
    }

});
