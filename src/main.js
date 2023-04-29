/*
    remove small bits
    wandering drunkard option
    add in a 3d preview of the map?
    theme selection?
    settings bar?
    paint fill algorithm to remove little bits
*/

'use strict'
var seedrandom = require('seedrandom');
let seed = "asdf";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
var width = canvas.width = 512;
var height = canvas.height = 512;
const cellSize = 1;
var grid = [];

// const width = Math.floor(width / cellSize);
// const height = Math.floor(height / cellSize);

// let density = 0.6;
// const density_input = document.querySelector('#density input');
// const density_label = document.querySelector('#density span');

const seed_input = document.querySelector('#seed input');

var ele = document.getElementsByName('size');
for (let i = 0; i < ele.length; i++) {
    const element = ele[i];

    let change = () => {
        let s = 0;

        if (element.id === "small")
            s = 128;
        else if (element.id === "medium")
            s = 256;
        else if (element.id === "large")
            s = 512;

        width = canvas.width = s;
        height = canvas.height = s;

        generateGrid();
    };

    element.onclick = change;
}

// density_input.value = density;
// let decimalToPercent = (decimal) =>
//     Math.floor(decimal * 100) + "%";
// density_label.innerText = decimalToPercent(density);

// density_input.addEventListener('input', () => {
//     density = density_input.value;
//     density_label.innerText = decimalToPercent(density);
//     generateGrid();
// });

seed_input.addEventListener('input', () => {
    seed = seed_input.value;
    generateGrid();
});


function generateGrid() {
    grid = new Array(width).fill().map(() => new Array(height));

    grid = generateWanderingDrunkardNoise(seed, 1);

    for (let z = 1; z < 6; z++) {
        grid = generateCellularAutomata(grid);
    }

    grid = generateWanderingDrunkardNoise(seed, 10);
    // RemoveSpecksInArray(grid, 1, 1);

    drawGrid();
}

function generateCellularAutomata(noise) {
    let ca = new Array(width).fill().map(() => new Array(height));
    let current_noise = noise.map(a => a);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
                let neighbors = [
                    current_noise[y + 1][x - 1],
                    current_noise[y + 1][x],
                    current_noise[y + 1][x + 1],
                    current_noise[y][x - 1],
                    current_noise[y][x + 1],
                    current_noise[y - 1][x - 1],
                    current_noise[y - 1][x],
                    current_noise[y - 1][x + 1],
                ];

                if (neighbors.filter(a => a === 1).length > 3)
                    ca[y][x] = 1;
                else
                    ca[y][x] = 0;
            }
            else {
                ca[y][x] = 0;
            }
        }
    }

    return ca;
}

// function generateNoise(seed) {
//     let rng = new seedrandom(seed);

//     let noise = [];

//     for (let y = 0; y < rows; y++) {
//         noise[y] = [];
//         for (let x = 0; x < cols; x++) {
//             if (y == 0 || x == 0 || y == (rows - 1) || x == (cols - 1)) {
//                 noise[y][x] = 1;
//             }
//             else {
//                 noise[y][x] = rng() < density ? 1 : 0;
//             }
//         }
//     }
//     return noise;
// }

function generateWanderingDrunkardNoise(seed, numOfDrunkards) {
    let rng = new seedrandom(seed);

    let noise = [];

    for (let y = 0; y < height; y++) {
        noise[y] = [];
        for (let x = 0; x < width; x++) {
            noise[y][x] = grid[y][x];
        }
    }

    let xCoord = Math.round(rng() * width) % width;
    let yCoord = Math.round(rng() * height) % height;

    for (let i = 0; i < numOfDrunkards; i++) {
        let steps = canvas.width * canvas.height / 4;
        noise[yCoord][xCoord] = 1;

        for (let j = 0; j < steps; j++) {
            let dir = Math.round(rng() * 4) % 4;

            for (let z = 0; z < 1; z++) {
                if (dir == 0)
                    noise[yCoord > height - 2 ? yCoord : ++yCoord][xCoord] = 1;
                else if (dir == 1)
                    noise[yCoord][xCoord > height - 2 ? xCoord : ++xCoord] = 1;
                else if (dir == 2)
                    noise[yCoord == 0 ? yCoord : --yCoord][xCoord] = 1;
                else if (dir == 3)
                    noise[yCoord][xCoord == 0 ? xCoord : --xCoord] = 1;
            }
        }
    }

    return noise;
}

generateGrid();

// //OOF!!!
// function RemoveSpecksInArray(array, coordX, coordY, total) {
//     if (coordX < 1 || coordX > cols - 2 || coordY < 1 || coordY < rows - 2)
//         return;

//     let current = array[coordY][coordX];

//     if (total === undefined)
//         total = [];
//     if (total.length > 3)
//         return;
//     if (array[coordY][coordX - 1] === current) {
//         RemoveSpecksInArray(array, coordX - 1, coordY, total.concat([coordX, coordY]));
//         matched = true;
//     }
//     if (array[coordY][coordX + 1] === current) {
//         RemoveSpecksInArray(array, coordX + 1, coordY, total.concat([coordX, coordY]));
//         matched = true;
//     }
//     if (array[coordY - 1][coordX] === current) {
//         RemoveSpecksInArray(array, coordX, coordY - 1, total.concat([coordX, coordY]));
//         matched = true;
//     }
//     if (array[coordY + 1][coordX] === current) {
//         RemoveSpecksInArray(array, coordX, coordY + 1, total.concat([coordX, coordY]));
//         matched = true;
//     }

//     if (matched === false && total.length > 0) {
//         // let val = array[total[0][0], total[0][1]] === 0 ? 1 : 0;

//         for (let i = 0; i < total.length; i++)
//             array[total[i][0], total[i][1]] = 2;
//     }
// }

function drawGrid() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // context.fillStyle = grid[y][x] ? "#222E44" : "#3497A1";
            // context.fillStyle = grid[y][x] ? "#5B76B9" : "#63C7DD" ;
            // context.fillStyle = grid[y][x] ? "#3A2B2A" : "#F5F6F7" ;
            context.fillStyle = grid[y][x] ? "#000" : "#FFF";
            context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

const download_button = document.querySelector('#download-button');

download_button.addEventListener('click', (e) => {
    const link = document.createElement('a');
    link.download = `${seed_input.value}.png`;
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
});