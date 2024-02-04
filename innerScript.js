window.addEventListener("message", (event) => {
    console.log("Message Received!");
    if (
        event.source === window &&
        event?.data?.direction === "from-page-script" &&
        event?.data?.message === 'search'
    ) {
        console.log("Message Valid!");
        __doPostBack('ctl00$MainContent$cmdRptSearch', '');
    }
});