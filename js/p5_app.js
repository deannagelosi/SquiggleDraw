let lengthSlider, flourishSlider;
let lengthValue, flourishValue;
let lengthInput, flourishInput;
let lengthLabel, flourishLabel;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight - 100); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');

    createFooter();
}

function createFooter() {
    lengthSlider = createSlider(0, 100, 50);
    flourishSlider = createSlider(0, 100, 50);

    // Create labels and input boxes for sliders
    lengthLabel = createLabel('Length');
    flourishLabel = createLabel('Flourish');
    lengthInput = createInputBox(lengthSlider);
    flourishInput = createInputBox(flourishSlider);

    lengthSlider.input(updateLengthValue);
    flourishSlider.input(updateFlourishValue);

    const footer = select('#footer');
    const lengthSliderContainer = createElement('div').addClass('slider-container');
    const flourishSliderContainer = createElement('div').addClass('slider-container');

    lengthSliderContainer.child(lengthLabel);
    lengthSliderContainer.child(lengthSlider);
    lengthSliderContainer.child(lengthInput);
    flourishSliderContainer.child(flourishLabel);
    flourishSliderContainer.child(flourishSlider);
    flourishSliderContainer.child(flourishInput);
    footer.child(lengthSliderContainer);
    footer.child(flourishSliderContainer);
}

function createLabel(name) {
    const label = createElement('span', name);
    label.style('margin-right', '10px');
    return label;
}

function createInputBox(slider) {
    const inputBox = createInput(slider.value().toString() + '%');
    inputBox.style('margin-left', '10px');
    inputBox.style('width', '60px');
    inputBox.input(() => {
        slider.value(parseInt(inputBox.value()));
    });
    return inputBox;
}

function updateLengthValue() {
    lengthValue = lengthSlider.value();
    lengthInput.value(lengthValue + '%');
}

function updateFlourishValue() {
    flourishValue = flourishSlider.value();
    flourishInput.value(flourishValue + '%');
}

function draw() {
    background(200);
    // Add your drawing code here
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
