(function(multistepify, dynamicTCPA, isUmbracoForm, includePreviousButton, tcpaToken) {
    var prev = 'Previous';
    var next = 'Next';
    var invalidClass = 'mktoInvalid';
    var requiredClass = 'mktoRequired';
    var phoneId = 'Phone';
    var multistepify = multistepify;
    var dynamicTCPA = dynamicTCPA;
    var isUmbracoForm = isUmbracoForm;
    var includePreviousButton = includePreviousButton;
    var updateProgressBarVar = updateProgressBar;
    var tcpaToken = tcpaToken;

    try {
        if (multistepify) {
            //begin multistep logic
            MktoForms2.whenReady(multistepifyMarketoForm);     
        } else {
            //primary site css documents have mkto forms hidden by default as they are hidden from view on the primary sites
            //we need to show them once loaded
            MktoForms2.whenReady(function() {
                //get all mktoForms each time a mkto form is ready
                var forms = document.querySelectorAll('.mktoForm');
                for (var i = 0; i < forms.length; i++) {
                    var form = forms[i];
                    //display the form
                    form.style.display = 'block';
                }
            });      
        }

        //at times for reasons unknown, mkto when injecting identical forms in different places on a document will duplicate the form
        //and other forms at the bottom of the document are created... this function seeks to remove these duplicate forms
        ready(removeDuplicateForms);    
    
    } catch (e) {
        console.log('marketo_multistep.js err: ' + e);
    }

    function updateSelects() {
        var selects = document.querySelectorAll('.mktoForm select');
        for (var i = 0; i < selects.length; i++) {
            var select = selects[i];
            //it is necessary to requery the selects as new ones may now exist
            for (var y = 0; y < document.querySelectorAll('.mktoForm select').length; y++) {
                var element = selects[y];
                element.style.width = '100%';
            }
        }
    }

    function updateRadioLabels() {
        for (var index = 0; index < document.querySelectorAll('.mktoRadioList').length; index++) {
            var radioParent = document.querySelectorAll('.mktoRadioList')[index].parentNode;
            radioParent.querySelectorAll('label.mktoLabel')[0].style.display = 'block';
            radioParent.style.marginTop = '10px'
        }
    }

    function multistepifyMarketoForm() {
        if (isUmbracoForm) {
            //this switches the progress bar function as the primary sites have a completely distinct style from that of the umbraco sites
            updateProgressBarVar = updateProgressBarBat;
            //because mkto injects child filtered select options and custom style tags, it is necessary to remove the added style tags on the newly injected html elements
            //this will not work if filters are setup with grandchild+ filtering from mkto forms
            var selects = document.querySelectorAll('.mktoForm select');
            for (var i = 0; i < selects.length; i++) {
                selects[i].addEventListener("change", updateSelects);
                //TODO: determine a means to add the css puedo after and before to mkto injected elements for the arrow
            }                
        }

        //get all marketo forms
        var allMarketoForms = document.querySelectorAll('form.mktoForm:not(.multistepified)');
        //loop through each marketo form
        for (var index = 0; index < allMarketoForms.length; index++) {
            //set class to identify that this form has undergone this process
            addClass(allMarketoForms[index], 'multistepified');
            var fieldset = allMarketoForms[index].querySelectorAll('fieldset');
            //loop through each fieldset
            for (var y = 0; y < fieldset.length; y++) {
                //hide fieldset border
                fieldset[y].style.borderWidth = '0px';
                //create nav button div container
                var divBtnElement = document.createElement('div');
                    divBtnElement.classList.add('mktoButtonRow');
                    divBtnElement.style.width = '100%';
                    divBtnElement.style.marginTop = '20px';
                    divBtnElement.style.textAlign = 'center';
                //create span container for btn
                var spanBtnElement = document.createElement('span');
                    spanBtnElement.classList.add(['mktoButtonWrap', 'mktoNative']);
                //add span to btn div container
                divBtnElement.appendChild(spanBtnElement);
                //add div btn container to fieldset
                fieldset[y].appendChild(divBtnElement);
                //hide if not initial fieldset, indicate a step != to the first
                if (y !== 0) {
                    fieldset[y].style.display = 'none';
                }
                var buttons = [];
                //add previous button to all but first fieldset if mkto token includePreviousButton is true
                if (y !== 0 && includePreviousButton) {
                    buttons.push(prev);              
                }
                //add next button to all but last fieldset
                if (y !== fieldset.length - 1) {
                    buttons.push(next);
                }
                //create buttons, append to btn container, add event listeners to btns
                for (var a = 0; a < buttons.length; a++) {
                    var button = buttons[a];
                    var Btn = createPreviousNextButton(index, y, button);
                    spanBtnElement.appendChild(Btn);
                    //add event listener to move to and from steps
                    Btn.addEventListener('click', previousNextButtonMarketoClickListener);                 
                }
                //if last fieldset
                if (y === fieldset.length - 1) {
                    //move submit button to the last fieldset, the last step
                    //does this form have a submit button
                    if (allMarketoForms[index].querySelectorAll('button[type="submit"]')[0]) {
                        //give this button an identification relating it to this form
                        allMarketoForms[index].querySelectorAll('button[type="submit"]')[0].dataset.form = index;
                        //clone it
                        var submitClone = allMarketoForms[index].querySelectorAll('button[type="submit"]')[0].cloneNode(true);
                        //removes or hides the old button
                        removeElement(allMarketoForms[index].querySelectorAll('button[type="submit"]')[0]);
                        //add clone to final fieldset
                        spanBtnElement.appendChild(submitClone);
                    }                
                }            
                //to assist in identifying the form/fieldset by adding unique identifiers via data attrs
                //we add relavent data attributes to the fieldset
                fieldset[y].dataset.form = index;
                fieldset[y].dataset.fieldset = y;
                //on initial loop iteration, create the progress bar
                if (y === 0) {
                    updateProgressBarVar(fieldset[y], y);
                }
            }
            if (isUmbracoForm) {
                //if mkto token isUmbracoForm, set styles unique to umbraco to the mkto form
                styleForm(allMarketoForms[index]);
            }    
            if (dynamicTCPA) {
                //if mkto token dynamicTCPA, create tcpa logic where tcpa is appended on phone focus
                addTCPA(allMarketoForms[index]);            
            }
        }
        //label inside alt is a modified copy of the original labelinside function that does exactly the same thing execpt for select html elements
        labelInsideAlt();
        //another call to the remove duplicate forms method
        removeDuplicateForms();
    }

    function ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }     
    }

    function removeDuplicateForms() {
        //bad forms appear to lack ids, remove or hide them
        var badMktoForms = document.querySelectorAll('form.mktoForm:not([id])');
        for (var index = 0; index < badMktoForms.length; index++) {
            removeElement(badMktoForms[index]);
        }
    }

    function removeElement(element) {
        //if for whatever reason the remocechild method fails or is unavailable
        //we can hide the element instead
        try { 
            element.parentNode.removeChild(element);
        } catch(e) {
            element.style.display = 'none';
        }
    }

    function createPreviousNextButton(formIndex, fieldsetIndex, type) {
        var element = document.createElement('button');
        //give the btn a unique id
        element.id = String(formIndex) + String(fieldsetIndex) + String(type);
        //setting the text content to match the type
        element.innerHTML = type;
        return element;
    }

    function previousNextButtonMarketoClickListener() {
        //on lp's there seems to be a listener on all buttons to submit a form
        //this prevents it from submitting on the prev/next buttons
        event.preventDefault();
        //TODO: refactor this... hate chaining parent calls
        var parentFieldset = this.parentNode.parentNode.parentNode;
        var lastFieldset = document.querySelectorAll('fieldset[data-form="'+ parentFieldset.dataset.form +'"]').length - 1;
        //hide submit button for this form only
        document.querySelectorAll('button[type="submit"][data-form="'+ parentFieldset.dataset.form +'"]')[0].style.display = 'none';
        //if previous, show previous
        if (this.id.indexOf(prev) > -1) {
            //hide current fieldset
            document.querySelectorAll('fieldset[data-form="' + parentFieldset.dataset.form + '"][data-fieldset="' + parentFieldset.dataset.fieldset + '"]')[0].style.display = 'none';
            //show previous fieldset
            document.querySelectorAll('fieldset[data-form="' + parentFieldset.dataset.form + '"][data-fieldset="' + (parseInt(parentFieldset.dataset.fieldset) -1) + '"]')[0].style.display = '';
            //update progressbar 
            updateProgressBarVar(parentFieldset, (parseInt(parentFieldset.dataset.fieldset) -1));        
        } 
        //if next, show next
        else if (this.id.indexOf(next) > -1) {
            //validate current step prior to moving forward a step
            if (validateFieldSet(parentFieldset,document.getElementsByName('formid')[parentFieldset.dataset.form].value)) {
                //hide current fieldset
                document.querySelectorAll('fieldset[data-form="' + parentFieldset.dataset.form + '"][data-fieldset="' + parentFieldset.dataset.fieldset + '"]')[0].style.display = 'none';
                //show next fieldset            
                document.querySelectorAll('fieldset[data-form="' + parentFieldset.dataset.form + '"][data-fieldset="' + (parseInt(parentFieldset.dataset.fieldset) +1) + '"]')[0].style.display = '';
                //update progressbar 
                updateProgressBarVar(parentFieldset, (parseInt(parentFieldset.dataset.fieldset) +1));
                if ((parseInt(parentFieldset.dataset.fieldset) +1) == lastFieldset) {
                    //is last fieldset in form, show submit button
                    document.querySelectorAll('button[type="submit"][data-form="'+ parentFieldset.dataset.form +'"]')[0].style.display = '';
                }

            }
        } 
        else {
            //this shouln't happen, but available for aditional buttons if ever needed
        }
        updateRadioLabels();
    }

    //mkto has a form validate method, but it is not deisgned for individual steps
    //so this method allows us to set custom messages for different validation scenarios
    function validateFieldSet(fieldset, mktoFormId) {
        //mkto will add the class mktoValid if a field is valid
        //mktoInvalid if not valid
        var isValid = true;
        var allChildElements = fieldset.getElementsByTagName("*");
        for (var index = 0; index < allChildElements.length; index++) {
            var element = allChildElements[index];
            //checkif mktoRequired have values
            if (element && element.classList && element.classList.contains(requiredClass) && !element.value) {
                MktoForms2.getForm(mktoFormId).showErrorMessage('This field is required.',$(element));
                isValid = false;
            } else if (element && element.classList && element.classList.contains(invalidClass)) {
                //does element have invalid class, aka generic error response
                MktoForms2.getForm(mktoFormId).showErrorMessage('This field is invalid.',$(element));
                isValid = false;
            }
        }
        return isValid;
    }

    //TODO: WIP to identify parent elements
    function findAncestorBy(ele, matchType, matchValue) {
        var ele; //your clicked element
        while(ele.parentNode) {
            //display, log or do what you want with element
            ele = element.parentNode;
        }
    }

    //because we are attempting a 1 to 1 comparison with umbraco
    //we need to match the styling rulesets of the previous
    //umbraco form styles
    function styleForm(form) {
        //remove forms2.css
        //document.getElementById("mktoForms2BaseStyle").remove();
        if (document.getElementById("mktoForms2ThemeStyle")) {
            try {
                document.getElementById("mktoForms2ThemeStyle").remove();
            } catch(e) {
                //if remove fails due to browser support complications, just disable it
                document.getElementById("mktoForms2ThemeStyle").disabled = true;
            }
        }
        //remove mkto width settings, and add umbraco style classes
        form.style.width = '100%';
        addClass(form, 'leadsystem');
        addClass(form, 'labelsInside');
        addClass(form, 'multistep');
        //set tyles for each fieldset in form
        for (var index = 0; index < form.querySelectorAll('fieldset').length; index++) {
            var fieldset = form.querySelectorAll('fieldset')[index];
            fieldset.style.textAlign = 'right';
            fieldset.style.width = '100%';
        }
        //select parent div umbraco classes: program selectfield field hideLabel
        for (var index = 0; index < form.querySelectorAll('select').length; index++) {
            var select = form.querySelectorAll('select')[index];
            var div = document.createElement("div");
            var parent = select.parentNode;
            parent.style.width = '100%';
            addClass(div,'selectfield');
            addClass(div,'field');
            parent.insertBefore(div, select);
            addClass(div.parentNode,'hideLabel');
            div.appendChild(select);
            select.style.width = '100%';
        }    
        //input parent div text umbraco classes: textfield field blurInput
        for (var index = 0; index < form.querySelectorAll('input').length; index++) {
            var input = form.querySelectorAll('input')[index];
            addClass(input,'textfield');
            addClass(input,'field');
            //addClass(input,'blurInput');
            input.style.padding = '.5em';
            input.style.width = '100%';
        }        
        updateRadioLabels();
        //TODO: next btn class: nextbutton
        //next btn has title set to value
        //TODO: previous btn prevbutton
        //previous btn has title set to value
    }

    // http://jaketrent.com/post/addremove-classes-raw-javascript/
    function hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }
        else {
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        }
        else if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }

    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        }
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className=el.className.replace(reg, ' ');
        }
    }

    function toggleClass(element, className){
        if (!element || !className){
            return;
        }

        var classString = element.className, nameIndex = classString.indexOf(className);
        if (nameIndex == -1) {
            classString += ' ' + className;
        }
        else {
            classString = classString.substr(0, nameIndex) + classString.substr(nameIndex+className.length);
        }
        element.className = classString;
    }    

    function labelInsideAlt() {
        labelsInside = function() {
            var $form = document.querySelectorAll('.mktoForm');
            var $textInputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], textarea', $form);
            var $selects = document.querySelectorAll('select', $form);
            var activeEl;
            var toggleLabel = function(elem) {
                var $parent = elem.parentNode;
                    addClass($parent,"hideLabel");
                    removeClass($parent, "blurInput");
                try {
                    activeEl = document.activeElement;
                } catch(err) {
                    activeEl = null;
                }
                if (!(elem.value.trim()) && elem != activeEl) {
                    addClass($parent, "blurInput");
                    removeClass($parent, "hideLabel");
                }
            };
            var toggleAllLabels = function() {
                for (var index = 0; index < $textInputs.length; index++) {
                    var input = $textInputs[index];
                    toggleLabel(input);
                }
            };
            for (var i = 0; i < $form.length; i++) {
                var form = $form[i];
                addClass(form, "labelsInside");                    
            }
            for (var index = 0; index < $selects.length; index++) {
                var select = $selects[index];
                select.value = select.childNodes[0]
                var selectParent = select.parentNode;
                var selectLabelText = selectParent.parentNode.querySelectorAll('label')[0].innerText.replace('*','')
                var selectInitialOption = select.querySelectorAll('option')[0];
                var selectInitialOptionValue = selectInitialOption.value;
                var selectInitialOptionText = selectInitialOption.text;
                addClass(selectParent, "hideLabel");
                selectParent.parentNode.querySelectorAll('label')[0].style.display = 'none';
                if (selectInitialOptionValue != "-1" && selectInitialOptionValue != "") {
                    if (selectInitialOptionText.indexOf(selectInitialOptionText) == 0) {
                        selectLabelText = selectInitialOptionText;
                    } else {
                        selectLabelText += " " + selectInitialOptionText;
                        addClass(select, "selectSelected");
                    }
                }
                toggleClass(selectInitialOption,"optionLabel");
                selectInitialOption.setAttribute("selected","selected");
                selectInitialOption.setAttribute("label",selectLabelText)
                selectInitialOption.innerHTML = selectLabelText;
                selectInitialOption.addEventListener("change", function() {
                    toggleClass(this, "selectSelected");
                });
            }
            for (var index = 0; index < $textInputs.length; index++) {
                var input = $textInputs[index];
                toggleLabel(input);
                input.addEventListener("keypress", toggleAllLabels);
                input.addEventListener("blur", toggleAllLabels);
                input.addEventListener("change", toggleAllLabels);
                input.addEventListener("input", toggleAllLabels);
            }            
            var x = document.querySelectorAll("form.labelsInside div:not(.blurInput) div:not(.hideLabel)");
            for (var i = 0; i < x.length; i++) {
                var z = x[i].childNodes;
                for (var y = 0; y < z.length; y++) {
                    var child = z[y];
                    if (child.querySelectorAll !== undefined) {
                        var labeles = child.querySelectorAll('label');
                        for (var p = 0; p < labeles.length; p++) {
                            var element = labeles[p];
                            element.style.display = '';
                        }
                    }
                }
            }
        };
        ready(labelsInside);
    }

    function addTCPA(form) {
        if (form) { 
            var tcpa = tcpaToken;
            var phoneElement = form.querySelectorAll('#' + phoneId)[0];
            if (phoneElement) {
            phoneElement.addEventListener("focus", function () {
                if (!form.querySelectorAll('#tcpanotice')[0]) {
                    var tcpaNotice = document.createElement('div');
                    tcpaNotice.setAttribute("id", "tcpanotice");
                    tcpaNotice.innerHTML = tcpa;
                    phoneElement.parentNode.appendChild(tcpaNotice);
                }
            });
            }
        }
    }

    function updateProgressBar(fieldstep, step) {
        step++;
        updateProgressBarWork(fieldstep, step);
    }

    function updateProgressBarWork(fieldstep, step) {
        var currentForm = document.querySelectorAll('form.mktoForm')[fieldstep.dataset.form];
        //identify current fieldstep for current form
        var maxSteps = currentForm.querySelectorAll('fieldset').length;
        //upsert progress bar
        if (!currentForm.querySelectorAll('.progress').length) {
            var progressParent = document.createElement("div");
            progressParent.className = "progress";
            var progresBar = document.createElement("div");
            progresBar.className = "progress-bar";
            progresBar.setAttribute("role", "progressbar");
            progresBar.setAttribute("aria-valuenow", step);
            progresBar.setAttribute("aria-valuemin", step);
            progresBar.setAttribute("aria-valuemax", maxSteps);
            progresBar.style.textAlign = "center !important";
            progresBar.style.width = ((step / maxSteps) * 100) + "%";
            progresBar.textContent = "Step " + step + " of " + maxSteps;        
            progressParent.appendChild(progresBar);
            currentForm.insertBefore(progressParent, currentForm.childNodes[0]);
        } else {
            var bar = currentForm.querySelectorAll(".progress-bar")[0];
            bar.setAttribute("aria-valuenow", step);
            bar.style.width = ((step / maxSteps) * 100) + "%";
            bar.textContent = "Step " + step + " of " + maxSteps;
        }
    }

    //used if mkto token isUmbracoForm is true
    //creates a span in the mkto form that mimics the progressbad on the umbraco forms
    function updateProgressBarBat(fieldstep, step) {
        step++;
        var currentForm = document.querySelectorAll('form.mktoForm')[fieldstep.dataset.form];
        var maxSteps = currentForm.querySelectorAll('fieldset').length;
        //create prog bar if it does not exist
        if (!currentForm.querySelectorAll('.steps-indicator').length) { 
            //indicator div
            var stepIndicator = document.createElement("div");
                stepIndicator.className = "steps-indicator";
            //step text
            var stepIndicatorText = document.createElement("div");
                stepIndicatorText.className = "stepIndicatorText";
                stepIndicatorText.textContent = "Step " + step + " of " + maxSteps;
            //div to hold the bar
            var progress = document.createElement("div");
                progress.className = "progress";
            //actual progress bar and fill logic
            var bar = document.createElement("div");
                bar.className = "bar";
                bar.style.width = ((step / maxSteps) * 100) + "%";
            //required note
            var indicatedFieldNote = document.createElement('div');
                indicatedFieldNote.className = "required-note";
                indicatedFieldNote.innerHTML = '<span style="color: red;">*</span> Indicates required field.';
            //compile html tree
            stepIndicator.appendChild(indicatedFieldNote);
            stepIndicator.appendChild(stepIndicatorText);
            stepIndicator.appendChild(progress);
            progress.appendChild(bar);
            //add to form
            currentForm.insertBefore(stepIndicator, currentForm.childNodes[0]);
        } else {
            //if exists, update step indicator
            var pbar = currentForm.querySelectorAll(".bar")[0];
            pbar.style.width = ((step / maxSteps) * 100) + "%";
            currentForm.querySelectorAll('.stepIndicatorText')[0].textContent = "Step " + step + " of " + maxSteps;
        }
    }
})(mktoTokens.multistepify, mktoTokens.dynamicTCPA, mktoTokens.isUmbracoForm, mktoTokens.includePreviousButton, mktoTokens.tcpaToken);