function sleep(m){return new Promise(r=>setTimeout(r,m))}

try{
    document.getElementById('new-device').click()
}catch(e){}

// wait until authenticated


// credit https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
async function waitForElm(selector) {
    while(true) {
        await sleep(100);
        let elem = document.querySelector(selector)
        if(elem) {return elem}
    }
}
try{
await waitForElm("input[value=tablet]")
}catch(e){}
try{
document.querySelector("input[value=tablet]").click()
document.getElementById('continue').click()
sleep(100)
}catch(e){}
//sleep
try{
document.querySelector("input[value=Android]").click()
document.getElementById('continue').click()
sleep(100)
}catch(e){}
//sleep
try{
document.getElementById('duo-installed').click()
sleep(100)
}catch(e){}
//sleep
//ready
try{
document.getElementById('continue').click()
}catch(e){}