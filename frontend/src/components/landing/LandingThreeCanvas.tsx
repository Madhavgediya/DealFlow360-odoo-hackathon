import * as React from 'react';
import * as THREE from 'three';

export function LandingThreeCanvas() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x714b67, 3, 50);
    pointLight1.position.set(-10, 8, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 2.5, 50);
    pointLight2.position.set(12, -6, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xe9d5ff, 2, 40);
    pointLight3.position.set(0, 10, 5);
    scene.add(pointLight3);

    // Group for objects to rotate on mouse move
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Interactive Soft Glossy Spheres (Orbs)
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const materialPlum = new THREE.MeshStandardMaterial({
      color: 0x714b67,
      roughness: 0.25,
      metalness: 0.15,
    });
    const materialLavender = new THREE.MeshStandardMaterial({
      color: 0xcaa5c4,
      roughness: 0.3,
      metalness: 0.1,
    });
    const materialSoftWhite = new THREE.MeshStandardMaterial({
      color: 0xf5eff3,
      roughness: 0.2,
      metalness: 0.05,
    });

    // Left large background orb
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(4.5, 48, 48), materialLavender);
    sphere1.position.set(-15, 3, -6);
    mainGroup.add(sphere1);

    // Right large background orb
    const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(5.2, 48, 48), materialPlum);
    sphere2.position.set(16, 4, -8);
    mainGroup.add(sphere2);

    // Bottom right accent orb
    const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 36, 36), materialLavender);
    sphere3.position.set(11, -8, -4);
    mainGroup.add(sphere3);

    // Left bottom smaller orb
    const sphere4 = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), materialSoftWhite);
    sphere4.position.set(-12, -7, -2);
    mainGroup.add(sphere4);

    // 2. Floating Torus Ring
    const torusGeo = new THREE.TorusGeometry(3.5, 0.4, 24, 64);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x8b5d7e,
      roughness: 0.3,
      metalness: 0.2,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(13, -2, -3);
    torus.rotation.x = Math.PI / 3;
    torus.rotation.y = Math.PI / 6;
    mainGroup.add(torus);

    // 3. Floating 3D Geometric Ring on Left
    const smallTorusGeo = new THREE.TorusGeometry(2, 0.25, 20, 48);
    const smallTorus = new THREE.Mesh(smallTorusGeo, materialLavender);
    smallTorus.position.set(-13, 5, -2);
    smallTorus.rotation.x = Math.PI / 4;
    mainGroup.add(smallTorus);

    // 4. Subtle Floating Particle Points
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      scales[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x714b67,
      size: 0.18,
      transparent: true,
      opacity: 0.55,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // Mouse Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 2;
      targetMouseY = y * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Group rotation based on mouse
      mainGroup.rotation.y = currentMouseX * 0.18;
      mainGroup.rotation.x = -currentMouseY * 0.12;

      // Gentle floating oscillations
      sphere1.position.y = 3 + Math.sin(elapsedTime * 0.8) * 0.5;
      sphere2.position.y = 4 + Math.cos(elapsedTime * 0.7) * 0.6;
      sphere3.position.y = -8 + Math.sin(elapsedTime * 0.9 + 1) * 0.4;
      sphere4.position.y = -7 + Math.cos(elapsedTime * 0.6 + 2) * 0.3;

      torus.rotation.x += 0.005;
      torus.rotation.y += 0.008;
      smallTorus.rotation.y += 0.007;

      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
