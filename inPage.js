window.addEventListener("message", (event) => {
    if (
        event.source === window &&
        event?.data?.direction === "from-content-script" &&
        event?.data?.request === 'search'
    ) {
        __doPostBack('ctl00$MainContent$cmdRptSearch', '');
    }
});