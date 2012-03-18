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
 * $('#myTextbox').inputFilter({regex: new RegExp('^\\d*$|^\\d*(\\.|\\,)\\d{0,2}$')});
 */
$(function(){
$.widget('cool.inputFilter', {
    options: {
        // RegExp object to use for validation. Can be null if you register your own validate event handler
        regex: null,
    },


    /**
     *
     */
    _init: function() {
        this.element.on('keydown', $.proxy(this._keyDown, this));
        this.element.on('keypress', $.proxy(this._keyPress, this));
        this.element.on('paste', $.proxy(this._paste, this));
    },


    /**
     * destructor
     */
    destroy: function() {
        // Unbind the events
        this.element.off('keydown', this._keyDown);
        this.element.off('keydown', this._keyPress);
        this.element.off('paste', this._paste);


        // Call parent
        $.cool.inputFilter.prototype.destroy.call(this);
    },


    /**
     * KeyDown event handler
     */
    _keyDown: function(evt) {
        // Get keycode
        var key = evt.charCode || evt.keyCode;
        var value = this.element[0].value;

        if (key === 8) {
            // Simulate backspace
            value = this._simulateBackspace();
        } else if (key === 46) {
            // Simulate delete
            value = this._simulateDelete();
        }

        // Evaluate value
        return this._validate(value);
    },


    /**
     * KeyPressed event handler
     */
    _keyPress: function(evt) {
        // Get keycode
        var key = evt.charCode || evt.keyCode;                

        // Ignore function keys
        if (evt.keyCode === 0) return true;
        if (evt.ctrlKey || evt.altKey) return true;
        if (key < 32) return true;

        // Convert to character
        var c = String.fromCharCode(key);
        return this._validate(this._editValue(c));
    },


    /**
     * Paste event handler
     * FYI: If reading from cliboard fails then paste will be blocked
     */
    _paste: function(evt) {
        // Attempt to read from clipboard
        var value = this._readClipboard(evt);

        // Validate result
        return value === null ? false : this._validate(this._editValue(value));
    },


    /**
     * Attempt to read the clipboard data
     * @param evt event object derived from a paste event
     * @returns mixed string if succesfull or null otherwise
     */
    _readClipboard: function(evt) {
        var value = null;
        if (evt.originalEvent.clipboardData) {
            // Chrome
            var value = evt.originalEvent.clipboardData.getData('text');

            // Safari
            if (value == undefined) value = evt.originalEvent.clipboardData.getData('text/plain');
        }

        return typeof(value) === 'string' ? value : null;
    },


    /**
     * Validate the value
     */
    _validate: function(value) {
        // Don't bother validating if nothing's changed
        if (value === this.element[0].value)
            return true;

        if (this._trigger('beforeValidate', {}, {element: this.element, value: value})) {
            
            // Validate
            var isValid;
            if (this.options.regex !== null) {
                isValid = this.options.regex.test(value);
            } else {
                isValid = this._trigger('validate', {}, {element: this.element, value: value});
            }
            
            // After validate
            return isValid && this._trigger('afterValidate', {}, {element: this.element, value: value, isValid: isValid});
        }

        return false;
    },


    /**
     * Simulate user clicked delete key
     * @returns string value of element after backspace was pressed
     */
    _simulateDelete: function() {
        var range = this._getSelectedRegion();
        var value = this.element[0].value;

        // Cursor dead right
        if (range.start === value.length) return value;

        // Delete character on the right of the cursor
        if (range.start === range.end)
            return value.substr(0, range.start) + value.substr(range.end + 1);

        // Remove selected text
        return value.substr(0, range.start) + value.substr(range.end);
    },


    /**
     * Simulate user clicked backspace key
     * @returns string value of element after backspace was pressed
     */
    _simulateBackspace: function() {
        var range = this._getSelectedRegion();
        var value = this.element[0].value;

        // cursor dead left
        if (range.end <= 0) return value;

        // Delete character on the left of the cursor
        if (range.start === range.end)
            return value.substr(0, range.start -1) + value.substr(range.end);

        // Remove selected text
        return value.substr(0, range.start) + value.substr(range.end);
    },


    /**
     * Predict what the control value will be after correctly positionig
     * the subject in the current value of the control
     * @params string subject to position according to curret
     * @returns string value of element after this character was pressed
     */
    _editValue: function(subject) {
        var range = this._getSelectedRegion();
        var value = this.element[0].value;

        return value.substr(0, range.start) + subject + value.substr(range.end);
    },


    /**
     * Get the currently selected text on the control
     */
    _getSelectedRegion: function() {
        if (document.selection != undefined) {
            // IE SUX! FFS!
            // The current selection
            var range = document.selection.createRange();
            // We'll use this as a 'dummy'
            var stored_range = range.duplicate();
            // Select all text
            stored_range.moveToElementText( this.element );
            // Now move 'dummy' end point to end point of original range
            stored_range.setEndPoint( 'EndToEnd', range );
            // Now we can calculate start and end points
            var start = stored_range.text.length - range.text.length;
            var end = start + range.text.length;
            return {
                start: start,
                end: end
            }
        } else if (this.element[0].selectionStart != undefined) {
            // Chrome, FFox, Safari, etc...
            return {start: this.element[0].selectionStart, end: this.element[0].selectionEnd};
        }
    }
});
});