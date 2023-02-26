//import * as THREEx from './node_modules/@ar-js-org/ar.js/three.js/build/ar-threex-location-only.js'; 
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { AlvaAR } from './assets/alva_ar.js';
import { AlvaARConnectorTHREE } from './assets/alva_ar_three.js';


async function main() {
    const camera = new THREE.PerspectiveCamera(60, 1.33, 0.01, 10000);
    const threeCanvas = document.getElementById('canvas1'); 
    const renderer = new THREE.WebGLRenderer({canvas: threeCanvas, alpha: true})
    const scene = new THREE.Scene();

//    const arjs = new THREEx.LocationBased(scene, camera);

    console.log(`three canvas: ${threeCanvas.width} ${threeCanvas.height}`);
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = threeCanvas.width;
    videoCanvas.height = threeCanvas.height;
    videoCanvas.style.position = 'absolute';
    videoCanvas.style.display = 'block';
    videoCanvas.style.left = '0px';
    videoCanvas.style.top = '0px';
    videoCanvas.style.zIndex = -1;
    console.log(`Video canvas ${videoCanvas.width} ${videoCanvas.height}`);
    const ctx = videoCanvas.getContext('2d');
    document.getElementById('container').appendChild(videoCanvas);

    const FPS = 30;
    const applyPose = AlvaARConnectorTHREE.Initialize(THREE);

    let video1;
    let processVideoHandle;

    const alva = await AlvaAR.Initialize(videoCanvas.width, videoCanvas.height);
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment',
            width: videoCanvas.width,
            height: videoCanvas.height
        }
    }).then (stream => {
        video1 = document.createElement("video");
        video1.style.display = "none";
        document.body.appendChild(video1);
        video1.srcObject = stream;
        video1.play();    
    });

    //arjs.fakeGps(-0.72, 51.05);
    const object = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1,0),
        new THREE.MeshNormalMaterial({
            flatShading: true
        })
    );
    object.position.set(0, 0, -1);
    object.visible = false;

    const box = new THREE.Mesh(
            new THREE.BoxGeometry(100,100,100,4,4,4),
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                depthTest: true,
                wireframe: true,
                opacity: 0
            })
        );
    box.visible = false;

    scene.add(object);
    scene.add(box);

    requestAnimationFrame(render); 


    function processVideo() {
        if(video1) {
            const begin = Date.now();
            ctx.drawImage(video1, 0, 0, videoCanvas.width, videoCanvas.height);
            const frame = ctx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
            const delay = 1000/FPS - (Date.now() - begin);
            const pose = alva.findCameraPose(frame);
            if(pose) {
                console.log('Updating pose');
                updateCameraPose(pose);
            } else {
                console.log('Lost camera');
                lostCamera();
                const dots = alva.getFramePoints();
                ctx.fillStyle = 'white';
                for(const p of dots) {
                    ctx.fillRect(p.x, p.y, 2, 2);
                }
            }
            processVideoHandle = setTimeout(processVideo, delay);
        }
    }



    function render() {
        processVideo();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function updateCameraPose(pose) {
        applyPose(pose, camera.quaternion, camera.position);
        object.visible = true;
        box.visible = true;
    }

    function lostCamera() {
        object.visible = false;
        box.visible = false;
    }
}

main();
