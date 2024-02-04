chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (document.querySelector("textarea").value != request.data) {
        sendResponse(true);

        console.log("Data received in content script:", request.data);
        document.querySelector("textarea").value = request.data;
        document.querySelector("[type=submit]").click()

        // Alternative
        const keyEnterEvent = new KeyboardEvent('keydown', {
            code: 'Enter',
            key: 'Enter',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true
        });
        document.querySelector("textarea").dispatchEvent(keyEnterEvent);
    } else {
        sendResponse(false);
    }
});