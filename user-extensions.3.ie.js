/**
 * This file wraps the Snapsie ActiveX object, exposing a single saveSnapshot()
 * method on a singleton object.
 *
 * See http://snapsie.sourceforge.net/
 */

/***************** 
WALTY: I did not modify the code here, but I updated the activex source code, so it now try 
       to get the screen capture of whole PC, instead of the browser 
       Anyway, I give up the IE testing eventually, due to lack of support of selenium driver
       for IE (should use webdriver instead).
*******************/
if(jQuery.browser.msie){

    window.Snapsie = new function() {
        // private fields
        var nativeObj;
        
        // private methods
        
        function init() {
            try {
                nativeObj = new ActiveXObject('Snapsie.CoSnapsie');
            }
            catch (e) {
                showException(e);
            }
        }
        
        function showException(e) {
       //     alert(e + ', ' + (e.message ? e.message : ""));
            
            throw e;
        }
        
        function isQuirksMode(inDocument) {
            return (inDocument.compatMode == 'BackCompat');
        }
        
        function getDrawableElement(inDocument) {
            if (isQuirksMode(inDocument)) {
                return inDocument.getElementsByTagName('body')[0];
            }
            else {
                // standards mode
                return inDocument.documentElement;
            }
        }
        
        /**
         * Returns the canonical Windows path for a given path. This means
         * basically replacing any forwards slashes with backslashes.
         *
         * @param path  the path whose canonical form to return
         */
        function getCanonicalPath(path) {
            path = path.replace(/\//g, '\\');
            path = path.replace(/\\\\/g, '\\');
            return path;
        }

        // public methods
        
        /**
         * Saves a screenshot of the current document to a file. If frameId is
         * specified, a screenshot of just the frame is captured instead.
         *
         * @param outputFile  the file to which to save the screenshot
         * @param frameId     the frame to capture; omit to capture entire document
         */
        this.saveSnapshot = function(outputFile, frameId) {
            if (!nativeObj) {
                var e = new Exception('Snapsie was not properly initialized');
                showException(e);
                return;
            }

            var currentDocument = selenium.browserbot.getDocument();
            
            var drawableElement = getDrawableElement(currentDocument);
            //var drawableElement = getDrawableElement(document);
            var drawableInfo = {
                  overflow  : drawableElement.style.overflow
                , scrollLeft: drawableElement.scrollLeft
                , scrollTop : drawableElement.scrollTop
            };
            drawableElement.style.overflow = 'hidden';
            
            var capturableDocument;
            var frameBCR = { left: 0, top: 0 };
            if (arguments.length == 1) {
                capturableDocument = currentDocument;
            }
            else {
                var frame = currentDocument.getElementById(frameId);
                capturableDocument = frame.document;
                
                // scroll as much of the frame into view as possible
                frameBCR = frame.getBoundingClientRect();
                selenium.browserbot.getWindow().scroll(frameBCR.left, frameBCR.top);
                //window.scroll(frameBCR.left, frameBCR.top);
                frameBCR = frame.getBoundingClientRect();
            }
            
            try {
                //alert("@9197:" + getCanonicalPath(outputFile) );
                //alert("@9194: " + nativeObj);
                //alert("@9195: " + nativeObj.saveSnapshot);
                //alert("@9198:" + frameId);
                //alert("@9198:" + drawableElement.clientWidth);
                //alert("@9198:" + drawableElement.clientHeight);
                //alert("@9198:" + frameBCR.left);
                //alert("@9198:" + frameBCR.top);
                nativeObj.saveSnapshot(
                    getCanonicalPath(outputFile),
                    frameId,
                    drawableElement.scrollWidth,
                    drawableElement.scrollHeight,
                    drawableElement.clientWidth,
                    drawableElement.clientHeight,
                    drawableElement.clientLeft,
                    drawableElement.clientTop,
                    frameBCR.left,
                    frameBCR.top
                );
           //     alert("@9210: done");
            }
            catch (e) {
                showException(e);
            }
            
            // revert
            
            drawableElement.style.overflow = drawableInfo.overflow;
            drawableElement.scrollLeft = drawableInfo.scrollLeft;
            drawableElement.scrollTop = drawableInfo.scrollTop;
        }
        
        // initializers
        
        init();
    };

}
else
    window.snapsie = null;


/*this one is not used any more*/

/*
function printStackTrace() {
  var callstack = [];
  var isCallstackPopulated = false;
  try {
    i.dont.exist+=0; //doesn't exist- that's the point
  } catch(e) {
    if (e.stack) { //Firefox
      var lines = e.stack.split('\n');
      for (var i=0, len=lines.length; i<len; i++) {
        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
          callstack.push(lines[i]);
        }
      }
      //Remove call to printStackTrace()
      callstack.shift();
      isCallstackPopulated = true;
    }
    else if (window.opera && e.message) { //Opera
      var lines = e.message.split('\n');
      for (var i=0, len=lines.length; i<len; i++) {
        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
          var entry = lines[i];
          //Append next line also since it has the file info
          if (lines[i+1]) {
            entry += ' at ' + lines[i+1];
            i++;
          }
          callstack.push(entry);
        }
      }
      //Remove call to printStackTrace()
      callstack.shift();
      isCallstackPopulated = true;
    }
  }
  if (!isCallstackPopulated) { //IE and Safari
    var currentFunction = arguments.callee.caller;
    while (currentFunction) {
      var fn = currentFunction.toString();
      var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
      callstack.push(fname);
      currentFunction = currentFunction.caller;
    }
  }
  alert(callstack);
}
*/




/*
if (jQuery.browser.msie) {
    Selenium.prototype.doOpen = function(url, ignoreResponseCode) {
        this.browserbot.isNewPageLoaded = function() {
            var e;


            if (this.pageLoadError) {
                LOG.error("isNewPageLoaded found an old pageLoadError: " + this.pageLoadError);
                if (this.pageLoadError.stack) {
                    LOG.warn("Stack is: " + this.pageLoadError.stack);
                }
                e = this.pageLoadError;
                this.pageLoadError = null;
                throw e;
            }

            if (self.ignoreResponseCode) {
                return self.newPageLoaded;
            } else {
                if (self.isXhrSent && self.isXhrDone) {
                    if (!((self.xhrResponseCode >= 200 && self.xhrResponseCode <= 399) || self.xhrResponseCode == 0)) {
                        // TODO: for IE status like: 12002, 12007, ... provide corresponding statusText messages also.
                        LOG.error("XHR failed with message " + self.xhrStatusText);
                        e = "XHR ERROR: URL = " + self.xhrOpenLocation + " Response_Code = " + self.xhrResponseCode + " Error_Message = " + self.xhrStatusText;
                        self.abortXhr = false;
                        self.isXhrSent = false;
                        self.isXhrDone = false;
                        self.xhrResponseCode = null;
                        self.xhrStatusText = null;
                        throw new SeleniumError(e);
                    }
                }
                return self.newPageLoaded && (self.isXhrSent ? (self.abortXhr || self.isXhrDone) : true); 
            }
        };  //end of browserbot override


        if (ignoreResponseCode == null || ignoreResponseCode.length == 0) {
            this.browserbot.ignoreResponseCode = true;
        } else if (ignoreResponseCode.toLowerCase() == "true") {
            this.browserbot.ignoreResponseCode = true;
        } else {
            this.browserbot.ignoreResponseCode = false;
        }
        this.browserbot.openLocation(url);
        this.browserbot.pageLoadError = null;
        if (window["proxyInjectionMode"] == null || !window["proxyInjectionMode"]) {
            return this.makePageLoadCondition();
        } // in PI mode, just return "OK"; the server will waitForLoad
    };

}
*/

//alert(jQuery.browser.msie);
//

//override default fire event
Selenium.prototype.doFireEvent = function(locator, eventName) {
    /**
     * Explicitly simulate an event, to trigger the corresponding &quot;on<em>event</em>&quot;
     * handler.
     *
     * @param locator an <a href="#locators">element locator</a>
     * @param eventName the event name, e.g. "focus" or "blur"
     */
    var element = this.browserbot.findElement(locator);
    var doc = goog.dom.getOwnerDocument(element);
    var view = goog.dom.getWindow(doc);

    //walty
    if (jQuery.browser.msie && view.jQuery){
        view.jQuery(element).trigger(eventName);

        return;
    }

    //default implementation
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
        var ieEvent = createEventObject(element, false, false, false, false);
        element.fireEvent('on' + eventName, ieEvent);
    } else {
        var evt = doc.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, true);
        element.dispatchEvent(evt);
    }
};

