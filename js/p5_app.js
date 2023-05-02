// Squiggle Generator
// "Take a Dot for a Walk"
// source: converted from https://github.com/deannagelosi/squiggle_generator

// todo: 
// - show error message on ui if missing or incorrect invite key
// - show success or fail messages on ui for sent squiggles
// - dont let user type a value into the input box that exceed/is less than the slider range


// User Parameters
// length = pixel distance
let length = { min: 500, max: 3500, selected: null };
// Max turn speed: 0.25 = circles, 0.5 = squares, 0.875 = starbursts
let turnRadius = { min: 0.25, max: 0.875, selected: null };
// Range of distance between points
let pDistance = { min: [10, 50], max: [20, 200], selected: [null, null] };

// squiggle vars
let scale;
let bigThreshold;
let squiggleLength;
let centerX, centerY;
let buffer;
let seed;
let showField;
let squigglePoints;
let offScreenRenderer;
let svgData;
let author;
let title;

// circle UI
let intervalId;

// UI vars
let lengthSlider, lengthInput;
let turnSlider, turnInput;
let compressSlider, compressInput;

function setup() {
    setupHeader();
    setupSquiggle();
    setupFooter();
}

function setupHeader() {

}

function setupSquiggle() {
    const canvas = createCanvas(windowWidth, windowHeight - 200); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');
    // Create an off-screen renderer for the SVG output
    offScreenRenderer = createGraphics(width, height, SVG);

    turnRadius.selected = (turnRadius.min + turnRadius.max) / 2;
    length.selected = (length.min + length.max) / 2;
    pDistance.selected = [(pDistance.min[0] + pDistance.max[0]) / 2, (pDistance.min[1] + pDistance.max[1]) / 2];

    author = "Unknown";
    title = "Untitled";

    // squiggle setup
    centerX = width / 2;
    centerY = height / 2;
    buffer = 35; // boarder margin in pixels
    scale = 100.0; // zoom level on Perlin noise field
    bigThreshold = 0.80; // Higher percent, more loops
    seed = 1; // increment on each attempt
    showField = false;
}

function setupFooter() {
    // Create input boxes
    lengthInput = createInputBox(50);
    turnInput = createInputBox(50);
    compressInput = createInputBox(50);

    // Create and set up circles
    lengthCircle = createCircleButton('Length', color(255, 0, 0), updateLengthValue);
    turnCircle = createCircleButton('Turn Radius', color(0, 255, 0), updateTurnValue);
    compressCircle = createCircleButton('Compression', color(0, 0, 255), updateCompressValue);

    // Add UI controls to the footer
    const footer = select('#footer');
    const controlsContainer = createElement('div').addClass('controls-container');
    controlsContainer.child(createControlGroup(lengthInput, lengthCircle));
    controlsContainer.child(createControlGroup(turnInput, turnCircle));
    controlsContainer.child(createControlGroup(compressInput, compressCircle));
    footer.child(controlsContainer);
}

function createControlGroup(inputBox, circleButton) {
    const controlGroup = createElement('div').addClass('control-group');
    controlGroup.child(inputBox);
    controlGroup.child(circleButton);
    return controlGroup;
}

function updateLengthValue() {
    updateValue(lengthInput, lengthCircle, color(255, 0, 0), color(255, 165, 0));
}

function updateTurnValue() {
    updateValue(turnInput, turnCircle, color(0, 255, 0), color(0, 128, 0));
}

function updateCompressValue() {
    updateValue(compressInput, compressCircle, color(0, 0, 255), color(75, 0, 130));
}

function updateValue(input, circle, color1, color2) {
    // Read the value for the input's value
    let value = parseInt(input.value());
    // change the number
    if (value >= 100) {
        input.attribute('data-i', '-1');
    } else if (value <= 1) {
        input.attribute('data-i', '1');
    }

    const incrementor = parseInt(input.attribute('data-i'));
    value = value + incrementor;
    input.value((value).toString());
    // change the color
    const colorValue = map(value, 1, 100, 0, 1);
    circle.style('background-color', lerpColor(color1, color2, colorValue));
}

