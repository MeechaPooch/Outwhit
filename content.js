console.log('III JUUSTT LOADDEDD UPPPP!!!!!', document.location.pathname)

VERIFY_CLICK_TIMEOUT = 250;

function waitForElm(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
  
      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // try{
    if (message.request && message.request === "QR_REQUEST") {
        let qr = document.querySelector(".qr");
        qr = qr ? qr : document.querySelector("[data-testid='qr-code']");
        if (qr && qr.currentSrc) {
            sendResponse({QRLink: qr.currentSrc});
        }
    } else if (message.request && message.code && message.request === "AUTOFILL"){
        if(location.pathname=='/frame/web/v1/auth') {return}
        let enterButton = document.querySelector("#passcode");
        let verifyButton = document.querySelector(".verify-button");
        let otherOptionsButton = Array.from(document.querySelectorAll(".button--link, .action-link")).find(elem => 
            elem.textContent === "Other options"
        );
        if (enterButton) {
            console.log('🟩🟩🟩🟩🟩🟩🟩')
            enterButton.click();
            let codeInput = document.querySelector(".passcode-input");
            if (!codeInput) {
                sendResponse({error: 3});
                return;
            }
            codeInput.value = message.code.toString();
            enterButton = document.querySelector("#passcode");
            if (!enterButton) {
                sendResponse({error: 4});
                return;
            }
            enterButton.click();
            sendResponse("enterbutton success!");
        } else if (verifyButton) {
            console.log('🟥🟥🟥🟥🟥🟥🟥🟥🟥')
            waitForElm(".passcode-input").then(codeInput => {
                codeInput.value = message.code.toString();
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => {
                    verifyButton.click();
                    sendResponse("verifybutton success!");
                }, VERIFY_CLICK_TIMEOUT);
            });
        } else if (otherOptionsButton) {
            console.log('🟦🟦🟦🟦🟦🟦🟦🟦')
            otherOptionsButton.click(); 
            waitForElm("[data-testid='test-id-mobile-otp']").then(authButtonDiv => {
                let authButton = authButtonDiv.children[0];
                if (!authButton) {
                    sendResponse({error: 6});
                    return;
                }
                authButton.click();
                waitForElm(".passcode-input").then(codeInput => {
                    let verifyButton = document.querySelector(".verify-button");
                    if (!verifyButton) {
                        sendResponse({error: 7});
                        return;
                    }
                    codeInput.value = message.code.toString();
                    codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => {
                        verifyButton.click();
                        sendResponse("otheroptions success!");
                    }, VERIFY_CLICK_TIMEOUT);
                });
            })
        } else {
            sendResponse({error: 2});
            return;
        } 
    } else if(message.request && message.request == 'ENROLL'){
        // alert('enrolling')
        sendResponse('gotcha!');
        (async()=>{

            switch (document.location.pathname){
                    
                case '/frame/prompt': document.getElementById('new-device').click()
                case '/frame/enroll/pre_flow_prompt':
                    function waitForElm(selector) {
                        return new Promise(resolve => {
                            if (document.querySelector(selector)) {
                                return resolve(document.querySelector(selector));
                            }
                    
                            const observer = new MutationObserver(mutations => {
                                if (document.querySelector(selector)) {
                                    observer.disconnect();
                                    resolve(document.querySelector(selector));
                                }
                            });
                    
                            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                        });
                    }
                    await waitForElm("input[value=tablet]")
                    document.querySelector("input[value=tablet]").click()
                    document.getElementById('continue').click()
                case '/frame/enroll/flow':
                    document.querySelector("input[value=tablet]").click()
                    document.getElementById('continue').click()
                case '/frame/enroll/enrollplatform':
                    document.querySelector("input[value=Android]").click()
                    document.getElementById('continue').click()
                case '/frame/enroll/install_mobile_app':
                    document.getElementById('duo-installed').click()
                case '/frame/enroll/mobile_activate':
                    await sleep(100)
                    chrome.runtime.sendMessage({msg:'scan'})
                    await sleep(1000)
                    //qr request and then click continue
                    document.getElementById('continue').click()
        
    }

    })()

    } else {
        sendResponse({error: 1});
    }
// }catch(e){
//     sendResponse({yes:'yues!',error:e});
// }
})

function sleep(millis){return new Promise(res=>setTimeout(res,millis))}


chrome.runtime.sendMessage({msg:'go', pathname:location.pathname})
if(location.pathname=='/frame/enroll/finish'){chrome.runtime.sendMessage({msg:'finish'}); setTimeout(()=>document.getElementById('continue-to-login').click(),100)}