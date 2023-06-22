//import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { AlvaAR } from '../alva/assets/alva_ar.js';
import { ARCamView }  from '../alva/assets/view.js';
import { Camera, onFrame, resize2cover } from '../alva/assets/utils.js';
import * as THREE from 'three';
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only.js';

function main() {
    console.log('main()');
    const config = {
        video: {
            facingMode: 'environment',
            aspectRatio: 16 / 9,
            width: { ideal: 1280 }
        },
        audio: false
    };

    const container = document.getElementById('container');
    const view = document.createElement('div');
    const canvas = document.createElement('canvas');
    const overlay = document.getElementById('overlay');

    const origLon = -0.72, origLat = 51.05;

    Camera.Initialize(config).then( async(media) => {
        const video = media.el;
        const size = resize2cover(video.videoWidth, video.videoHeight, container.clientWidth, container.clientHeight);

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        video.style.width = size.width + 'px';
        video.style.height = size.height + 'px';
        
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: true
        });
        
        const alva = await AlvaAR.Initialize(canvas.width, canvas.height);
        const arCamView = new ARCamView(view, canvas.width, canvas.height);

        const arjs = new THREEx.LocationBased(arCamView.scene, arCamView.camera, { initialPositionAsOrigin: true});
        console.log('sending fakeGps');

        const geom = new THREE.BoxGeometry(20,20,20);
        const props = [{
            mtl: new THREE.MeshBasicMaterial({color:0xff0000}),
            lonDis: -0.001,
            latDis: 0,
            yDis: 0
        }, {
            mtl: new THREE.MeshBasicMaterial({color:0xffff00}), 
            lonDis: 0.001,
            latDis: 0,
            yDis: 0
        }, {
            mtl: new THREE.MeshBasicMaterial({color:0x0000ff}),  
            lonDis: 0,
            latDis: -0.001,
            yDis: 0
        }, {
            mtl: new THREE.MeshBasicMaterial({color:0x00ff00}),
            lonDis: 0,
            latDis: 0.001,
            yDis: 0
        }, {
            mtl: new THREE.MeshBasicMaterial({color:0xffff80}),
            lonDis: 0,
            latDis: 0,
            yDis:100
        }, {
            mtl: new THREE.MeshBasicMaterial({color:0xff80ff}),
            lonDis: 0,
            latDis: 0,
            yDis:-100
        }
        ];
        let objectsAdded = false;

        arjs.on("gpsupdate", e => {
            console.log('camera position now:');
            console.log(arCamView.camera.position);
            if(!objectsAdded) {
                for(let i=0; i<props.length; i++) {
                    const object = new THREE.Mesh(geom, props[i].mtl);
                    object.visible = false;    
                    const pos = arjs.lonLatToWorldCoords(origLon + props[i].lonDis, origLat + props[i].latDis); 
                    console.log(pos);
                    arCamView.addObject(object, pos[0], arCamView.camera.position.y + props[i].yDis, pos[1]);
                }
                objectsAdded = true;
                onFrame( () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pose = alva.findCameraPose(frame);
                    if(pose) {
                        arCamView.updateCameraPose(pose);
                    } else {
                        arCamView.lostCamera();
                        const dots = alva.getFramePoints();
                        for(const p of dots) {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(p.x, p.y,2, 2);
                        }
                    }
                    return true;
                }, 30);
            }
        });

        container.appendChild(canvas);
        container.appendChild(view);
        arjs.fakeGps(origLon, origLat);


        
    }).catch( error => alert(error) );
}

main();
