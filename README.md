# AlvaAR and AR.js Experiments

The aim of this project is to explore [AlvaAR](https://github.com/alanross/AlvaAR) and integrate with location-based [AR.js](https://github.com/AR-js-org/AR.js), with an eventual aim to place geographic AR content realistically on the ground.

So far, just a proof-of-concept using what I believe is the minimal code for using AlvaAR, and integration with the AR.js location-based API. Nothing particularly exciting for now.

## Instructions

This now includes a **modified** version of code from the AlvaAR examples, specifically the contents of the `assets` directory which contains library-style code. 

Everything in the `alva` directory is taken from AlvaAR.

I have however removed the large `image.gif` and `video.mp4` files as these are not needed.


## Versions

This repository is currently very experimental and subject to change; I have experiments with both three.js and A-Frame. Currently, my aim is to try and re-use as much of the AlvaAR example code as possible.

### Build

Build with

`npm run build`

Then run a webserver in the `public` directory and request the index page you want (`three.html` or `aframe.html`) in your browser.
