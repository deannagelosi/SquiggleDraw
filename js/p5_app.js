// Squiggle Generator
// "Take a Dot for a Walk"
// source: converted from https://github.com/deannagelosi/squiggle_generator

// todo: 
// - add button to createFooter (see chat)
// - use code in js/script.js to add sending svgData to POST
// - add handling the svgData field to aws and pi db
// - print the svg on the thermal printer
// - canvas size (padding/boarder?)
// - when saving svg, send to POST endpoint
// - add button to save svg
// - seed: reset seed back to 1 anytime parameters change
// - knobs for parameters 
//   - length: combination of steps and distance
//   - turn: maxTurn value
// - HTML sliders
// - UI for parameters
// - author and project title
// - seed, length, turn
// - randomize parameters and button
// - axidraw scales the svg to fit (width and height) before drawing
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

// UI vars
let lengthSlider, lengthInput;
let turnSlider, turnInput;
let compressSlider, compressInput;

function setup() {
    // UI setup
    const canvas = createCanvas(windowWidth, windowHeight - 200); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');
    // Create an off-screen renderer for the SVG output
    offScreenRenderer = createGraphics(width, height, SVG);

    createFooter();

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
function createFooter() {
    // Create sliders
    lengthSlider = createSlider(0, 100, 50);
    turnSlider = createSlider(0, 100, 50);
    compressSlider = createSlider(0, 100, 50);
    // Set value change handlers
    lengthSlider.input(updateLengthValue);
    turnSlider.input(updateTurnValue);
    compressSlider.input(updateCompressValue);

    // Create input boxes
    lengthInput = createInputBox(lengthSlider);
    turnInput = createInputBox(turnSlider);
    compressInput = createInputBox(compressSlider);

    // Build the length controls
    const lengthUIContainer = createElement('div').addClass('slider-container');
    lengthUIContainer.child(createLabel('Length'));
    lengthUIContainer.child(lengthSlider);
    lengthUIContainer.child(lengthInput);

    // Build the turn controls
    const turnUIContainer = createElement('div').addClass('slider-container');
    turnUIContainer.child(createLabel('Turn Radius'));
    turnUIContainer.child(turnSlider);
    turnUIContainer.child(turnInput);

    // Build the compress controls
    const compressUIContainer = createElement('div').addClass('slider-container');
    compressUIContainer.child(createLabel('Compression'));
    compressUIContainer.child(compressSlider);
    compressUIContainer.child(compressInput);

    // Add UI controls to the footer
    const footer = select('#footer');
    footer.child(lengthUIContainer);
    footer.child(turnUIContainer);
    footer.child(compressUIContainer);

    // Create and center the "Send" button
    const buttonContainer = createElement('div').addClass('button-container');
    const sendButton = createButton('Send');
    sendButton.mouseClicked(() => {
        sendData();
    });

    buttonContainer.child(sendButton);
    footer.child(buttonContainer);
}

function createLabel(name) {
    const label = createElement('span', name);
    label.style('margin-right', '10px');
    return label;
}

function createInputBox(slider) {
    const inputBox = createInput(slider.value().toString());
    inputBox.style('margin-left', '10px');
    inputBox.style('width', '60px');
    inputBox.input(() => {
        slider.value(parseInt(inputBox.value()));
    });
    return inputBox;
}

function updateLengthValue() {
    lengthFactor = lengthSlider.value();
    lengthInput.value(lengthFactor);

    let newLength = remap(lengthFactor, 0, 100, length.min, length.max)
    length.selected = newLength;

    // Draw squiggle with new length
    loop();
}

function updateTurnValue() {
    currentTurn = turnSlider.value();
    turnInput.value(currentTurn);

    // translate slider value to max turn value and redraw
    let piMod = remap(currentTurn, 0, 100, turnRadius.min, turnRadius.max);
    turnRadius.selected = piMod;

    // Reset to the start and search for squiggle
    seed = 1;
    loop();
}

function updateCompressValue() {
    currentCompress = compressSlider.value();
    compressInput.value(currentCompress);

    let newMin = remap(currentCompress, 0, 100, pDistance.min[0], pDistance.max[0]);
    let newMax = remap(currentCompress, 0, 100, pDistance.min[1], pDistance.max[1]);
    let newRange = [newMin, newMax];
    pDistance.selected = newRange;

    // Reset to the start and search for squiggle
    seed = 1;
    loop();
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