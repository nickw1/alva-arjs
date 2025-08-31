import { AlvaAR, ARCamView, Camera, onFrame, resize2cover, AlvaARConnectorTHREE } from 'alva-js';
import * as THREE from 'three';
import * as LocAR from 'locar';

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

const applyPose = AlvaARConnectorTHREE.Initialize( THREE );

let alva, locar, arCamView, ctx, video, deviceOrientationControls, locarCam;
let gotFirstGps = false;

let detectPlane = false;

Camera.Initialize(config).then( async(media) => {
    video = media.el;
    const size = resize2cover(video.videoWidth, video.videoHeight, container.clientWidth, container.clientHeight);

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    video.style.width = size.width + 'px';
    video.style.height = size.height + 'px';
    
    ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: true
    });


    container.appendChild(canvas);
    container.appendChild(view);

    locarCam = new THREE.PerspectiveCamera(75, video.videoWidth/video.videoHeight, 0.001, 100);

    initAlva().then(initLocar);
    
}).catch( error => alert(error) );

document.getElementById("start").addEventListener("click", e => {
    setupFrameHandler();
    document.getElementById("start").setAttribute("disabled", "disabled");
});

window.addEventListener("resize", e=> {
    if(locarCam) {
        locarCam.aspect = window.innerWidth/window.innerHeight;
        locarCam.updateProjectionMatrix();
    }
});

async function initAlva() {        
    alva = await AlvaAR.Initialize(canvas.width, canvas.height);
    arCamView = new ARCamView(view, canvas.width, canvas.height);

    view.addEventListener('click', e=> {
        detectPlane = true;
    });

    // from Alva demo - add the icosahedron object
    const object = new THREE.Mesh( new THREE.IcosahedronGeometry( 1, 0 ), new THREE.MeshNormalMaterial( { flatShading: true } ) );
    object.visible = false;
    arCamView.addObject( object, 0, 0, -5 );
    const originObject = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.5, 0.5 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    arCamView.addObject( originObject, 0, 0, 0 );
    // we don't want any matrix autoupdates because we are calculating it
    // manually by multiplying the pose by the locar matrix
    // threejs.org/manual/#en/matrix-transformations
    arCamView.camera.matrixAutoUpdate = false; 
}

function initLocar() {
    // create a LocAR instance using the Alva scene and LocAR camera
    locar = new LocAR.LocationBased(arCamView.scene, locarCam);
    locar.setGpsOptions({ gpsMinDistance: 10 });
    deviceOrientationControls = new LocAR.DeviceOrientationControls(locarCam);
    deviceOrientationControls.on("deviceorientationgranted", ev => {
        ev.target.connect();
    });

    deviceOrientationControls.on("deviceorientationerror", error => {
        alert(`Device orientation error: ${error.code}: ${error.message}`);
    });
    deviceOrientationControls.init();

    locar.on("gpsupdate", ev => {
        alert(`Got GPS position: ${ev.position.coords.longitude} ${ev.position.coords.latitude}`);
        document.getElementById("start").removeAttribute("disabled");
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
        }];
        if(!gotFirstGps) {
            for(let i=0; i<props.length; i++) {
                const object = new THREE.Mesh(geom, props[i].mtl);
                object.visible = false;    
                const [x, z]  = locar.lonLatToWorldCoords(origLon + props[i].lonDis, origLat + props[i].latDis); 
                console.log(x, z);
                arCamView.addObject(object, x, arCamView.camera.position.y + props[i].yDis, z);
            }
            gotFirstGps = true;
        }
    });
    locar.fakeGps(-0.72, 51.05);
}

function setupFrameHandler() {
    if(gotFirstGps) {
        onFrame( () => {
            deviceOrientationControls?.update();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // TODO we need to reinitialise alva tracking when we get a new GPS position - how do we do this?
            const pose = alva.findCameraPose(frame);
            if(pose) {
                // this updates the camera's position and quaternion 
                arCamView.updateCameraPose(pose);
                
                // we now have to update the matrix manually due to matrixAutoUpdate = false
                arCamView.camera.updateMatrix();
 
                // multiply by the locar matrix to get compound camera position
                if(locarCam) {
                    // create clone of alva matrix
                    const tmpMatrix = arCamView.camera.matrix.clone();
                    // multiply alva matrix by locar matrix to get combined matrix (reverse of transformation order which is locar first then alva)
                    tmpMatrix.multiply(locarCam.matrix);    
                    // set alva matrix to the result
                    arCamView.camera.matrix.set(tmpMatrix);
                }
                console.log(`onFrame(): camera position now:`);
                console.log(arCamView.camera.position);
                // plane code taken from the AlvaAR video example 
                if(detectPlane) {
                    const planePose = alva.findPlane();
                    if(planePose) {
                        let scale = 2.0;
                        const plane = new THREE.Mesh( new THREE.PlaneGeometry( scale, scale ), new THREE.MeshBasicMaterial( {
                            color: 0xffffff,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.1
                        } ) );

                        scale *= 0.25;

                        const cube = new THREE.Mesh( new THREE.BoxGeometry( scale, scale, scale ), new THREE.MeshNormalMaterial( { flatShading: true } ) );
                        cube.position.z = scale * 0.5;

                        plane.add( cube );
                        plane.custom = true;
                         
                        applyPose( planePose, plane.quaternion, plane.position );
                        arCamView.scene.add( plane );

                        detectPlane = false;
                    }
                }
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
    } else {
        alert('Cannot start frame processing as no GPS location yet');
    }
}

