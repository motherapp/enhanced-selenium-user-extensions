// the real extensions - enhancement of current usertensioins command list
Selenium.prototype.isTextPresentXML = function(pattern) {
  /**
   * Verifies that the specified text pattern appears somewhere in the entire XML document
   * (as opposed to text only within &lt;body/&gt; tags).
   * Note that when defining text patterns in your test case you should
   * escape HTML characters. For example: <td>&lt;userInRole&gt;</td>
var $childs = $(this).children(); var length = $childs.length; while(length--) alert($childs[length].tagName);    * (not <td><userInRole></td>).
   * @param pattern a <a href="#patterns">pattern</a> to match with the text of the document
   * @return boolean true if the pattern matches the text, false otherwise
   */

    // the only code that differs from the stock Selenium isTextPresent
    //	is the code to retrieve allText...
    // IE
    var allText = this.browserbot.getDocument().xml;
    if (allText == null) {
    	// Firefox
        var serailizer = new XMLSerializer();
    	allText = serailizer.serializeToString(this.browserbot.getDocument());
    }

    var patternMatcher = new PatternMatcher(pattern);
    if (patternMatcher.strategy == PatternMatcher.strategies.glob) {
            if (pattern.indexOf("glob:")==0) {
                    pattern = pattern.substring("glob:".length); // strip off "glob:"
                }
        patternMatcher.matcher = new PatternMatcher.strategies.globContains(pattern);
    }
    else if (patternMatcher.strategy == PatternMatcher.strategies.exact) {
                pattern = pattern.substring("exact:".length); // strip off "exact:"
        return allText.indexOf(pattern) != -1;
    }
    return patternMatcher.matches(allText);
};


function showChildrenNode(node)
{
    var $childs = jQuery(node).children(); var length = $childs.length; while(length--) LOG.info(node.tagName + " ==> " + $childs[length].tagName); 
}

//get text excluding the descendents
function getDirectText(node)    
{
    var result = jQuery(node).contents().map(function() {
        if( this.nodeType === 3 ) {
            return this.data;
        }
    }).get().join('');
       
    return result;
}


//supports selector
Selenium.prototype.isTextPresentXML2 = function(pattern, selector) 
{
    var allText = this.browserbot.getDocument().xml;
    if (allText == null) {
    	// Firefox
    	allText = new XMLSerializer().serializeToString(this.browserbot.getDocument());
    }
    
    var node = jQuery(jQuery.parseXML(allText));

    node_list = node.find(selector);

    LOG.info("@9099:xml node list size:"+ node_list.size());

    var patternMatcher = new PatternMatcher(pattern);


    var global_matched = false;

    if (patternMatcher.strategy == PatternMatcher.strategies.glob) {
            if (pattern.indexOf("glob:")==0) {
                    pattern = pattern.substring("glob:".length); // strip off "glob:"
                }
        patternMatcher.matcher = new PatternMatcher.strategies.globContains(pattern);
    }
    else if (patternMatcher.strategy == PatternMatcher.strategies.exact) {
        pattern = pattern.substring("exact:".length); // strip off "exact:"
    }

    node_list.each(function(index){
        var direct_text = getDirectText($(this));

        var matched = patternMatcher.matches(direct_text);

        LOG.info("matching:" + index + ":" + direct_text + ":" + matched);

        if(matched)
            global_matched = true;

    });
    
    LOG.info("global matched: " + global_matched);


    //LOG.info("@9142: " + HtmlRunnerTestLoop.prototype.commandComplete);

    return global_matched;

}


