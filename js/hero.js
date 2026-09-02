/* ==========================================================================
   PURPLE RIBBONS BY AMY — Hero Section with Three.js Ribbon
   ========================================================================== */

import * as THREE from 'three';
import { lerp, clamp, checkReducedMotion } from './utils.js';

/**
 * Initialize the hero section with 3D ribbon
 * @param {boolean} prefersReducedMotion - Whether user prefers reduced motion
 */
export function initHero(prefersReducedMotion) {
  const canvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('hero');

  if (!canvas || !heroSection) return;

  // Scene setup
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  // ==========================================
  // RIBBON GEOMETRY - Custom hand-authored curve
  // ==========================================

  // Create the base curve for the ribbon - a twisting sine wave in 3D space
  function createRibbonCurve() {
    const curve = new THREE.CatmullRomCurve3([]);
    const points = [];
    const segments = 120;
    const length = 12;
    const amplitude = 1.8;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const u = t * Math.PI * 4; // 2 full waves

      // Base sine wave
      const x = Math.sin(u) * amplitude * 0.7;
      const y = Math.cos(u * 0.5) * amplitude * 0.5 + Math.sin(u * 1.3) * 0.4;
      const z = (t - 0.5) * length;

      // Add twisting - rotate the cross-section as we go along
      const twist = u * 1.5;

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  }

  const baseCurve = createRibbonCurve();

  // Create ribbon geometry using the curve
  function createRibbonGeometry(curve, width, segments = 120, edgeSegments = 8) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    // Calculate frames along the curve for consistent orientation
    const frames = curve.computeFrenetFrames(segments, true);
    const tangents = frames.tangents;
    const normals_ = frames.normals;
    const binormals = frames.binormals;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPoint(t);
      const tangent = tangents[i];
      const normal = normals_[i];
      const binormal = binormals[i];

      // Create edge loop (thin rectangle cross-section)
      for (let j = 0; j <= edgeSegments; j++) {
        const edgeAngle = (j / edgeSegments) * Math.PI * 2;
        // Make it a flat ribbon - wider in normal direction, thinner in binormal
        const edgeNormal = Math.cos(edgeAngle);
        const edgeBinormal = Math.sin(edgeAngle) * 0.15; // Flat ribbon

        const offset = normal.clone().multiplyScalar(edgeNormal * width).add(
          binormal.clone().multiplyScalar(edgeBinormal * width)
        );

        const vertex = point.clone().add(offset);
        positions.push(vertex.x, vertex.y, vertex.z);

        // Normal points outward
        const vertexNormal = offset.clone().normalize();
        normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);

        uvs.push(t, j / edgeSegments);
      }
    }

    // Generate indices
    const vertsPerRing = edgeSegments + 1;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < edgeSegments; j++) {
        const a = i * vertsPerRing + j;
        const b = i * vertsPerRing + j + 1;
        const c = (i + 1) * vertsPerRing + j;
        const d = (i + 1) * vertsPerRing + j + 1;

        indices.push(a, b, d);
        indices.push(d, c, a);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeBoundingSphere();

    return geometry;
  }

  // ==========================================
  // MATERIALS
  // ==========================================

  // Main ribbon body - royal purple with metalness, clearcoat, gold sheen
  const ribbonMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3D1766,
    metalness: 0.45,
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
    sheen: 0.8,
    sheenColor: 0xC9A15C,
    sheenRoughness: 0.3,
    side: THREE.DoubleSide,
  });

  // Gold trim - thinner, brighter gold
  const trimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xE8C77E,
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  });

  // Create ribbon meshes
  const ribbonGeometry = createRibbonGeometry(baseCurve, 0.35);
  const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
  scene.add(ribbonMesh);

  // Trim geometry - slightly offset outward
  const trimGeometry = createRibbonGeometry(baseCurve, 0.42);
  const trimMesh = new THREE.Mesh(trimGeometry, trimMaterial);
  scene.add(trimMesh);

  // Store for animation
  const ribbonMeshes = [ribbonMesh, trimMesh];
  const ribbonGeometries = [ribbonGeometry, trimGeometry];
  const baseCurveRef = baseCurve;

  // ==========================================
  // LIGHTING
  // ==========================================

  // Gold directional key light (warm, from upper right)
  const keyLight = new THREE.DirectionalLight(0xE8C77E, 2.5);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = false;
  scene.add(keyLight);

  // Purple point light for fill (from left)
  const fillLight = new THREE.PointLight(0x6B3FA0, 1.5, 20);
  fillLight.position.set(-6, 2, 3);
  scene.add(fillLight);

  // Gold rim light (from behind/below)
  const rimLight = new THREE.PointLight(0xC9A15C, 1.8, 20);
  rimLight.position.set(2, -4, -5);
  scene.add(rimLight);

  // Low ambient purple light
  const ambientLight = new THREE.AmbientLight(0x3D1766, 0.4);
  scene.add(ambientLight);

  // Subtle hemisphere light for sky/ground color variation
  const hemiLight = new THREE.HemisphereLight(0x6B3FA0, 0x0D0512, 0.3);
  scene.add(hemiLight);

  // ==========================================
  // ANIMATION STATE
  // ==========================================

  const state = {
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scrollProgress: 0,
    prefersReducedMotion,
    time: 0,
  };

  // Visibility state for pausing rAF
  let isVisible = true;
  let animationFrameId = null;

  // Mouse move handler for parallax
  function onMouseMove(event) {
    if (prefersReducedMotion) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    state.targetMouseX = x * 0.15; // Max rotation ~0.15 rad
    state.targetMouseY = y * 0.1;
  }

  // Scroll handler
  function onScroll() {
    const rect = heroSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Progress: 0 when hero top at viewport bottom, 1 when hero bottom at viewport top
    const progress = clamp((windowHeight - rect.top) / (windowHeight + rect.height), 0, 1);
    state.scrollProgress = progress;
  }

  // Event listeners
  if (!prefersReducedMotion) {
    document.addEventListener('mousemove', onMouseMove, { passive: true });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Handle reduced motion change
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function handleReducedMotionChange(e) {
    state.prefersReducedMotion = e.matches;
  }
  mediaQuery.addEventListener('change', handleReducedMotionChange);

  // ==========================================
  // VISIBILITY OBSERVER - Pause rAF when off-screen
  // ==========================================

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
      // If not visible, the current frame completes but doesn't schedule next
    });
  }, { rootMargin: '100px', threshold: 0.01 });

  heroObserver.observe(heroSection);

  // Pause on page visibility change
  function handleVisibilityChange() {
    if (document.hidden) {
      isVisible = false;
    } else if (isHeroInViewport()) {
      isVisible = true;
      if (!animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);

  function isHeroInViewport() {
    const rect = heroSection.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  // ==========================================
  // ANIMATION LOOP
  // ==========================================

  let lastTime = 0;

  function animate(time) {
    animationFrameId = null; // Clear ID so observer can restart

    if (!isVisible) return; // Exit early, don't schedule next

    animationFrameId = requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    state.time += deltaTime;

    // Smooth mouse follow (easing)
    if (!state.prefersReducedMotion) {
      state.mouseX = lerp(state.mouseX, state.targetMouseX, 0.05);
      state.mouseY = lerp(state.mouseY, state.targetMouseY, 0.05);
    } else {
      state.mouseX = 0;
      state.mouseY = 0;
    }

    // Apply mouse parallax to ribbon group
    const parallaxX = state.mouseX;
    const parallaxY = state.mouseY;

    ribbonMeshes.forEach(mesh => {
      mesh.rotation.y = parallaxX;
      mesh.rotation.x = parallaxY;
    });

    // Scroll-driven animation: unfurl, rotate away, scale down, drift up
    const scroll = state.scrollProgress;
    const scrollEased = scroll * scroll * (3 - 2 * scroll); // Smoothstep

    ribbonMeshes.forEach(mesh => {
      // Unfurl - rotate around X axis as we scroll
      mesh.rotation.x += scrollEased * 0.8;

      // Rotate away - additional Y rotation
      mesh.rotation.y += scrollEased * 0.5;

      // Scale down
      const scale = 1 - scrollEased * 0.4;
      mesh.scale.setScalar(scale);

      // Drift upward
      mesh.position.y = scrollEased * 3;
    });

    renderer.render(scene, camera);
  }

  // Handle resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);

  // Start animation
  requestAnimationFrame(animate);

  // Cleanup function (for potential future use)
  function cleanup() {
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    mediaQuery.removeEventListener('change', handleReducedMotionChange);
    heroObserver.disconnect();

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Dispose Three.js resources
    ribbonGeometries.forEach(g => g.dispose());
    ribbonMaterial.dispose();
    trimMaterial.dispose();
    renderer.dispose();
  }

  // Return cleanup for potential SPA navigation
  return cleanup;
}