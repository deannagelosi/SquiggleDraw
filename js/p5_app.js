// UI vars
let lengthSlider, flourishSlider;
let lengthValue, flourishValue;
let lengthInput, flourishInput;
let lengthLabel, flourishLabel;

// squiggle vars
let maxTurn;
let scale;
let bigThreshold;
let minSteps, maxSteps;
let minDistance, maxDistance;
let minLength, maxLength;
let centerX, centerY;
let buffer;
let reloadAmount;
let seed;
let showField;
let squigglePoints;
let offScreenRenderer;
let svgData;

function setup() {
    // UI setup
    const canvas = createCanvas(windowWidth, windowHeight - 100); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');
    // Create an off-screen renderer for the SVG output
    offScreenRenderer = createGraphics(width, height, SVG);

    createFooter();

    // squiggle setup
    centerX = width / 2;
    centerY = height / 2;

    reloadAmount = 3;
    minSteps = 20; // steps are number of points
    maxSteps = 80;
    minDistance = 20; // distance between points
    maxDistance = 100;
    minLength = 1500;
    maxLength = 3000;
    buffer = 35; // boarder margin in pixels
    scale = 100.0; // zoom level on Perlin noise field
    maxTurn = QUARTER_PI + PI / 8; // Max turn speed (QUARTER_PI = circles, HALF_PI = squares, PI = starbursts)
    bigThreshold = 0.80; // Higher percent, more loops
    seed = 1; // increment on each attempt
    showField = false;
}

function draw() {
    // background(220);

    squigglePoints = generateSquigglePoints();
    drawSquiggle(squigglePoints, this);
    drawSquiggle(squigglePoints, offScreenRenderer);
      // Get the SVG data as a string
    svgData = offScreenRenderer.elt.svg.outerHTML;
    console.log(svgData);

    noLoop();
}

// UI functions
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

    // translate slider value to maxTurn and redraw
    let piMod = remap(flourishValue, 0, 100, 0.25, 0.875)
    maxTurn = (piMod * PI) + (PI / 8);

    seed = 1;
    loop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// squiggle functions
function generateSquigglePoints() {
    let pointsArray = [];

    let goodArt = false;

    while (!goodArt) {
        noiseSeed(seed);
        pointsArray = [];

        let px = centerX;
        let py = centerY;
        let angle = HALF_PI;

        let squiggleLength = 0;
        let numBigTurns = 0;
        let numSmallTurns = 0;

        for (let i = 0; i < maxSteps; i++) {
            let pNoise = noise(px / scale, py / scale);
            let deltaAngle = map(pNoise, 0, 1, -TWO_PI, TWO_PI);
            let distance = map(pNoise, 0, 1, minDistance, maxDistance);

            if (abs(deltaAngle) > maxTurn) {
                angle += maxTurn;
                numBigTurns++;
            } else {
                angle += deltaAngle;
                numSmallTurns++;
            }

            px += distance * cos(angle);
            py += distance * sin(angle);

            for (let k = 0; k < 50; k++) {
                if (checkBounds(px, py)) {
                    break;
                } else {
                    let newNoise = noise((px + (k * 10)) / scale, py / scale);
                    let nudgeAngle = map(newNoise, 0, 1, PI / 32, PI);
                    angle = -1 * angle + nudgeAngle;

                    px += distance * cos(angle);
                    py += distance * sin(angle);
                }
            }

            if (checkBounds(px, py)) {
                pointsArray.push(new Point(px, py));
                squiggleLength += distance;
            } else {
                break;
            }
        }

        let percentBig = numBigTurns / (numBigTurns + numSmallTurns);
        if (percentBig > bigThreshold || squiggleLength < minLength || squiggleLength > maxLength) {
            goodArt = false;
            seed++;
        } else {
            goodArt = true;
        }
    }

    return pointsArray;
}

function checkBounds(px, py) {
    return !(px >= width - buffer || px <= buffer || py >= height - buffer || py <= buffer);
}

function drawSquiggle(points, renderer) {
    renderer.background(255);

    if (showField) {
        showPerlinField();
    }

    renderer.noFill();
    renderer.stroke(0, 0, 0);
    renderer.strokeWeight(2);

    renderer.beginShape();
    renderer.curveVertex(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
        renderer.curveVertex(points[i].x, points[i].y);
    }
    renderer.endShape();
}

function showPerlinField() {
    noStroke();

    for (let y = 0; y < height; y += 5) {
        for (let x = 0; x < width; x += 5) {
            let nShading = noise(x / scale, y / scale);
            let shading = map(nShading, 0, 1, 75, 255);
            fill(shading);
            rect(x, y, 5, 5);
        }
    }
}

function keyPressed() {
    if (key === 's') {
        let filename = "generated/squiggle-seed" + seed + ".svg";
        // Save the canvas as an SVG file
        saveCanvas(filename, 'svg');
    } else if (key === 'f') {
        showField = !showField;
        loop();
    }
}

function touchStarted() {
    // check if the touch happened inside the canvas area
    if (touches.length > 0 && touches[0].y < height) {
        seed++;
        loop();
    }
}

function remap(value, oldMin, oldMax, newMin, newMax) {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

