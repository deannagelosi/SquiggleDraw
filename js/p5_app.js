// Squiggle Generator
// "Take a Dot for a Walk"
// source: converted from https://github.com/deannagelosi/squiggle_generator

// todo: 
// - show error message on ui if missing or incorrect invite key
// - show success or fail messages on ui for sent squiggles

// User Parameters
// length = pixel distance
let length = { min: 500, max: 3500, selected: null };
// Max turn speed: 0.25 = circles, 0.5 = squares, 0.875 = starbursts
let turnRadius = { min: 0.25, max: 0.875, selected: null };
// Range of distance between points
let pDistance = { min: [10, 50], max: [20, 200], selected: [null, null] };

// squiggle vars
let zScale;
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
let circlePressInterval;

// UI vars
let lengthCircle, lengthInput, lengthColors;
let turnCircle, turnInput, turnColors;
let compressCircle, compressInput, compressColors;
const headerH = 60;
const spacerH = 90;
const footerH = 175;
let headerHeight = headerH;
let spacerHeight = spacerH;

function setup() {
    setupHeader();
    setupSquiggle();
    setupFooter();
}

function setupHeader() {
    const header = select('#header');
    const spacer = select('#spacer');
    header.addClass('header');
    // setup header and spacer height
    header.style('height', `${headerHeight}px`);
    spacer.style('height', `${spacerHeight}px`);

    // Create and set up the reset button
    const resetButton = createButton('Reset');
    resetButton.addClass('reset-button');
    resetButton.mousePressed(() => {
        // Reset the squiggle
        // clear pressed
        clearInterval(circlePressInterval);
        // reset input and circles to default
        lengthInput.value(50);
        turnInput.value(50);
        compressInput.value(50);
        updateColor(lengthCircle, 50, lengthColors);
        updateColor(turnCircle, 50, turnColors);
        updateColor(compressCircle, 50, compressColors);
        // update squiggle drawing
        updateSquiggle();
    });

    // Create and set up the share button
    const shareButton = createButton('Share');
    shareButton.addClass('share-button');
    shareButton.mousePressed(() => {
        appendShare(header);
    });
    shareButton.touchEnded(() => {
        appendShare(header);
    });

    // Create the title
    const title = createElement('h1', 'SquiggleDraw');
    title.addClass('header-title');

    // Add elements to the header
    const titleContainer = createElement('div').addClass('title-container');
    titleContainer.child(resetButton);
    titleContainer.child(title);
    titleContainer.child(shareButton);
    header.child(titleContainer);

    // Add the header to the body
    document.body.prepend(header.elt);
}

function appendShare(header) {
    // check if already appended
    const findContainer = select('.share-container');
    if (findContainer) {
        // already added, don't add again
        return;
    }

    // resize the header into spacer
    headerHeight = headerH + spacerH;
    spacerHeight = 0;
    header.style('height', `${headerHeight}px`);
    const spacer = select('#spacer');
    spacer.style('height', `${spacerHeight}px`);

    // create and append the share ui
    const shareContainer = createElement('div');
    shareContainer.addClass('share-container');

    // Create the back button
    const backButton = createButton('Back');
    backButton.addClass('back-button');

    backButton.mousePressed(() => {
        removeShare(shareContainer, header, spacer);
    });
    backButton.touchEnded(() => {
        removeShare(shareContainer, header, spacer);
    });

    // Create the print button
    const printButton = createButton('Print');
    printButton.addClass('print-button');
    printButton.mouseClicked(() => {
        printButton.attribute('disabled', '');
        sendData();
    });

    // Create the input boxes
    const titleInput = createInput('');
    titleInput.attribute('placeholder', 'Title');
    titleInput.addClass('input-box');
    titleInput.addClass('title-input');
    console.log(titleInput.value());
    titleInput.input(() => {
        title = titleInput.value();
    });

    const authorInput = createInput('');
    authorInput.attribute('placeholder', 'Author');
    authorInput.addClass('input-box');
    authorInput.addClass('author-input');
    authorInput.input(() => {
        author = authorInput.value();
    });

    // wrap input boxes in container
    const inputContainer = createElement('div');
    inputContainer.addClass('input-container');
    inputContainer.child(titleInput);
    inputContainer.child(authorInput);

    // Add elements to the container
    shareContainer.child(backButton);
    shareContainer.child(inputContainer);
    shareContainer.child(printButton);

    // Append the container to the header
    header.child(shareContainer);
}

