module.exports = _xyz => {
      
    document.getElementById('btnReport').addEventListener('click', function () {
        //this.disabled = true;
        //document.getElementById('report-spinner').style.visibility = 'visible';
        //requestReport();

        let win = window.open(window.location.href + '&report=true', '_blank');
        win.focus();
    });
    
    // document.getElementById('btnReportClose').addEventListener('click', function(){
    //     document.getElementById('report-toast').style.visibility = 'hidden';
    //     document.getElementById('btnReport').disabled = false;
    // });
    
    // function requestReport(){
    //     let xhr = new XMLHttpRequest();

    //     let payload = {
    //         "hooks": _this.hooks
    //     };
        
    //     if (_this.drivetime && _this.drivetime.layer){
    //         let layers = _this.drivetime.layer.getLayers(),
    //             drivetime = layers[0].feature;
    //         payload["drivetime"] = drivetime;   
    //     } 
    
    //     xhr.open('POST', 'q_report_request');
    //     xhr.setRequestHeader("Content-Type","application/json");
    //     xhr.onload = function(){
    //         if(this.status === 200) pingReport(this.response);
    //     }
    //     xhr.send(JSON.stringify(payload));
    // }
    
    function pingReport(report) {
        setTimeout(ping, 1000);
        function ping(){
            let xhr = new XMLHttpRequest();
            xhr.open('GET', 'q_report_ping?report=' + report);
            xhr.onload = function () {
                if (this.status === 200 && this.response === 'false') {
                    setTimeout(ping, 1000);
                } else if (this.status === 200 && this.response === 'true') {
                    document.getElementById('btnReportDownload').href = 'q_pdf_download/?report=' + report;
                    document.getElementById('btnReportView').href = 'q_pdf_open/?report=' + report;
                    document.getElementById('report-spinner').style.visibility = 'hidden';
                    document.getElementById('report-toast').style.visibility = 'visible';
                }
            }
            xhr.send();
        }
    }
}