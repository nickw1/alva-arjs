# AlvaAR and AR.js Experiments

The aim of this project is to explore [AlvaAR](https://github.com/alanross/AlvaAR) and integrate with location-based [AR.js](https://github.com/AR-js-org/AR.js), with an eventual aim to place geographic AR content realistically on the ground.

So far, just a proof-of-concept using what I believe is the minimal code for using AlvaAR.

## Instructions

Copy the AlvaAR code into the project. This can be done by copying the `public` directory from the AlvaAR examples [here](https://github.com/alanross/AlvaAR/tree/main/examples/public) into a subdirectory called `alva` within the `public` directory in this repository. 

## Versions

This repository is currently very experimental and subject to change; I have experiments with both three.js and A-Frame. Currently, my aim is to try and re-use as much of the AlvaAR example code as possible.

### three.js

Just run a server directly inside the `public` directory and request `three.html`.

### A-Frame

Build the A-Frame version with 

`npm run build`

Then run a webserver in the `public` directory and request the index page in your browser.