function removeShare(container, header, spacer) {
    container.remove();
    headerHeight = headerH;
    spacerHeight = spacerH;
    header.style('height', `${headerHeight}px`);
    spacer.style('height', `${spacerHeight}px`);
}

function setupSquiggle() {
    const canvas = createCanvas(windowWidth, windowHeight - footerH - (spacerH + headerH)); // Adjust canvas height to exclude footer
    canvas.parent('canvas-container');
    // Create an off-screen renderer for the SVG output
    offScreenRenderer = createGraphics(width, height, SVG);

    turnRadius.selected = (turnRadius.min + turnRadius.max) / 2;
    length.selected = (length.min + length.max) / 2;
    pDistance.selected = [(pDistance.min[0] + pDistance.max[0]) / 2, (pDistance.min[1] + pDistance.max[1]) / 2];

    // squiggle setup
    centerX = width / 2;
    centerY = height / 2;
    buffer = { // boarder margin in pixels
        left: 20,
        right: 20,
        top: 10,
        bottom: 20
    };
    zScale = 100.0; // zoom level on Perlin noise field
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
    // lengthColors = [color(248, 108, 167), color(244, 212, 68)];
    lengthColors = [color(252, 80, 110), color(244, 212, 68)];
    // turnColors = [color(48, 197, 210), color(71, 16, 105)];
    turnColors = [color(9, 101, 192), color(48, 197, 210)];
    compressColors = [color(191, 15, 255), color(203, 255, 73)];

    lengthCircle = createCircle('Length', lengthColors);
    turnCircle = createCircle('Turn Radius', turnColors);
    compressCircle = createCircle('Compression', compressColors);


    // handle circle and input box changes
    handleValueChange(lengthInput, lengthCircle, lengthColors);
    handleValueChange(turnInput, turnCircle, turnColors);
    handleValueChange(compressInput, compressCircle, compressColors);

    // Add UI controls to the footer
    const footer = select('#footer');
    footer.addClass('footer');
    footer.style('height', `${footerH}px`);
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

function handleValueChange(inputBox, circle, colors) {
    // if input box changes
    function inputUpdate() {
        // read current value
        let value = Math.floor(parseInt(inputBox.value()));
        // limit out of bounds
        if (value > 100) {
            value = 100;
            inputBox.value(value.toString());
        } else if (value < 1) {
            value = 1;
            inputBox.value(value.toString());
        } else if (inputBox.value() === '') {
            // leave empty in ui if empty
            value = 1;
        }
        // update circle color 
        updateColor(circle, value, colors);

        // update squiggle
        updateSquiggle();
    };
    // listen for input changes
    inputBox.input(inputUpdate);

    // if circle is pressed
    function circleUpdate() {
        // read current value
        let value = Math.floor(parseInt(inputBox.value()));
        // increment up or down
        let i = parseInt(inputBox.attribute('data-i'));
        if (value >= 100) {
            i = -1;
        } else if (value <= 1) {
            i = 1;
        }
        inputBox.attribute('data-i', i.toString());
        // update value
        value = value + i;
        inputBox.value(value.toString());
        // update circle color
        updateColor(circle, value, colors);

        // update squiggle
        updateSquiggle();
    }
    // listen for mouse or touch on circle
    const startUpdate = () => {
        clearInterval(circlePressInterval);
        circlePressInterval = setInterval(circleUpdate, 100);
    };
    const endUpdate = () => {
        clearInterval(circlePressInterval);
    };
    circle.mousePressed(startUpdate);
    circle.mouseReleased(endUpdate);
    circle.touchStarted(startUpdate);
    circle.touchEnded(endUpdate);
}

function updateSquiggle() {
    // Update Length
    lengthValue = lengthInput.value();
    let newLength = remap(lengthValue, 0, 100, length.min, length.max);
    length.selected = newLength;
    // Update Turn
    turnValue = turnInput.value();
    let piMod = remap(turnValue, 0, 100, turnRadius.min, turnRadius.max);
    turnRadius.selected = piMod;
    seed = 1; // search from beginning
    // Update Compress
    compressValue = compressInput.value();
    let newMin = remap(compressValue, 0, 100, pDistance.min[0], pDistance.max[0]);
    let newMax = remap(compressValue, 0, 100, pDistance.min[1], pDistance.max[1]);
    let newRange = [newMin, newMax];
    pDistance.selected = newRange;
    seed = 1; // search from beginning
    // redraw squiggle with new params
    loop();
}

function updateColor(circle, value, colors) {
    const colorValue = map(value, 1, 100, 0, 1);
    circle.style('background-color', lerpColor(colors[0], colors[1], colorValue));
}

function draw() {
    squigglePoints = generateSquigglePoints();
    drawSquiggle(squigglePoints, this);
    drawSquiggle(squigglePoints, offScreenRenderer);

    // Get the SVG data as a string
    svgData = offScreenRenderer.elt.svg.outerHTML;
    // Remove the background rect from the SVG data
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
    const backgroundRect = svgDoc.querySelector("rect");
    backgroundRect.remove();
    svgData = svgDoc.documentElement.outerHTML;

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
            let pNoise = noise(px / zScale, py / zScale);
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
                    let newNoise = noise((px + (k * 10)) / zScale, py / zScale);
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
            let nShading = noise(x / zScale, y / zScale);
            let shading = map(nShading, 0, 1, 75, 255);
            fill(shading);
            rect(x, y, 5, 5);
        }
    }
}

