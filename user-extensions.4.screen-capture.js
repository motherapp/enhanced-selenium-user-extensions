function doScreenShot(file_path)
{
    if(jQuery.browser.msie) //for IE
    {
        //window.Snapsie.saveSnapshot(file_path);   //not yet stable
        //selenium.doCaptureScreenshot(file_path);
        //selenium.doCaptureEntirePageScreenshot(file_path);
    }
    else
        selenium.doCaptureEntirePageScreenshot(file_path);
}



//http://stackoverflow.com/questions/14942807/js-or-jquery-how-to-get-the-date-value-as-yyyymmddhhmmss
function makeStamp(d) { // Date d
    var y = d.getFullYear(),
        M = d.getMonth() + 1,
        D = d.getDate(),
        h = d.getHours(),
        m = d.getMinutes(),
        s = d.getSeconds(),
        ms = d.getMilliseconds() + '',
        pad = function (x, digits) {
            x = x+'';
            if (x.length === 1) {
                return '0' + x;
            }
            return x;
        };

        return y + pad(M) + pad(D) + "_" + pad(h) + pad(m) + pad(s) + "_" + ms;
}

function extractFileName(path) {
    return path.substring(path.lastIndexOf("/") + 1, path.indexOf("."));
}


function getQueryVariable(url, variable) {
    var query = url.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }

    return "";
}

function current_suite_case_log(){
    var suite_file_name = "";
    var error_case_report = "";
    var currentWindow = selenium.browserbot.getCurrentWindow();
    var doc = currentWindow.document.documentElement;

    if(window.testFrame){
        var testCase = testFrame.getCurrentTestCase();
        suite_file_name = getQueryVariable(currentWindow.location, "sel_suit");
        if(suite_file_name){
            current_job_name = suite_file_name;
        }
    //    case_name = getQueryVariable(currentWindow.location, "sel_case");
        error_case_report = jQuery(testCase.testDocument.documentElement).html();
        LOG.info("@9195:"+currentWindow.location.href);
    }

    var test_file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
    error_test_suite_path = "C:\\jenkins\\selenium-error-report\\" + current_job_name + "-time-out-" + ma_date3 +".html";

    time_out_suite_img_path = "C:/jenkins/screen_capture/" + current_job_name + "-time-out-" + ma_date3 +".png";
    if(!doc.style){
        doc.style = {};
    }

    doScreenShot(time_out_suite_img_path);

    LOG.info("@9198:error_test_suite_path:"+ error_test_suite_path);
    test_file.initWithPath(error_test_suite_path);

    var fos =  Components.classes["@mozilla.org/network/file-output-stream;1"]
                           .createInstance(Components.interfaces.nsIFileOutputStream);

    //LOG.info("@9207:" + fos.init);
    fos.init(test_file, 0x02 | 0x08 | 0x20, 0666, 0);

    //https://developer.mozilla.org/en-US/docs/Writing_textual_data
    var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                           .createInstance(Components.interfaces.nsIConverterOutputStream);

    // This assumes that fos is the nsIOutputStream you want to write to
    os.init(fos,"UTF-8",0,0x0000);
    os.writeString(error_case_report);
    //LOG.info("@9217: " + os.init);

    os.close();

}

function screenCapture(errorMessage){
    LOG.info("screen capture with message: " + errorMessage);

    var screenCaptureFolder = "C:/jenkins/screen_capture";

    var title = "";
    //for xml handling in screen capture
    var currentWindow = selenium.browserbot.getCurrentWindow();
    var doc = currentWindow.document.documentElement;


//LOG.error("@9200:" + Object.keys(window));
 //   LOG.error("@9201:" + Object.keys(currentWindow.window));
    if(window.testCase) //for selenium IDE, not working now
    {
        LOG.info("@9175: test case found");
        title = testCase.title;
        //LOG.info("@9203:" + Object.keys(testCase));
    }


    if(window.testFrame)    //for selenium RC
    {
        var testCase = testFrame.getCurrentTestCase();
        //LOG.info("@9246:" + Object.keys(testCase));
      //  error_case_report = error_case_report + "\ninfo: Starting test " + testCase.pathname;
      //  error_case_report = error_case_report + "\ninfo: Executing: " + errorMessage.replace(/[^a-zA-Z0-9]/g,'_');
        LOG.info("@9190:" + testCase.pathname);
        title = extractFileName(testCase.pathname);

        var suite_name = getQueryVariable(currentWindow.location, "sel_suit");
        var random_mark = getQueryVariable(currentWindow.location, "random_mark");

        if(suite_name)
            title = random_mark + "_" + suite_name + "_" + title
    }



    LOG.info("@9194: " + currentWindow.location.href);

    var fileName = "error_" + makeStamp(new Date()) + "__" + title + "__" + errorMessage;
    fileName = fileName.replace(/[^a-zA-Z0-9]/g,'_');   //remove special characters

    fileName = fileName.substring(0, 100);
    fileName = fileName + ".png";
    //error_case_report = error_case_report + "\ninfo:" + fileName + "\n"; 
    //suite_file_name = suite_name + ".html"

    LOG.info("@9195:" + fileName);
    LOG.info("@9238:"+ suite_name);

    LOG.info("@9188:" + doc.style);
    if(!doc.style){
        doc.style = {};
    }


    doScreenShot(screenCaptureFolder + "/" + fileName);
    //not support iso string
    //doScreenShot("c:/jenkins/error_" + (new Date()).toISOString() + "_" + command.command + "_" + command.target + "_" + command.value + ".png");


    //LOG.info("@9248: " + Components);

//    LOG.info("@9250: " + file);
    LOG.error("@9202");
}

