/**
 * BozSlider
 *
 * This is just a simple wrapper around the standard HTML5 Slider that
 * implements a minimum value and a label. 
 */

var BozSlider = function(params) {
    // The element to which this slider will be appended.
    this.parentElement = params.parentElement ? params.parentElement : null
    // Minimum value.
    this.min = params.min ? params.min : 0
    // Maximum value.
    this.max = params.max ? params.max : 1
    // Step.
    this.step = params.step ? params.step : 1
    // Initial value.
    this.value = params.value ? params.value : 0
    // Label to prepend value with on display. If null, no label will be shown.
    this.labelText = params.label ? params.label : null

    // User-facing onchange handler. This will be called with a value
    // adjusted 
    this.userOnChange = params.onchange ? params.onchange : function() {}

    // Create the div that will contain both input and label.
    this.containerDiv = document.createElement("div")
    this.containerDiv.className = "boz-slider"

    // Create a range input and append it to the container div.
    this.inputElement = document.createElement("input")
    this.inputElement.type = "range"
    this.inputElement.max = this.max - this.min
    this.inputElement.step = this.step
    this.inputElement.value = this.value
    this.inputElement.onchange = this.onRangeInputChange.bind(this)
    this.containerDiv.appendChild(this.inputElement)

    // If there is a label, create and append.
    if (this.label) {
        this.labelElement = document.createElement("label")
        this.containerDiv.appendChild(this.labelElement)
    }

    // If a parent element was specified, append the container div to it.
    if (this.parentElement) {
        this.parentElement.appendChild(this.containerDiv)
    }
}

BozSlider.prototype.onRangeInputChange = function(e) {
    // Get the min-adjusted value
    var value = this.getValue()

    // If there is a label, update it
    this.updateLabel(value)

    // Call the user-facing onchange handler with the adjusted value
    this.userOnChange(value)
}

/**
 * Sync the current value with the label.
 */
BozSlider.prototype.updateLabel = function(value) {
    if (!this.labelText)
        return

    this.labelElement.innerHTML = this.labelText + ": " + value
}

/**
 * Return the container div
 */
BozSlider.prototype.getElement = function() {
    return this.containerDiv
}

/**
 * Return the min-adjusted value
 */
BozSlider.prototype.getValue = function() {
    return this.element.value + this.min
}

/**
 * Set the slider's value and update the label,
 */
BozSlider.prototype.setValue = function(value) {
    if (value < this.min || value > this.max)
        return

    this.element.value = value
    this.updateLabel(value)
}

module.exports = BozSlider