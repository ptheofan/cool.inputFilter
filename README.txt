FiterInput
author Paris Theofanidis (ptheofan@gmail.com)
source https://github.com/ptheofan/cool.inputFilter
demo http://yeeha.pro/demo/textInput/
 
Fiter user input in textbox in during keyDown and keyPress events, thus
artifact free. This widget will properly handle selected text and paste events.
 
Tested Under: Chrome, Safari, FireFox, IE8, IE9
 
Options
  regex: A  RegExp object which will be used for testing. If null a validate
         event will be fired.
          
Events:
   beforeValidate  --  an ideal place to remap user input
   validate  --  when a regex is not enough
   afterValidate  --  an ideal place to apply logic validation, beyond regex and keystrokes
   KeyUp (overrides default)  --  an ideal place to update your elements should you need to


Regexes Cheatsheet (make pull requests should you want to add more)
UNSIGNED float with 2 decimal points max
^\d*$|^\d*(\.|\,)\d{0,2}$

Example
$('#myTextbox').inputFilter({regex: new RegExp('^\\d*$|^\\d*(\\.|\\,)\\d{0,2}$')});