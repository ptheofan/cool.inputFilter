/**
 * FiterInput
 * @author Paris Theofanidis (ptheofan@gmail.com)
 * @source https://github.com/ptheofan/cool.inputFilter
 * @demo http://yeeha.pro/demo/textInput/
 *
 * Fiter user input in textbox in during keyDown and keyPress events, thus
 * artifact free. This widget will properly handle selected text and paste events.
 *
 * Tested Under: Chrome, Safari, FireFox, IE8, IE9
 *
 * Options
 *   regex: A  RegExp object which will be used for testing. If null a validate
 *          event will be fired.
 *
 * Events:
 *    beforeValidate  --  an ideal place to remap user input
 *    validate  --  when a regex is not enough
 *    afterValidate  --  an ideal place to apply logic validation, beyond regex and keystrokes
 *    KeyUp (overrides default)  --  an ideal place to update your elements should you need to
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

        evtData: {
            isValid: false,
            value: '',
            userInput: null,
            isDelete: false,
            isEdit: false,
            isAppend: false,
            preventKeyUp: null,     // Set to either true/false to override default behaviour
            widget: null
        }
    },

    // Holds the preventKeyUp internally determined behaviour
    // This behaviour will be overriden by options.evtData.preventKeyUp
    preventKeyUp: false,

    // The original user input
    originalUserInput: null,

    // Used to track whether script wants to modify the value
    originalValue: null,

    // EventData vector
    evtData: null,


    /**
     *
     */
    _init: function() {
        this.element.on('keydown', $.proxy(this._keyDown, this));
        this.element.on('keypress', $.proxy(this._keyPress, this));
        this.element.on('keyup', $.proxy(this._keyup, this));
        this.element.on('paste', $.proxy(this._paste, this));
        this.element.on('cut', $.proxy(this._cut, this));
    },


    /**
     * destructor
     */
    destroy: function() {
        // Unbind the events
        this.element.off('keydown', this._keyDown);
        this.element.off('keypress', this._keyPress);
        this.element.off('paste', this._paste);
        this.element.off('keyup', this._paste);

        // Call parent
        $.cool.inputFilter.prototype.destroy.call(this);
    },

    /**
     * KeyUp event handler
     */
    _keyup: function(evt) {
        if (this.evtData.preventKeyUp === true) {
            return false;
        }

        if (this.preventKeyUp === true && this.evtData.preventKeyUp === null) {
            return false;
        }

        return this._trigger('keyUp', evt, this.evtData);
    },


    /**
     * KeyDown event handler
     */
    _keyDown: function(evt) {
        // KeyDown is the first event we receive -- create a new evtData structure
        this.evtData = $.extend(true, {}, this.options.evtData);
        this.evtData.widget = this;

        // Get keycode
        var key = evt.charCode || evt.keyCode;
        this.evtData.value = this.element[0].value;

        if (key === 8) {
            // Simulate backspace
            this.evtData.value = this._simulateBackspace();
        } else if (key === 46) {
            // Simulate delete
            this.evtData.value = this._simulateDelete();
        }

        // Evaluate value
        return this._validate(this.evtData.value, evt);
    },


    /**
     * KeyPressed event handler
     */
    _keyPress: function(evt) {
        // Get keycode
        var key = evt.charCode || evt.keyCode;

        // Ignore function keys
//        if (evt.keyCode === 0) return true;       -- mozila Compatibility
        if (evt.ctrlKey || evt.altKey) return true;
        if (key < 32) return true;

        // Convert to character
        var c = String.fromCharCode(key);
        return this._validate(this._editValue(c), evt);
    },


    /**
     *
     */
    _cut: function(evt) {
        // KeyDown is the first event we receive -- create a new evtData structure
        this.evtData = jQuery.extend(true, {}, this.options.evtData);
        this.evtData.widget = this;

        var rVal = this._validate(this._simulateDelete(), evt);
        return rVal;
    },


    /**
     * Paste event handler
     * FYI: If reading from cliboard fails then paste will be blocked
     */
    _paste: function(evt) {
        // Attempt to read from clipboard
        var value = this._readClipboard(evt);

        // Validate result
        return value === null ? false : this._validate(this._editValue(value), evt);
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
    _validate: function(value, evt) {
        // Don't bother validating if nothing's changed
        if (value === this.element[0].value)
            return true;

        if (this._trigger('beforeValidate', {}, this.evtData)) {

            // Check if user input was modified and replace original _edit with this _edit
            if (this.evtData.userInput !== this.originalUserInput) {
                var range = this._getSelectedRegion();
                var value = this.evtData.value;
                this.evtData.value = value.substr(0, range.start) + this.evtData.userInput + value.substr(range.end + this.evtData.userInput.length);
            }


            // Validate
            if (this.options.regex !== null) {
                this.evtData.isValid = this.options.regex.test(value);
            } else {
                this.evtData.isValid = this._trigger('validate', {}, this.evtData);
            }

            // Update preventKeyUp
            this.preventKeyUp = !(this.evtData.isValid && this._trigger('afterValidate', {}, this.evtData));

            // After validate
            var rVal = this.evtData.isValid && this._trigger('afterValidate', {}, this.evtData);

            // All ok, check if original value was modified
            if (this.originalValue !== this.evtData.value) {
                // Set the value as imposed
                this.element.val(this.evtData.value);

                // Reject original user input
                rVal = false;

            // Or if the orignal user input was modified
            } else if (this.evtData.userInput !== this.originalUserInput && this.evtData.userInput != '') {
                // software modified keystroke - update accordingly
                var range = this._getSelectedRegion();
                this.element.val(value.substr(0, range.start) + this.evtData.userInput + value.substr(range.end + this.evtData.userInput.length));

                // restore cursor position
                var curPosOffs = range.end + this.evtData.userInput.length;
                this._setSelectedRegion(curPosOffs, curPosOffs);

                // We reject user input hence we replaced it
                rVal = false;
            }

            this.originalUserInput = null;
            return rVal;
        }

        // Update preventKeyUp
        this.preventKeyUp = true;
        this.originalUserInput = null;

        // validation failed
        return false;
    },


    /**
     * Simulate user clicked delete key
     * @returns string value of element after backspace was pressed
     */
    _simulateDelete: function() {
        // Simulate delete...
        var range = this._getSelectedRegion();

        //
        this.evtData.value = this.element.val();

        // Update event data
        this.evtData.isDelete = true;

        // Cursor dead right
        if (range.start === this.evtData.value.length && range.start === range.end) return this.evtData.value;

        // Delete character on the right of the cursor
        if (range.start === range.end) {
            // Update originalValue
            this.originalValue = this.evtData.value.substr(0, range.start) + this.evtData.value.substr(range.end + 1);
            this.evtData.value = this.originalValue;
            return this.originalValue;
        }

        // Update originalValue
        this.originalValue = this.evtData.value.substr(0, range.start) + this.evtData.value.substr(range.end);
        this.evtData.value = this.originalValue;

        // Remove selected text
        return this.originalValue;
    },


    /**
     * Simulate user clicked backspace key
     * @returns string value of element after backspace was pressed
     */
    _simulateBackspace: function() {
        // Simulate backspace
        var range = this._getSelectedRegion();

        //
        this.evtData.value = this.element.val()

        // Update event data
        this.evtData.isDelete = true;

        // cursor dead left
        if (range.end <= 0 && range.start == range.end) return this.evtData.value;

        // Delete character on the left of the cursor
        if (range.start === range.end) {
            this.originalValue = this.evtData.value.substr(0, range.start -1) + this.evtData.value.substr(range.end);
            this.evtData.value = this.originalValue;
            return this.originalValue;
        }

        // Update originalValue
        this.originalValue = this.evtData.value.substr(0, range.start) + this.evtData.value.substr(range.end);
        this.evtData.value = this.originalValue;

        // Remove selected text
        return this.originalValue;
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

        // Update evtData.userInput and evtData.value and local originalUserInput
        this.originalUserInput = subject;
        this.evtData.userInput = subject;
        this.evtData.value = value.substr(0, range.start) + subject + value.substr(range.end);
        this.originalValue = this.evtData.value;

        if (this.evtData.value.length - 1 == range.end) {
            this.evtData.isAppend = true;
        } else {
            this.evtData.isEdit = true;
        }

        return this.evtData.value;
    },


    /**
     * Get the currently selected text on the control
     */
    _getSelectedRegion: function() {
        if (document.selection != undefined) {
            // IE... MS reinventing the standards... ffs
            var rng = this.element[0].createTextRange();
            rng.setEndPoint("EndToStart", document.selection.createRange());
            return {
                start: rng.text.length,
                end: rng.text.length + document.selection.createRange().text.length
            };
        } else if (this.element[0].selectionStart != undefined) {
            // Chrome, FFox, Safari, etc...
            return {start: this.element[0].selectionStart, end: this.element[0].selectionEnd};
        }
    },


    /**
     * Select a specified region in the textbox
     * FYI: setting start == end will move the cursor there
     */
    _setSelectedRegion: function(start, end) {
        if (this.element[0].setSelectionRange) {
            this.element[0].setSelectionRange(start, end);
        } else if (this.element[0].createTextRange) {
            var range = this.element[0].createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    }
});
});