function checkBounds(px, py) {
    return !(px >= width - buffer.right || px <= buffer.left || py >= height - buffer.bottom || py <= buffer.top);
}

function piValue(turnMod) {
    return (turnMod * PI) + (PI / 8);
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

// UI create functions
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

function createCircle(label, colors) {
    const circle = createButton('');
    circle.addClass('circle-button');
    updateColor(circle, 50, colors);

    // pick correct svg img path
    let svgPath;
    switch (label) {
        case "Length":
            svgPath = '../img/length.svg';
            break;
        case "Turn Radius":
            svgPath = '../img/loop.svg';
            break;
        case "Compression":
            svgPath = '../img/compress.svg';
            break;
    }
    // Load the SVG image and create an SVG element
    const svgImg = createSVG(svgPath);
    svgImg.addClass('svg-button-icon');
    // svgImg.style('fill', '#f00');
    if (label == "Turn Radius") {
        svgImg.style('margin-bottom', '20px');
    }
    circle.child(svgImg);

    return circle;
}

function createSVG(path) {
    const svgElem = createElement('object');
    svgElem.attribute('data', path);
    svgElem.attribute('type', 'image/svg+xml');
    svgElem.style('pointer-events', 'none');
    return svgElem;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - footerH - (spacerH + headerH));
}

// API POST
async function sendData() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteKeyParam = urlParams.get("inviteKey");

    if (!title) {
        title = "Untitled";
    }
    if (!author) {
        author = "Unknown";
    }

    const request = {
        inviteKey: inviteKeyParam,
        squiggle: {
            datetime: new Date().toLocaleString(),
            author: author,
            svgData: svgData,
            squiggleParams: JSON.stringify({
                title: title,
                length: lengthInput.value(),
                turn: turnInput.value(),
                pDistance: compressInput.value()
            })
        },
    };
    const requestBody = JSON.stringify(request);

    console.log("Request:");
    console.log(requestBody);

    const printButton = select('.print-button');
    try {
        const API_ENDPOINT = process.env.API_ENDPOINT;
        const response = await fetch(API_ENDPOINT, {
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

            showMessage('Squiggle sent!', true);
            printButton.removeAttribute('disabled');
        } else {
            const jsonResponse = await response.json();
            const responseBody = JSON.parse(jsonResponse.body);
            console.log("Error:", responseBody.message);

            showMessage(`${responseBody.message}`, false);
            printButton.removeAttribute('disabled');
        }
    } catch (error) {
        console.error("Error:", error.message);
        printButton.removeAttribute('disabled'); // Re-enable the print button on a failure
    }
};

function showMessage(message, success) {
    const messageElem = createElement('div', message);
    messageElem.addClass('message');

    if (success) {
        messageElem.addClass('success-message');
    } else {
        messageElem.addClass('error-message');
    }
    // find needed elements
    const header = select('#header');
    const spacer = select('#spacer');
    const shareContainer = select('.share-container');
    const inputContainer = select('.input-container');
    const titleInput = select('.title-input');
    const authorInput = select('.author-input');

    // Replace the contents of input container for 3 seconds
    titleInput.hide();
    authorInput.hide();
    inputContainer.child(messageElem);

    setTimeout(() => {
        removeShare(shareContainer, header, spacer);
    }, 3000); // Remove the message after 3 seconds
}