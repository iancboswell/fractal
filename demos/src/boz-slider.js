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

    // If the step is less than one, figure out how many decimal places to round
    // it to when displaying it in the label, since floating-point math can
    // create strange numbers.
    if (this.step < 1) {
        // Convert step to string
        var decimalCount = "" + this.step
        // Discount the "0." before the number
        this.decimalCount = decimalCount.length - 2
    }

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
    this.inputElement.value = this.value - this.min
    this.inputElement.onchange = this.onRangeInputChange.bind(this)
    this.containerDiv.appendChild(this.inputElement)

    // If there is a label, create and append.
    if (this.labelText) {
        this.labelElement = document.createElement("label")
        this.containerDiv.appendChild(this.labelElement)
        this.updateLabel(this.value)
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

    if (this.step < 1) {
        // Round to the correct number of decimal places
        value = value.toFixed(this.decimalCount)
    }

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
    return +this.inputElement.value + this.min
}

/**
 * Set the slider's value and update the label,
 */
BozSlider.prototype.setValue = function(value) {
    if (value < this.min || value > this.max)
        return

    this.inputElement.value = value - this.min
    this.updateLabel(value)
}

module.exports = BozSlider