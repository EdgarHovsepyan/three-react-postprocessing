import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three"; // REVISION 128
import { Group, MeshPhysicalMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FocusShader } from "three/examples/jsm/shaders/FocusShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const Scene = () => {
  let canvasRef = useRef(null);
  let model_ = null;
  let camera, controls;
  let composer, effectFocus, renderer, clock, scene, animate;

  const params = {
    exposure: 0.6,
    bloomStrength: 0.5,
    bloomThreshold: 0,
    bloomRadius: 0,
  };

  const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

  const init = () => {
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({
      // antialias: true,
      canvas: canvasRef,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 0.65;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene = new THREE.Scene();

    scene.add(new THREE.HemisphereLight(0x00bcbd, 0xb6700e, 1));

    scene.add(new THREE.AmbientLight(0xffffff, 5));

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
    camera.position.set(-3, 1, -3);
    camera.lookAt(0, -2, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    // controls.minDistance = 1;
    // controls.maxDistance = 10;
    // controls.dampingFactor = true;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.02;

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1,
      0.8,
      256
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    effectFocus = new ShaderPass(FocusShader);

    effectFocus.uniforms["screenWidth"].value =
      window.innerWidth * window.devicePixelRatio;
    effectFocus.uniforms["screenHeight"].value =
      window.innerHeight * window.devicePixelRatio;

    composer = new EffectComposer(renderer);

    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    // composer.addPass(effectFocus);

    new FBXLoader().load("./models/Roulete.fbx", function (fbxData) {
      model_ = fbxData;
      model_.scale.set(0.01, 0.01, 0.01);
      model_.position.set(-0.132, -0.957, -0.124);
      model_.traverse((child) => {
        if (child.isMesh) {
          child.blending = THREE.AdditiveBlending;
          // child.material.side = THREE.DoubleSide;
        }
      });
      scene.add(model_);
    });

    new FBXLoader().load("./models/Room.fbx", function (fbxData) {
      const model = fbxData;
      model.scale.set(0.01, 0.01, 0.01);
      const ground = model.children[0];
      const groundTexture = new THREE.TextureLoader().load(
        "/models/room/Mramor_diffuse.png"
      );
      const groundMaterial = new THREE.MeshPhysicalMaterial({
        map: groundTexture,
        metalness: 0.8,
        roughness: 0.2,
      });
      model.children[0].material = groundMaterial;
      const blue_light = model.children[4];
      blue_light.material.color.setHex("0x00bcbd");
      const yelow_light = model.children[3];
      yelow_light.material.color.setHex("0xb6700e");
      model.traverse((child) => {
        console.log(child);
        if (child.isMesh) {
          // child.material.side = THREE.DoubleSide;
          child.blending = THREE.AdditiveBlending;
        }
      });
      scene.add(model);
    });

    animate = () => {
      window.requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (model_?.isObject3D) {
        model_.rotation.y += delta;
      }

      composer.render();

      // renderer.render(scene, camera);

      controls.update();
    };
    animate();
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
