const setupButton = document.querySelector(".setup-instr-button");
const scanButton = document.querySelector(".scan-button");
const loadingDiv = document.querySelector(".loading");
const scanErrorText = document.querySelector(".scan-error");
const entranceBox = document.querySelector(".entrance-box");
const generationScreen = document.querySelector(".generation-screen");
const generatedCode = document.querySelector(".generated-code");
const copyConfirmation = document.querySelector(".copy-confirmation");
const countText = document.querySelector(".count");
const generateButton = document.querySelector(".generate-button");
const completeScreen = document.querySelector(".scan-complete-screen");
const doSetupButton = document.querySelector(".setupButton")
const reSetupButton = document.querySelector(".resetup")

const enrolled = document.getElementById('enrolled')
const notenrolled = document.getElementById('notenrolled')
const donate = document.getElementById('donate')
const about = document.getElementById('about')

function sleep(m){return new Promise(r=>setTimeout(r,m))}

// import { generateHOTP, attemptAutofill, requestScan, doSetup } from './background.js';

export const ScanError = {
    'NO_QR': 1,
    'INV_QR': 2
}

// chrome.runtime.sendMessage(null,'enrolled?',null,(x)=>{alert(x)})
chrome.storage.local.get(["key", "count"],(e)=>setLooks(Object.keys(e).length>0))

function setLooks(isEnrolled) {
    notenrolled.style.display = isEnrolled ? 'none' : 'flex'
    enrolled.style.display = !isEnrolled ? 'none' : 'flex'
}


doSetupButton.onclick= async ()=>{
        chrome.runtime.sendMessage({msg:'setup'})
        await sleep(100)
        chrome.tabs.create({url:'https://login.whitman.edu/login'})
}
reSetupButton.onclick= async ()=>{
    chrome.runtime.sendMessage({msg:'setup'})
    await sleep(100)
    chrome.tabs.create({url:'https://login.whitman.edu/login'})
}
donate.onclick=()=>{
    chrome.tabs.create({url:'https://www.paypal.com/donate/?business=Q89X6M7NUTNA4&no_recurring=0&item_name=for+Whittie+Duo+Duper&currency_code=USD'})
}
about.onclick=()=>{
    chrome.tabs.create({url:'https://meechapooch.github.io/WhittieDuoDuper-Docs/about/'})
}


export const scanError = (error) => {
    loadingDiv.style.display = "none";
    switch (error) {
        case ScanError.NO_QR:
            scanErrorText.textContent = "No Duo QR link detected on the page.";
            break;
        case ScanError.INV_QR:
            scanErrorText.textContent = "QR link on page is invalid or expired.";
            break;
    }
    scanErrorText.removeAttribute("hidden");
}

export const scanSuccess = () => {
    loadingDiv.style.display = "none";
    entranceBox.style.display = "none";
    completeScreen.style.display = "block";
}

// (async () => {
//     if (generatedCode === null)
//         return;

//     await (async() => {
//         const hotpCode = await generateHOTP();

//         if (hotpCode === -1) {
//             loadingDiv.style.display = "none";
//             return;
//         }

//         let [code, count] = hotpCode;

//         generatedCode.textContent = code.toString();
//         countText.textContent = count.toString();

//         loadingDiv.style.display = "none";
//         entranceBox.style.display = "none";
//         generationScreen.style.display = "block";

//         await attemptAutofill(code);
//     })();

//     setupButton.addEventListener("click", () => {
//         chrome.tabs.create({
//             url: "https://github.com/AvikRao/duo-extension/wiki/Setup-and-Usage"
//         });
//     });

//     scanButton.addEventListener("click", async () => {
//         loadingDiv.style.display = "block";
//         await requestScan();
//     });

//     generatedCode.addEventListener("click", () => {
//         navigator.clipboard.writeText(generatedCode.textContent);
//         copyConfirmation.removeAttribute("hidden");
//     });

//     generateButton.addEventListener("click", async () => {

//         generationScreen.style.display = "none";
//         loadingDiv.style.display = "block";

//         const hotpCode = await generateHOTP();

//         if (hotpCode === -1) {
//             loadingDiv.style.display = "none";
//             entranceBox.style.display = "block";
//             return;
//         }

//         let [code, count] = hotpCode;

//         generatedCode.textContent = code.toString();
//         countText.textContent = count.toString();

//         loadingDiv.style.display = "none";
//         entranceBox.style.display = "none";
//         generationScreen.style.display = "block";
//     });

// })();
