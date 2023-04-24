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


// parameters
// length = pixel distance
let length = {
    min: 500,
    max: 3000,
    selected: null
};

// Max turn speed: 0.25 = circles, 0.5 = squares, 0.875 = starbursts
let turn = {
    min: 0.25,
    max: 0.875,
    selected: null
};

// Distance between points
let pointDistance = { min: 20, max: 100 }

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
let lengthSlider, turnSlider;
let lengthInput, turnInput;

function setup() {
    // UI setup
    const canvas = createCanvas(windowWidth, windowHeight - 100); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');
    // Create an off-screen renderer for the SVG output
    offScreenRenderer = createGraphics(width, height, SVG);

    createFooter();

    turn.selected = (turn.min + turn.max) / 2;
    length.selected = (length.min + length.max) / 2;
    author = "";
    title = "";
    
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

function piValue(turnMod) {
    return (turnMod * PI) + (PI / 8)
}

// UI functions
function createFooter() {
    // Create sliders
    lengthSlider = createSlider(0, 100, 50);
    turnSlider = createSlider(0, 100, 50);
    // Set value change handlers
    lengthSlider.input(updateLengthValue);
    turnSlider.input(updateTurnValue);

    // Create input boxes
    lengthInput = createInputBox(lengthSlider);
    turnInput = createInputBox(turnSlider);

    // Build the length controls
    const lengthSliderContainer = createElement('div').addClass('slider-container');
    lengthSliderContainer.child(createLabel('Length'));
    lengthSliderContainer.child(lengthSlider);
    lengthSliderContainer.child(lengthInput);
    
    // Build the turn controls
    const turnSliderContainer = createElement('div').addClass('slider-container');
    turnSliderContainer.child(createLabel('Turn'));
    turnSliderContainer.child(turnSlider);
    turnSliderContainer.child(turnInput);

    // Add UI controls to the footer
    const footer = select('#footer');
    footer.child(lengthSliderContainer);
    footer.child(turnSliderContainer);

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
    const inputBox = createInput(slider.value().toString() + '%');
    inputBox.style('margin-left', '10px');
    inputBox.style('width', '60px');
    inputBox.input(() => {
        slider.value(parseInt(inputBox.value()));
    });
    return inputBox;
}

function updateLengthValue() {
    currentLength = lengthSlider.value();
    lengthInput.value(currentLength + '%');
    // length.selected = currentLength;

    // seed = 1;
    // loop();
}

function updateTurnValue() {
    currentTurn = turnSlider.value();
    turnInput.value(currentTurn + '%');

    // translate slider value to max turn value and redraw
    let piMod = remap(currentTurn, 0, 100, turn.min, turn.max);
    turn.selected = piMod;

    seed = 1;
    loop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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
        while (squiggleLength < length.selected) {
            let pNoise = noise(px / scale, py / scale);
            let deltaAngle = map(pNoise, 0, 1, -TWO_PI, TWO_PI);
            let distance = map(pNoise, 0, 1, pointDistance.min, pointDistance.max);

            if (abs(deltaAngle) > piValue(turn.selected)) {
                angle += piValue(turn.selected);
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
                pointsArray.push(new Point(px, py));
                squiggleLength += distance;
            } else {
                break;
            }
        }

        // check if squiggle is worth keeping
        let percentBig = numBigTurns / (numBigTurns + numSmallTurns);
        if (percentBig > bigThreshold || squiggleLength < length.selected - 100) {
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



// API stuff


// const form = document.getElementById("squiggle-form");
// const message = document.getElementById("message");

// form.addEventListener("submit", async function (event) {
async function sendData() {

    const urlParams = new URLSearchParams(window.location.search);
    const inviteKeyParam = urlParams.get("inviteKey");
    // event.preventDefault();
    // const author = document.getElementById("author").value;

    const request = {
        inviteKey: inviteKeyParam,
        squiggle: {
            datetime: new Date().toLocaleString(),
            author: author,
            svgData: svgData,
            squiggleParams: {
                title: title,
                length: length.selected,
                turn: turn.selected
            }
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
        console.log("Success:", responseBody.message);

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