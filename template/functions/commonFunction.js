exports.makeShuffuleNumberArray = async (number) => {
    let shuffleNumbers=[];
    LOOP:for(let i=0;i<number;i++){
        while(true){
            const num = Math.floor(Math.random()*number);
            let status = true;
            for(const shuffleNumber of shuffleNumbers){
                if(shuffleNumber == num){
                    status = false;
                }
            }
            if(status){
                shuffleNumbers.push(num);
                continue LOOP;
            }
        }
    } 

    return shuffleNumbers;
}

exports.calculateMaxNumberLessThanHalf = async (number) =>{
    let res = 0;
    if(number%2 == 0){
        res = number / 2 - 1;
    }else{
        res = number / 2 ;
    }
    return res;
}

exports.getCurrentTime = async () => {
    require('date-utils');

    const currentTime = new Date();
    let year = currentTime.getUTCFullYear();
    let month = currentTime.getUTCMonth();
    if(month<10){
        month = "0"+month;
    }
    let day = currentTime.getUTCDay();
    if(day<10){
        day = "0"+day;
    }
    let hours = currentTime.getUTCHours();
    if(hours<10){
        hours = "0"+hours;
    }
    let minutes = currentTime.getUTCMinutes();
    if(minutes<10){
        minutes = "0"+minutes;
    }
    let second = currentTime.getUTCSeconds();
    if(second<10){
        second = "0"+second;
    }


    return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+second;
}