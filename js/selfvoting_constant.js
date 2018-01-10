
var g = 0;
var pi = 0;
var pe = 0;


function getAPR(){
    steem.api.setOptions({ url: 'https://api.steemit.com'});
    console.log("getting dynamicGlobalProperties...");
	steem.api.getDynamicGlobalProperties(function(err, response){
        var total_vesting_fund_steem = parseFloat(response.total_vesting_fund_steem.replace(" STEEM",""));
        var total_vesting_shares = parseFloat(response.total_vesting_shares.replace(" VESTS",""));
        
        console.log("getting rewardFund(post)...");
        steem.api.getRewardFund("post", function(err, response){
            var recent_claims = parseFloat(response.recent_claims)/1000000;
            var reward_balance = parseFloat(response.reward_balance.replace(" STEEM",""));
            
            g = total_vesting_shares*reward_balance/total_vesting_fund_steem/recent_claims;
            var APR100 = 100*(Math.pow(1+g, 73) - 1);
            console.log(APR100);
            $("#APR100").text("APR_100 = "+APR100.toFixed(2)+"%");
            
            console.log("getting internal price...");
            steem.api.getCurrentMedianHistoryPrice(function(err, response){
                pi = parseFloat(response.base.replace(" SBD",""))/parseFloat(response.quote.replace(" STEEM",""));
                
                console.log("getting price of the market...");
                var marketOrders = 10;
                steem.api.getOrderBook(marketOrders, function(err, response){
                    var lowest_ask = parseFloat(response.asks[0].real_price);
                    var highest_bid = parseFloat(response.bids[0].real_price);
                    for(var i=1;i<marketOrders;i++){
                        ask = parseFloat(response.asks[i].real_price);
                        bid = parseFloat(response.bids[i].real_price);
                        if(ask < lowest_ask) lowest_ask = ask;
                        if(bid > highest_bid) highest_bid = bid;
                    }
                    pe = (lowest_ask + highest_bid)/2;
                    var APR5050 = 100*(Math.pow(1+0.5*g*(1+pi/pe) , 73) - 1);
                    console.log(APR5050);
                    $("#APR5050").text("APR_50/50 = "+APR5050.toFixed(2)+"%");
                });
            });
        });
    });    
}

function calculate(){
    var sp = parseFloat($("#steem-power").val());
    console.log($("#steem-power").val());
    console.log("pi="+pi);
    console.log("sp*pi="+(sp*pi));
    console.log("sp="+sp);
    var usd = sp*pi;
    var r100 = [0,0,0,0,0,0,0,0,0,0,0,0];
    var r5050= [0,0,0,0,0,0,0,0,0,0,0,0];
    var r100usd = [0,0,0,0,0,0,0,0,0,0,0,0];
    var r5050usd = [0,0,0,0,0,0,0,0,0,0,0,0];
    
    $("#ini-val").text(usd.toFixed(2)+" USD");
    
    for(var i=0;i<12;i++){
        periods = 73.0/12*(i+1);
        r100[i] = sp*Math.pow(1+g, periods);
        r5050[i] = sp*Math.pow(1+0.5*g*(1+pi/pe) , periods);
        r100usd[i] = pi*r100[i];
        r5050usd[i] = pi*r5050[i];
        
        $("#month"+(i+1)+"apr100").text(r100[i].toFixed(2)+" SP ("+r100usd[i].toFixed(2)+" USD)");
        $("#month"+(i+1)+"apr5050").text(r5050[i].toFixed(2)+" SP ("+r5050usd[i].toFixed(2)+" USD)");
    }
}