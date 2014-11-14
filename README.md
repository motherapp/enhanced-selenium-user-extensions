enhanced-selenium-user-extensions
=================================

1. import entire jquery inside
2. support check for XML present
3. screen capture for command error and timeout
4. for IE screen capture, need extra plugin (obsoleted)
5. special handling for IE events (obsoleted)


How to Use
==========

<pre><code>
type user-extensions.*.* > user-extensions.js

java -jar c:/jenkins/selenium-server-standalone-2.33.0.jar -userExtensions C:\jenkins\bin\user-extensions.js -port 4520 -timeout 900 -firefoxProfileTemplate c:\FirefoxPortable201\Data\profile -htmlSuite "*firefox C:\FirefoxPortable201\App\Firefox\firefox.exe" http://example.com test_cases\suit_405_testing_example.html result_suit_405_testing_example.html -singlewindow
</code></pre>

