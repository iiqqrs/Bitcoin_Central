/* 
 * Coded by Jesse Rinaldi on 2/10/2017
 */
$(document).ready(function() {
    var priceCurrent = null;
    var unconfirmedTX = null;
    var ourBalance = null;
    var balanceUSD = null;
    var percent_change_1h = null;
    var percent_change_24h = null;
    var percent_change_7d = null;
    var btcADDR = "1BdRcY3uDEf9k5Qhm4zg1ZyG7Rx7fwqimz"; //Put your BTC address here... this one is random.
    
    //Historical vars.
    var getYear = null;
    var todayDate = new Date();
    var todayYear = todayDate.getFullYear();
    var todayMonth = todayDate.getMonth()+1; //why january is 0 blows my mind (not really, but had to adjust)
    var todayDay = todayDate.getDate();

    function priceTicker() {
        $.ajax({
            dataType: "json",
            url: "https://api.bitfinex.com/v2/candles/trade:5m:tBTCUSD/hist?limit=6",
            success: updatePrice
        });
    }

    function updatePrice(data) {
        priceCurrent = data[0][2];
        $('#price-now').html('$' + priceCurrent + " USD");
        document.title = '(' + Number(priceCurrent).toFixed(2) + ')' + " : BTC Portal";
        //console.log("Price Updated");
    }
    
    //thread txCount request
    function txCountRequest() {
        $.ajax({
            dataType: "json",
            url: "https://blockchain.info/q/unconfirmedcount?cors=true",
            success: mempoolAttack
        });
    }

    function mempoolAttack(data) {
        unconfirmedTX = data;
        $('#tx-count').html(unconfirmedTX);
        //console.log("Unconfirmed_tx Updated");
    }
    
    //Get our stuffs ;)
    function getStash(){
        $.ajax({
            dataType: "json",
            url: "https://blockchain.info/q/addressbalance/" +btcADDR+ "?cors=true",
            success: postStash
        });
    };
    
    function postStash(data){
        ourBalance = data;
        $('#our-stash').html(''+ (ourBalance/100000000).toFixed(3) + ' BTC');
        balanceUSD = ((ourBalance/100000000)*priceCurrent).toFixed(2);
        //console.log(priceCurrent);
        $('#our-address').html(btcADDR);
        $('#our-address').click(function () {
            window.location = 'https://blockchain.info/address/' + btcADDR;
        });
        $('#our-value').html('Our Stash: $' + balanceUSD + " USD");
        //console.log("stash updated");
    };
    
    function getPctChange(){
        $.ajax({
            dataType: "json",
            url: "https://api.coinmarketcap.com/v1/ticker/bitcoin/?cors=true",
            success: pctChange
        });
    };
    
    function pctChange(data){
        percent_change_1h = data[0].percent_change_1h;
        percent_change_24h = data[0].percent_change_24h;
        percent_change_7d = data[0].percent_change_7d;
        
        $('#1-hr').html("One Hour: "+percent_change_1h + "%");
        $('#24-hr').html("24 Hours: "+percent_change_24h + "%");
        $('#1-week').html("7 Days: "+percent_change_24h + "%");
        
    };
    function calculateAge(){
        if(todayMonth<10){
                todayMonth = "0"+todayMonth;
        }
        if(todayDay<10){
                todayMonth = "0" + todayDay;
        }
        getYear = todayYear;

        for(i=2011; getYear > i; getYear--){ //earliest api allows for
            $.ajax({
            dataType: "json",
            url: "http://api.coindesk.com/v1/bpi/historical/close.json?start="+getYear+"-"+todayMonth+"-"+todayDay+"&end="+getYear+"-"+todayMonth+"-"+todayDay, //2013-09-01&end=2013-09-05",
            success: updatePriceArr
        });
        }

    };
    //Need to make sure this completes before next loop stars because
    //It can sometimes print the dates out of order depending on which loads first......
    function updatePriceArr(data){
         //console.log(data.bpi["2017-02-13"]);
         var date = Object.keys(data.bpi); 
         date = date[0].substring(0,4);
         if(date != todayYear){
             $('#tih').append('<h2 class="subpanel">' +date+': $'+data.bpi[Object.keys(data.bpi)].toFixed(2)+'</h2>');
        }
         
    };
    
    
    priceTicker();
    txCountRequest();
    getStash();
    getPctChange();
    
    setInterval(getStash, 6 * 1000);
    setInterval(priceTicker, 6 * 1000);
    setInterval(txCountRequest, 6 * 1000);
    
    calculateAge();

});