let slider1, slider2;
let value1, value2;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight - 100); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');

    createFooter();
}

function createFooter() {
    slider1 = createSlider(0, 100, 50);
    slider2 = createSlider(0, 100, 50);

    slider1.input(updateValue1);
    slider2.input(updateValue2);

    const footer = select('#footer');
    const sliderContainer1 = createElement('div').addClass('slider-container');
    const sliderContainer2 = createElement('div').addClass('slider-container');

    sliderContainer1.child(slider1);
    sliderContainer2.child(slider2);
    footer.child(sliderContainer1);
    footer.child(sliderContainer2);
}

function updateValue1() {
    value1 = slider1.value();
    // console.log(value1)
}

function updateValue2() {
    value2 = slider2.value();
    // console.log(value2)
}

function draw() {
    background(200);
    // Add your drawing code here
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}



