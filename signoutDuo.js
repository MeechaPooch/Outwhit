// credit https://github.com/jamesdbloom/delete-all-cookies/blob/master/background.js#L10
var removeCookie = function (cookie) {
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
    chrome.cookies.remove({"url": url, "name": cookie.name});
};
export function logout() {
    clearAllCookies('duosecurity.com')
    // clearAllCookies('whitman.instructure.com',(c=>c.name?.includes('session')))
    clearAllCookies('whitman.edu')
}

function clearAllCookies(domain,filter) {
    chrome.cookies.getAll({
        domain:domain
    },(cookies)=>{
        console.log(cookies)
        if(filter){cookies = cookies.filter(filter)}
        cookies.forEach(removeCookie)
    })

}

// document.querySelector('#butnn').onclick=logout