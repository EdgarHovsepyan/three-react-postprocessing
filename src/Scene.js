import React, { useRef, useEffect } from "react";
import * as THREE from "three"; // REVISION 128
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const Scene = () => {
  let canvasRef = useRef(null);
  let camera, controls;
  let composer, renderer, mixer, clock, scene, animate;

  const params = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0,
  };

  const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

  const init = () => {
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x120310);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 100000);
    camera.position.set(1, -6, 1);
    camera.lookAt(0, 5, 0);

    scene.add(new THREE.AmbientLight(0x404040));

    const pointLight = new THREE.PointLight(0xffffff, 1);

    scene.add(new THREE.AmbientLight(0x404040));

    camera.add(pointLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.dampingFactor = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.02;

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    new GLTFLoader().load("./models/scene.glb", function (gltf) {
      const model = gltf.scene;
      model.scale.set(0.01, 0.01, 0.01);
      model.position.setY(-1);
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      const clip = gltf.animations[0];
      mixer.clipAction(clip.optimize()).play();

      animate();
    });

    animate = () => {
      window.requestAnimationFrame(animate);

      const delta = clock.getDelta();

      mixer.update(delta);

      composer.render();

      controls.update();
    };
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="container">
      <canvas id="canvas" ref={(el) => (canvasRef = el)}></canvas>;
    </div>
  );
};

export default Scene;
