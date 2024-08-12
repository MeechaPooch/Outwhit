// import { scanError, scanSuccess, ScanError } from './popup.js';
import { Hotp } from './dependencies/jsOTP.js';
import { logout } from './signoutDuo.js';
import './extpay.js'
function sleep(millis) { return new Promise(res => setTimeout(res, millis)) }
const hotp = new Hotp();



/// paid 

// Example code
// your-extension/background.js
const extpay = ExtPay('outwhit');
extpay.startBackground();

extpay.getUser().then(user => {
    if (user.paid) {
        // ...
    } else {
        extpay.openPaymentPage()
    }
})















function setIsEnrolling(state) {
    return browser().storage.local.set({ isEnrolling: state })
}
async function getIsEnrolling() {
    return (await browser().storage.local.get(['isEnrolling'])).isEnrolling
}

function browser() {
    return {
        storage: {
            local: {
                async get(keys) {
                    return await new Promise((resolve, _) => {
                        chrome.storage.local.get(keys, x => resolve(x));
                    });
                },
                async set(obj) {
                    await new Promise((resolve, _) => {
                        chrome.storage.local.set(obj, resolve);
                    });
                }
            }
        },
        tabs: {
            async query(attrs) {
                return await new Promise((resolve, reject) => {
                    chrome.tabs.query(attrs, tabs => resolve(tabs));
                });
            },
            async sendMessage(id, msg) {
                return await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(id, msg, resp => {
                        if (!chrome.runtime.lastError)
                            resolve(resp);
                        else
                            reject(chrome.runtime.lastError);
                    });
                });
            }
        }
    }
};



async function generateHOTP() {
    let storage = await browser().storage.local.get(["key", "count"]);

    if (Object.keys(storage).length == 0) {
        return -1;
    }

    let { key, count } = storage;

    return [hotp.getOtp(key, count), count];
}
async function incrementCount(label) {
    let storage = await browser().storage.local.get(["key", "count"]);

    if (Object.keys(storage).length == 0) {
        return -1;
    }

    let { key, count } = storage;
    console.log('count inc: ', label, count)

    count++;

    browser().storage.local.set({ count });
}

async function processQR(QRLink) {
    const QRUrl = new URL(QRLink),
        query = new URLSearchParams(QRUrl.search),
        value = query.get("value"),
        data = decodeURIComponent(value),
        split = data.split("-");

    if (!split) {
        return 1;
    }
    console.log(QRLink);
    let code = split[0];
    let hostb64 = split[1];

    code = code.replace("duo://", "");
    const host = atob(hostb64 + "=".repeat((((-(hostb64.length)) % 4) + 4) % 4));
    console.log(code);
    console.log(host);

    const activation_url = `https://${host}/push/v2/activation/${code}`;
    console.log(activation_url);

    let headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })

    /**
     * Authorization public key generation
     * https://stackoverflow.com/a/55188241
     */
    const key = await crypto.subtle.generateKey(
        {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: 'SHA-256' },
        },
        false,
        ['sign', 'verify']
    );
    const publicKey = await crypto.subtle.exportKey('spki', key.publicKey);
    const keyBody = btoa(
        String.fromCharCode(...new Uint8Array(publicKey))
    )
        .match(/.{1,64}/g)
        .join('\n');

    const activate = await fetch(activation_url, {
        method: 'POST',
        headers: headers,
        body: new URLSearchParams({
            'jailbroken': 'false',
            'architecture': 'arm64',
            'region': 'US',
            'app_id': 'com.duosecurity.duomobile',
            'full_disk_encryption': 'true',
            'passcode_status': 'true',
            'platform': 'Android',
            'app_version': '3.49.0',
            'app_build_number': '323001',
            'version': '11',
            'manufacturer': 'unknown',
            'language': 'en',
            'model': 'Duo Extension',
            'security_patch_level': '2021-02-01',
            'pubkey': `-----BEGIN PUBLIC KEY-----\n${keyBody}\n-----END PUBLIC KEY-----`,
            'pkpush': 'rsa-sha256',
            'customer_protocol': '1'
        })
    });
    const activationData = await activate.json();

    console.log(activationData);

    if (activationData["stat"] === "FAIL" ||
        !activationData["response"]["hotp_secret"]) {
        scanError(ScanError.INV_QR);
        return;
    }

    const secret = activationData["response"]["hotp_secret"];
    console.log(secret);

    if (!secret) {
        scanError(ScanError.INV_QR);
        return;
    }

    await browser().storage.local.set({ "key": secret, "count": 0 });
}

async function requestScan(tab) {
    // let tabs = await browser().tabs.query({ active: true });

    // for (let tab of tabs) {
        try {
            let response = await browser().tabs.sendMessage(tab.id, { "request": "QR_REQUEST" });
            if (response.QRLink) {
                processQR(response.QRLink);
            }
        } catch (e) {
            console.error("scan error: ", e);
            setTimeout(() => scanError(ScanError.NO_QR), 2000);
        }
    // }
}

async function attemptAutofill(code,tab) {

    // let tabs = [tab,...(await browser().tabs.query({ active: true }))];

    // for (let tab of tabs) {
        try {
            let response = await browser().tabs.sendMessage(tab.id, { "request": "AUTOFILL", code });
            if (!response?.error) { incrementCount(response) } //then advance count
            console.log(response);
        } catch (e) {
            console.error(e);
        }
    // }
}

async function advanceEnroll(tab) {

    try{let response = await browser().tabs.sendMessage(tab.id, { "request": "ENROLL" });}
    catch(e){console.error(e)}

}



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let tab = sender.tab;
    ;
        (async () => {
            if (request.msg == 'go') {
                // sendResponse({response:'gotchaa'})
                const hotpCode = await generateHOTP();

                if (hotpCode === -1) {
                    if (await getIsEnrolling()) { advanceEnroll(tab) }
                    return;
                }

                let [code, count] = hotpCode;

                if (count > 120 && request.pathname != '/frame/enroll/pre_flow_prompt') {
                    advanceEnroll(tab)
                    return;
                }



                await attemptAutofill(code,tab);

            } else if (request.msg == 'scan') {
                requestScan(tab)
            } else if (request.msg == 'setup') {
                doSetup()
            } else if (request.msg == 'enrolled?') {
                let storage = await browser().storage.local.get(["key", "count"]);

                if (Object.keys(storage).length == 0) {
                    sendResponse(false)
                } else {
                    sendResponse(true)
                }
            } else if (request.msg == 'finish') {
                if (!await getIsEnrolling()) { return }
                chrome.tabs.remove(sender.tab.id);
                await setIsEnrolling(false)
            } else if (request.msg == 'settingUp?') {
                sendResponse(await getIsEnrolling())
            }
        })();
    return true;
});


async function doSetup() {
    await logout();
    await chrome.storage.local.clear();
    await setIsEnrolling(true)
}



chrome.runtime.onInstalled.addListener(async function (details) {
    if (details.reason == "install") {
        await doSetup()
        await sleep(10)
        chrome.tabs.create({ url: 'https://www.paypal.com/donate/?business=Q89X6M7NUTNA4&no_recurring=0&item_name=for+Whittie+Duo+Duper&currency_code=USD' })
        chrome.tabs.create({ url: 'https://login.whitman.edu/login' })
    }
});
