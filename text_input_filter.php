<html>
<head>
	<link type="text/css" href="css/smoothness/jquery-ui-1.8.17.custom.css" rel="stylesheet" />	
	<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.8.17.custom.min.js"></script>
	<script type="text/javascript" src="jquery.cool.inputFilter.js"></script>
</head>
<body>
    <style type="text/css">
        /*
         *   Some basic CSS to make things less ugly
         */
        html, body {font-family: 'Monaco', 'Calibri', 'Arial'; font-size: 12px;}
        li.title {font-weight: bold; text-decoration: underline;}
        ul, li { list-style-type: none; padding: 0;}
        input[type=text] {
            outline: none;
            padding: 4px; border: 1px solid #0099ff;
            -webkit-border-radius: 4px;
            -moz-border-radius: 4px;
            border-radius: 4px;
        }
        
        input[type=text]:hover, input[type=text]:active, input[type=text]:focus { border-color: #003399; }
    </style>
	<h1>TextInput</h1>

	<section>
	    Text input control<br/>
	    <strong>Rules</strong>
	    <ul>
	        <li>This is an ordinary HTML5 <code>input[type=text]</code></li>
	    </ul>
	    <input type="text" value="" placeholder="HTML5 placeholder"/>
	</section>


	<section>
	    Text input control using the basic functionality of <code>jquery.cool.inputFilter</code><br/>
	    <strong>Rules</strong>
	    <ul>
	        <li>Accepts float number (only digits)</li>
	        <li>Float number can have up to 2 decimal digits</li>
	    </ul>
	    <input id="input1" type="text" value="" placeholder="Type a float {4.2}"/>
	    <div class="sourceCode">
	        Source Code
	        <pre class="brush:js">
	            $('#input1').inputFilter({regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/});
	        </pre>
	    </div>
	</section>


	<section>
	    Text input control using the <code>jquery.cool.inputFilter.afterValidate</code> event<br/>
	    <strong>Rules</strong>
	    <ul>
	        <li>Accepts float number (only digits)</li>
	        <li>Float number can have up to 2 decimal digits</li>
	        <li>Decimal point separator must be '.'</li>
	        <li>User is allowed to type ',' which will be automatically converted to '.'</li>
	        <li>Value cannot be less than 10</li>
	        <li>Value cannot be more than 10000</li>
	        <li>Value can be empty</li>
	        <li> -- evt: KeyUp will fire only when input was actually modified</li>
	        <li> -- Highlighted when <span id="keyUpFired"><strong>KeyUp has fired</strong></span></li>
	    </ul>
	    <input id="input2" type="text" value="" class="span-10 noFloat" placeholder="Type a float (10 < float < 1000)"/>
	    <div class="sourceCode">
	        Source Code
	        <pre class="brush:js">
	            $('#input2').inputFilter({
	                regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/,

	                /**
	                 * BeforeValidate is an ideal place to do any character mapping
	                 */
	                beforeValidate: function(evt, data) {
	                    // No fancy input mapping. Simply convert any , to .
	                    if (data.userInput && data.userInput.indexOf(',') != -1) {
	                        data.widget.evtData.userInput = data.userInput.replace(',', '.');
	                    }

	                    return true;
	                },
	                /**
	                 * AfterValidate is where our boundaries 'n cool input constraining takes place
	                 */
	                afterValidate: function(evt, data) {
	                    // If validation failed do nothing ;)
	                    if (!data.isValid) return true;

	                    // Max = 10000
	                    if (data.value > 10000) {
	                        data.widget.evtData.value = 10000;

	                        // Reject user keystroke -- any return will do though ;)
	                        return false;
	                    }

	                    // From this point onward, we may cancel the keystroke BUT
	                    // we want the keyup event to run
	                    data.widget.evtData.preventKeyUp = false;

	                    // Min = 10  --  if value < 10 then EMPTY the input
	                    if (data.value.length < 2 && data.isDelete === true) {
	                        data.widget.evtData.value = '';

	                        // Reject user keystroke
	                        return false;
	                    }

	                    // Min = 10
	                    if (data.value < 10) {
	                        data.widget.evtData.value = 10;

	                        // Reject user keystroke
	                        return false;
	                    }

	                    return 100;
	                },

	                /**
	                 * If I wanted to update any element here's where I would do it
	                 */
	                keyup: function(evt, data) {
	                    $('span#keyUpFired').effect('highlight', {}, 300);
	                }
	            })
	        </pre>
	    </div>
	</section>
<script type="text/javascript">
$(function(){
    $('#input1').inputFilter({regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/});
    $('#input2').inputFilter({
        regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/,

        /**
            * BeforeValidate is an ideal place to do any character mapping
            */
        beforeValidate: function(evt, data) {
            // No fancy input mapping. Simply convert any , to .
            if (data.userInput && data.userInput.indexOf(',') != -1) {
                data.widget.evtData.userInput = data.userInput.replace(',', '.');
            }

            return true;
        },
        /**
            * AfterValidate is where our boundaries 'n cool input constraining takes place
            */
        afterValidate: function(evt, data) {
            // If validation failed do nothing ;)
            if (!data.isValid) return true;

            // Max = 10000
            if (data.value > 10000) {
                data.widget.evtData.value = 10000;

                // Reject user keystroke -- any return will do though ;)
                return false;
            }

            // From this point onward, we may cancel the keystroke BUT
            // we want the keyup event to run
            data.widget.evtData.preventKeyUp = false;

            // Min = 10  --  if value < 10 then EMPTY the input
            if (data.value.length < 2 && data.isDelete === true) {
                data.widget.evtData.value = '';

                // Reject user keystroke
                return false;
            }

            // Min = 10
            if (data.value < 10) {
                data.widget.evtData.value = 10;

                // Reject user keystroke
                return false;
            }

            return 100;
        },

        /**
            * If I wanted to update any element here's where I would do it
            */
        keyup: function(evt, data) {
            $('span#keyUpFired').effect('highlight', {}, 300);
        }
    })
});
</script>
</body>
</html>