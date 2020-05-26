exports.makeShuffuleNumberArray = async (number) => {
    let shuffleNumbers = [];
    LOOP: for (let i = 0; i < number; i++) {
        while (true) {
            const num = Math.floor(Math.random() * number);
            let status = true;
            for (const shuffleNumber of shuffleNumbers) {
                if (shuffleNumber == num) {
                    status = false;
                }
            }
            if (status) {
                shuffleNumbers.push(num);
                continue LOOP;
            }
        }
    }

    return shuffleNumbers;
}

exports.calculateMaxNumberLessThanHalf = async (number) => {
    let res = 0;
    if (number % 2 == 0) {
        res = number / 2 - 1;
    } else {
        res = number / 2;
    }
    return res;
}

exports.getCurrentTime = async () => {
    require('date-utils');

    const currentTime = new Date();
    let year = currentTime.getFullYear();
    let month = currentTime.getMonth() + 1; // 1月は0らしい
    if (month < 10) {
        month = "0" + month;
    }
    let day = currentTime.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    let hours = currentTime.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    let minutes = currentTime.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    let second = currentTime.getSeconds();
    if (second < 10) {
        second = "0" + second;
    }


    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + second;
}

/**
 * 与えられたuserNumberの数の中からchooseNumberの数だけランダムに選んでその配列を返す
 *
 * @param {*} userNumber
 * @param {*} chooseNumber
 * @returns
 */
exports.chooseRandomIndexes = async (userNumber, chooseNumber) => {
    try {
        let randomIndexes = [];
        LOOP: for (let i = 0; i < chooseNumber; i++) {
            while (true) {
                const num = Math.floor(Math.random() * userNumber);
                let status = true;
                for (const randomIndex of randomIndexes) {
                    if (randomIndex == num) {
                        status = false;
                    }
                }
                if (status) {
                    randomIndexes.push(num);
                    continue LOOP;
                }
            }
        }
        return randomIndexes;
    } catch (err) {
        console.log(err);
    }
}

/**
 * 与えられたインデックスの中からchooseNumberの数だけランダムに抽出して配列で返す
 * indexes.length >= chooseNumber
 *
 * @param {*} indexes
 * @param {*} chooseNumber
 */
exports.getRandomIndexes = async (indexes,chooseNumber) => {
    try{
        let randomIndexes = [];
        LOOP: for (let i = 0; i < chooseNumber; i++) {
            while (true) {
                const num = Math.floor(Math.random() * indexes.length);
                const index = indexes[num];
                let status = true;
                for (const randomIndex of randomIndexes) {
                    if (randomIndex == index) {
                        status = false;
                    }
                }
                if (status) {
                    randomIndexes.push(index);
                    continue LOOP;
                }
            }
        }
        return randomIndexes;
    }catch(err){
        console.log(err);
    }
}

exports.getRandomNumber = async (minNumber,maxNumber) =>{
    const number = Math.floor(Math.random() * (maxNumber-minNumber+1)) + minNumber;
    return number;
}