function screenCaptureWithCommand(command)
{
    screenCapture(command.command + "|" + command.target + "|" + command.value);
}


var g_resize_window_done = false
function resumeOverride(){
    LOG.info("@9217, on resume");
    LOG.info("@9218, on resume");

    /**
     * Select the next command and continue the test.
     */
    LOG.debug("currentTest.resume() - actually execute");
    try {
        selenium.browserbot.pageLoadError=null;

        selenium.browserbot.runScheduledPollers();

        if(this.currentCommand.command == "open"){
            var timestamp = makeStamp(new Date());
            var connector = "?";
            if(this.currentCommand.target.indexOf("?") >= 0)
                connector = "&";
            var timestamp_argument = connector + "sel_timestamp=" + timestamp;

            this.currentCommand.target += timestamp_argument;

            LOG.info("@9539: adding time stamp to URL: " + this.currentCommand.target);
        }

        LOG.info("@9321");
        this._executeCurrentCommand();
        
        try {
            LOG.info("@9534");
            var currentWindow = selenium.browserbot.getCurrentWindow();

            LOG.info("@9537");

            if(!g_resize_window_done && currentWindow && false){
                currentWindow.moveTo(0, 0);
                currentWindow.resizeTo("1024", "800");
                g_resize_window_done = true;
            }

            LOG.info("@9544");

         //   LOG.info("@9326");
            var suite_file_name = "";

            suite_file_name = getQueryVariable(currentWindow.location, "sel_suit");
            LOG.info("@9313, current URL: " +currentWindow.location.href);
            if (suite_file_name || current_job_name){
                current_suite_case_log();
            }

            LOG.info("@9555");

        }
        catch(e) {
            LOG.error("@9342, failed to get current screen log");
        }


        if(this.result.failed) {
            LOG.error("@9201:failed");
            //var command = this.currentCommand;
            //screenCapture(command.command + "|" + command.target + "|" + command.value)
            screenCaptureWithCommand(this.currentCommand);
        }

        this.continueTestWhenConditionIsTrue();

    } catch (e) {
        LOG.error("@9210:" + e);

        //var command = this.currentCommand;
        //screenCapture(command.command + "|" + command.target + "|" + command.value)

        screenCaptureWithCommand(this.currentCommand);

        if (!this._handleCommandError(e)) {
            this.testComplete();
        } else {
            this.continueTest();
        }
    }
}

function continueTestWhenConditionIsTrueOverride(){
   /**
     * Busy wait for waitForCondition() to become true, and then carry
     * on with test.  Fail the current test if there's a timeout or an
     * exception.
     */
    //LOG.debug("currentTest.continueTestWhenConditionIsTrue()");
    selenium.browserbot.runScheduledPollers();
    try {
        if (this.waitForCondition == null) {
            LOG.debug("null condition; let's continueTest()");
            LOG.debug("Command complete");
            this.commandComplete(this.result);
            this.continueTest();
        } else if (this.waitForCondition()) {
            LOG.debug("condition satisfied; let's continueTest()");
            this.waitForCondition = null;
            LOG.debug("Command complete");
            this.commandComplete(this.result);
            this.continueTest();
        } else {
            //LOG.debug("waitForCondition was false; keep waiting!");
            window.setTimeout(fnBind(this.continueTestWhenConditionIsTrue, this), 10);
        }
    } catch (e) {
        this.result = {};

        var errorMessage = extractExceptionMessage(e);

        //LOG.info("@9302: " + errorMessage);

        if(errorMessage.indexOf("MA_TIME_OUT") < 0 ){
            this.result.failed = true;
            this.result.failureMessage = errorMessage;
        }
        else {
            LOG.info("skip error for MA_TIME_OUT");
        }

        this.commandComplete(this.result);
        this.continueTest();
    }

}



if( typeof HtmlRunnerTestLoop == 'function'){
    HtmlRunnerTestLoop.prototype.resume = resumeOverride;
    HtmlRunnerTestLoop.prototype.continueTestWhenConditionIsTrue = continueTestWhenConditionIsTrueOverride;
}

if( typeof TestLoop == 'function'){
    TestLoop.prototype.resume = resumeOverride;
    TestLoop.prototype.continueTestWhenConditionIsTrue = continueTestWhenConditionIsTrueOverride;
}


//screen capture for time out
Selenium.decorateFunctionWithTimeout = function(f, timeout, callback) {
    if (f == null) {
        return null;
    }
    
    var timeoutTime = getTimeoutTime(timeout);
   
    return function() {
        if (new Date().getTime() > timeoutTime) {
            if (callback != null) {
                 callback();
            }


            screenCapture("timed out");

            var error =  new SeleniumError("@9234: MA_TIME_OUT Timed out after " + timeout + "ms");

            //LOG.error("@9291: " + error.stack);

            throw error;
        }
        return f();
    };

}



function removeClassName(element, name) {
    var re = new RegExp("\\b" + name + "\\b", "g");
    if(element && element.className)
        element.className = element.className.replace(re, "");
}


// Returns the text in this element
function getText(element) {
    var text = "";


    var isRecentFirefox = (browserVersion.isFirefox && browserVersion.firefoxVersion >= "1.5");

    if(!element)
        return text;

    if (isRecentFirefox || browserVersion.isKonqueror || browserVersion.isSafari || browserVersion.isOpera) {
        text = getTextContent(element);
    } else if (element.textContent) {
        text = element.textContent;
    } else if (element.innerText) {
        text = element.innerText;
    }

    text = normalizeNewlines(text);
    text = normalizeSpaces(text);

    return text.trim();
}

//initialization
ma_date3 = (new Date()).getTime();
var current_job_name = "";
