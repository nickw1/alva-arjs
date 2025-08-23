# AlvaAR and AR.js Experiments

## Introduction

The aim of this project is to explore [AlvaAR](https://github.com/alanross/AlvaAR) and integrate with AR.js's location-based [LocAR.js](https://github.com/AR-js-org/locar.js), with an eventual aim to place geographic AR content realistically on the ground.

So far, just a proof-of-concept using what I believe is the minimal code for using AlvaAR, and integration with the AR.js location-based API. Nothing particularly exciting for now.

It's mostly about understanding what Alva can do.

### Update 2025-08-22

Now using LocAR.js plus the `npm`-ised version of AlvaAR.

## Instructions

### Install dependencies

You need to ensure you build the specific versions of LocAR.js and AlvaAR below.

- version `0.1.x` of [LocAR.js](https://github.com/AR-js-org/locar.js). Can be installed with `npm`. 

- The `npm` version of AlvaAR. This is not on NPM; it can be obtained from the `demomod` branch of my modified version of AlvaAR [here](https://github.com/nickw1/AlvaAR). The source code is available in the `js` directory; please build it with 

`npm run build`

and it will produce a tarball.


### Run the demo

The demo is setup to run using [Vite](https://vitejs.dev). You may need to modify the `package.json` to change the locations of the LocAR.js and AlvaAR tarballs. Then simply

`npm install`

to install dependencies and

`npm run dev`

## What can it do?

Right now it positions the user at a hard-coded GPS location (for ease of testing) and tracks the user with AlvaAR. It does not attempt to link the two yet, I need to get a good idea of how the AlvaAR tracking is working in the field before I do so, but the aim then will be to refine the GPS position with the tracked AlvaAR position.
