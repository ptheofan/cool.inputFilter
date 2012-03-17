<html>
<head>
	<link type="text/css" href="css/smoothness/jquery-ui-1.8.17.custom.css" rel="stylesheet" />	
	<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.8.17.custom.min.js"></script>
</head>
<body>
	<input type="text" id="t"/>
    
<script type="text/javascript">
$(function(){

    /**
     * Regexes
     * UNSIGNED float with 2 decimal points max
     * ^\d*$|^\d*(\.|\,)\d{0,2}$
     * 
     * Example
     * $('#myTextbox').inputFilter({regex: new RegExp('^\\d*$|^\\d*(\\.|\\,)\\d{0,2}$')});
     */
    $.widget('cool.inputFilter', {
        options: {
            // RegExp object to use for validation. If not suitable you can use the
            // validate event and validate any way you see fit
            regex: null
        },


        /**
         *
         */
        _init: function() {
            var me = this;

            this.element.on('keydown', {me: me}, this._keyDown);
            this.element.on('keypress', {me: me}, this._keyPress);
            this.element.on('paste', {me: me}, this._paste);
        },


        /**
         * destructor
         */
        destroy: function() {
            // Unbind the events
            this.element.off('keydown', this._keyDown);
            this.element.off('keydown', this._keyPress);
            
            
            // Call parent
            $.cool.inputFilter.prototype.destroy.call(this);
        },
        
        
        /**
         * KeyDown event handler
         */
        _keyDown: function(evt) {
            // Get keycode
            var key = evt.charCode || evt.keyCode;
            var value = evt.data.me.element[0].value;

            if (key === 8) {
                // Simulate backspace
                value = evt.data.me._simulateBackspace();
            } else if (key === 46) {
                // Simulate delete
                value = evt.data.me._simulateDelete();
            }

            // Evaluate value
            return evt.data.me._validate(value);
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
            return evt.data.me._validate(evt.data.me._editValue(c));
        },
        
        
        /**
         * Paste event handler
         * FYI: If reading from cliboard fails then paste will be blocked
         */
        _paste: function(evt) {
            // Attempt to read from clipboard
            var value = evt.data.me._readClipboard(evt);
            
            // Validate result
            return value === null ? false : evt.data.me._validate(evt.data.me._editValue(value));
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

            if (this._trigger('beforeValidate', {element: this.element, value: value})) {
                if (this.options.regex !== null) {
                    if (this.options.regex.test(value)) {
                        return this._trigger('afterValidate', {element: this.element, value: value});
                    }
                } else {
                    if (this._trigger('validate', {element: this.element, value: value})) {
                        return this._trigger('afterValidate', {element: this.element, value: value});
                    }
                }
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
    
    $('#t').inputFilter({regex: new RegExp('^\\d*$|^\\d*(\\.|\\,)\\d{0,2}$')});
});
</script>
</body>
</html>