function createCircleButton(label, color, updateFunction) {
    const circle = createButton('');
    circle.addClass('circle-button');
    circle.style('background-color', color);

    const startEvent = () => {
        clearInterval(intervalId);
        intervalId = setInterval(updateFunction, 100);
    };

    const endEvent = () => {
        clearInterval(intervalId);
    };

    circle.mousePressed(startEvent);
    circle.mouseReleased(endEvent);
    circle.touchStarted(startEvent);
    circle.touchEnded(endEvent);

    return circle;
}

function draw() {
    // background(220);

    squigglePoints = generateSquigglePoints();
    drawSquiggle(squigglePoints, this);
    drawSquiggle(squigglePoints, offScreenRenderer);
    // Get the SVG data as a string
    svgData = offScreenRenderer.elt.svg.outerHTML;
    // console.log(svgData);

    noLoop();
}

// squiggle functions
function generateSquigglePoints() {

    let goodArt = false;
    while (!goodArt) {
        noiseSeed(seed);
        pointsArray = [];

        let px = centerX;
        let py = centerY;
        let angle = HALF_PI;

        let numBigTurns = 0;
        let numSmallTurns = 0;

        // Loop until squiggle hits the user specified length
        squiggleLength = 0;
        while (squiggleLength < length.max) {
            let pNoise = noise(px / scale, py / scale);
            let deltaAngle = map(pNoise, 0, 1, -TWO_PI, TWO_PI);
            let distance = map(pNoise, 0, 1, pDistance.selected[0], pDistance.selected[1]);

            if (abs(deltaAngle) > piValue(turnRadius.selected)) {
                angle += piValue(turnRadius.selected);
                numBigTurns++;
            } else {
                angle += deltaAngle;
                numSmallTurns++;
            }

            px += distance * cos(angle);
            py += distance * sin(angle);

            // Check if out of bounds. If so, try to get back in bounds
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
                if (squiggleLength < length.selected) {
                    pointsArray.push(new Point(px, py));
                }
                squiggleLength += distance;
            } else {
                break;
            }
        }

        // check if squiggle is worth keeping
        let percentBig = numBigTurns / (numBigTurns + numSmallTurns);
        if (percentBig > bigThreshold || squiggleLength < (length.max - (pDistance.selected[1]))) {
            goodArt = false;
            seed++;
        } else {
            goodArt = true;
        }
    }

    return pointsArray;
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

// Helper functions
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

function checkBounds(px, py) {
    return !(px >= width - buffer || px <= buffer || py >= height - buffer || py <= buffer);
}

function piValue(turnMod) {
    return (turnMod * PI) + (PI / 8)
}

function remap(value, oldMin, oldMax, newMin, newMax) {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

// Custom squiggle Point class
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// UI functions
function createLabel(name) {
    const label = createElement('span', name);
    label.style('margin-right', '10px');
    return label;
}

function createInputBox(value) {
    const inputBox = createInput(value.toString());
    inputBox.attribute('type', 'number');
    inputBox.attribute('min', '1');
    inputBox.attribute('max', '100');
    inputBox.attribute('data-i', '1');
    inputBox.addClass('input-field');
    return inputBox;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// API POST
async function sendData() {

    const urlParams = new URLSearchParams(window.location.search);
    const inviteKeyParam = urlParams.get("inviteKey");
    // const author = document.getElementById("author").value;

    const request = {
        inviteKey: inviteKeyParam,
        squiggle: {
            datetime: new Date().toLocaleString(),
            author: author,
            svgData: svgData,
            squiggleParams: JSON.stringify({
                title: title,
                length: length.selected,
                turn: turnRadius.selected,
                pDistance: pDistance.selected
            })
        },
    };
    const requestBody = JSON.stringify(request)

    console.log("Request:");
    console.log(requestBody);

    const response = await fetch("https://4ko9ppstm2.execute-api.us-west-2.amazonaws.com/prod/squiggle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: requestBody,
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        const responseBody = JSON.parse(jsonResponse.body);
        console.log("Response:", responseBody.message);

        // message.textContent = "Successfully submitted!";
        // message.style.color = "green";
        // form.reset();
    } else {
        const jsonResponse = await response.json();
        const responseBody = JSON.parse(jsonResponse.body);
        console.log("Error:", responseBody.message);

        // message.textContent = "Error";
        // message.style.color = "red";
    }
};