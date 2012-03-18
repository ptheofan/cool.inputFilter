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
    <ul>
        <li class="title">Simple case</li>
        <li>This textbox uses basic filtering via a provided regex</li>
        <li><input type="text" id="case1"/></li>
        <li>&nbsp;</li>
        <li class="title">The beginning of a mask input</li>
        <li>This textbox allows values between 0.20 and 100.50.</li>
        <li>If you enter any value outside the range it will automatically set it to the range</li>
        <li>This could be the base for a masked edit control</li>
        <li><input type="text" id="case2"/></li>
    </ul>
<script type="text/javascript">
$(function(){
    // Simple
    $('#case1').inputFilter({regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/});
    
    // Impose boundaries
    $('#case2').inputFilter({
        regex: /^\d*$|^\d*(\.|\,)\d{0,2}$/,
        afterValidate: function(evt, obj) {
            var value = parseFloat(obj.value.replace(',', '.'));
            
            // We reach this point only after regex validation. If not numeric
            // then it's either empty string or ,|. so it's valid and we don't care
            // to check for boundaries (obviously). Thus, accept user keystroke.
            if (isNaN(value)) return true;
            if (value < 0.20) {
                // Set the value where we want it
                obj.element.val('0.20');
                
                // Prevent user keystroke
                return false;
            }
            if (value > 100.50) {
                // Set the value where we want it
                obj.element.val('100.50');
                
                // Prevent user keystroke
                return false;
            }
        }
    });
});
</script>
</body>
</html>