function triggerKeyEvent(element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    var keycode = getKeyCodeFromKeySequence(keySequence);


    //walty
    var doc = goog.dom.getOwnerDocument(element);
    var view = goog.dom.getWindow(doc);

    LOG.info("@9815: " + eventType + ", " + keySequence + ", " + keycode + ", " + (typeof keycode));
    if (jQuery.browser.msie && view.jQuery){
        if(keycode && (typeof keycode === "string"))
        {
            LOG.info("@9820: " + keycode);

            keycode = parseInt(keycode); //the default is string
            LOG.info("@9822");
        }

        LOG.info("@9817");
        var e = view.jQuery.Event( eventType, { which: keycode, keyCode: keycode } );
        LOG.info("@9743");
        view.jQuery(element).trigger(e);
        LOG.info("@9743");
        return;
    }

    //original
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
        var keyEvent = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
        keyEvent.keyCode = keycode;
        element.fireEvent('on' + eventType, keyEvent);
    }
    else {
        var evt;
        if (window.KeyEvent) {
            var doc = goog.dom.getOwnerDocument(element);
            var view = goog.dom.getWindow(doc);
            evt = doc.createEvent('KeyEvents');
            evt.initKeyEvent(eventType, true, true, view, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, keycode, keycode);
        } else {
            evt = document.createEvent('UIEvents');
            
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;

            evt.initUIEvent(eventType, true, true, window, 1);
            evt.keyCode = keycode;
            evt.which = keycode;
        }

        element.dispatchEvent(evt);
    }
}

