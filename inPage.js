window.addEventListener("message", (event) => {
    if (
        event.source === window &&
        event?.data?.direction === "from-content-script" &&
        event?.data?.message === 'search'
    ) {
        __doPostBack('ctl00$MainContent$cmdRptSearch', '');
    }
});