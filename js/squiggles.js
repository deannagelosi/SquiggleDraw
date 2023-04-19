// Squiggle Generator
// "Take a Dot for a Walk"
// source: converted from https://github.com/deannagelosi/squiggle_generator

// changes
// - canvas size (padding/boarder?)
// - when saving svg, send to POST endpoint
// - add button to save svg
// - seed: reset seed back to 1 anytime parameters change
// - knobs for parameters 
//   - length: combination of steps and distance
//   - flourish: maxTurn value
// - HTML sliders
// - UI for parameters
// - author and project title
// - seed, length, flourish
// - randomize parameters and button
// - axidraw scales the svg to fit (width and height) before drawing


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

function setup() {
    createCanvas(432, 288);

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
    squigglePoints = generateSquigglePoints();
    drawSquiggle(squigglePoints);

    noLoop();
}

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

function drawSquiggle(points) {
    background(255);

    if (showField) {
        showPerlinField();
    }

    noFill();
    stroke(0, 0, 0);
    strokeWeight(2);

    beginShape();
    curveVertex(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
        curveVertex(points[i].x, points[i].y);
    }
    endShape();
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

function mousePressed() {
    seed++;
    loop();
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}