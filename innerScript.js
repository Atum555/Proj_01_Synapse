window.addEventListener("message", (event) => {
    console.log("Message Received!");
    console.log(event);
    console.log(event?.data);
    if (
        event.source === window &&
        event?.data?.direction === "from-content-script" &&
        event?.data?.message === 'search'
    ) {
        console.log("Message Valid!");
        __doPostBack('ctl00$MainContent$cmdRptSearch', '');
    }
});