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