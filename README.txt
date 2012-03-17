/**
 * FiterInput
 * @author Paris Theofanidis (ptheofan@gmail.com)
 * 
 * Fiter user input in textbox in during keyDown and keyPress events, thus
 * artifact free. This widget will properly handle selected text and paste events.
 * 
 * Tested Under: Chrome, Safari, FireFox
 * 
 * Options
 *   regex: A  RegExp object which will be used for testing. If null a validate
 *          event will be fired.
 *          
 * Events:
 *    beforeValidate
 *    validate
 *    afterValidate
 *
 *
 * Regexes Cheatsheet (make pull requests should you want to add more)
 * UNSIGNED float with 2 decimal points max
 * ^\d*$|^\d*(\.|\,)\d{0,2}$
 * 
 * Example
 * .inputFilter({regex: new RegExp('^\d*$|^\d*(\.|\,)\d{0,2}$')});
 */
