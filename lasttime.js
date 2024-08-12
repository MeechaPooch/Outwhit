
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

chrome.runtime.sendMessage({msg:'settingUp?'}).then(async isEnrolling=>{
    await waitForElm('#duo_form')
    if(isEnrolling) {
        htmlText = `<div style="display:flex;align-items:center;min-width:100%;flex-direction: column;padding-top: 20px;"><ree style="
        display: flex;
        align-self: center;
        font-size: 30px;
        font-weight: bold;
        color: white;
        background-color: #63b246;
        padding: 7px;
        border-radius: 10px;
        width: 600px;
        /* align-items: center; */
        /* text-align: center; */
        justify-content: center;
        ">Verify one last time to setup Outwhit</ree></div>`


        let banner = document.querySelector('header[role="banner"]')

        banner.insertAdjacentHTML("afterend",htmlText)
    }
})
