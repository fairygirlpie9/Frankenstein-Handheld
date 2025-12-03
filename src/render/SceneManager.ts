/**
 * SceneManager - Manages the three.js 3D scene, model loading, and mesh animations
 * Following Mad Scientist Style Guide conventions
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import { InteractiveMesh, InputAction } from '../config/types';
import { INTERACTIVE_MESHES } from '../config/constants';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private interactiveMeshes: Map<string, InteractiveMesh>;
  private gltfLoader: GLTFLoader;
  
  // Named mesh references from franken.glb
  private screenMesh?: THREE.Mesh;
  private boltLeftMesh?: THREE.Mesh;
  private boltRightMesh?: THREE.Mesh;
  private eyeLeftMesh?: THREE.Mesh;
  private eyeRightMesh?: THREE.Mesh;
  private eyebrowsMesh?: THREE.Mesh;
  private topStitchesMesh?: THREE.Mesh;
  private joystickMesh?: THREE.Mesh;
  private buttonStartMesh?: THREE.Mesh;
  private modelRoot?: THREE.Object3D;
  private glowerMesh?: THREE.Mesh;
  
  // Animation state
  private topStitchesAnimation?: TWEEN.Tween<any>;
  private itsAliveAnimation?: TWEEN.Tween<any>;
  private idleAnimation?: TWEEN.Tween<any>;
  private glowerAnimation?: TWEEN.Tween<any>;
  private backgroundFlashInterval?: number;
  private buttonStartAnimation?: TWEEN.Tween<any>;
  private buttonAAnimation?: TWEEN.Tween<any>;
  private buttonBAnimation?: TWEEN.Tween<any>;
  private dpadAnimation?: TWEEN.Tween<any>;
  private defaultMeshStates: Map<string, {
    position: THREE.Vector3;
    emissiveIntensity?: number;
  }>;
  
  // Particle system
  private particleSystem?: THREE.Points;
  private particleGeometry?: THREE.BufferGeometry;
  private particleMaterial?: THREE.PointsMaterial;
  private particleVelocities: Float32Array;
  private particleType: 'electric' | 'explosion' | 'success' | null = null;
  private particleLifetimes: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.interactiveMeshes = new Map();
    this.defaultMeshStates = new Map();
    this.gltfLoader = new GLTFLoader();
    this.particleVelocities = new Float32Array(0);
    this.particleLifetimes = new Float32Array(0);
    
    // Initialize scene with gradient background
    this.scene = new THREE.Scene();
    
    // Create eerie gradient background (purple to dark green)
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 512;
    canvas2d.height = 512;
    const ctx = canvas2d.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#0d0028'); // Darker purple top
      gradient.addColorStop(1, '#11000e'); // Darker magenta bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      const bgTexture = new THREE.CanvasTexture(canvas2d);
      this.scene.background = bgTexture;
    } else {
      this.scene.background = new THREE.Color(0x1a1a1a);
    }
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2.5);
    this.camera.lookAt(0, 0, 0);
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Handle WebGL context loss
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost - attempting to restore');
    });
    
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Renderer will automatically handle restoration
    });
    
    // Setup lighting
    this.setupLighting();
  }

  /**
   * Setup scene lighting with eerie atmosphere
   */
  private setupLighting(): void {
    // Eerie green ambient light
    const ambientLight = new THREE.AmbientLight(0x00ff44, 0.3);
    this.scene.add(ambientLight);
    
    // Main key light with slight green tint
    const keyLight = new THREE.DirectionalLight(0xaaffaa, 1.2);
    keyLight.position.set(3, 4, 5);
    this.scene.add(keyLight);
    
    // Purple/blue rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x6600ff, 0.6);
    rimLight.position.set(-3, 2, -4);
    this.scene.add(rimLight);
    
    // Subtle orange fill from below for Frankenstein lab feel
    const fillLight = new THREE.DirectionalLight(0xff6600, 0.2);
    fillLight.position.set(0, -2, 2);
    this.scene.add(fillLight);
    
    // Add hemisphere light for gradient sky effect
    const hemiLight = new THREE.HemisphereLight(0x00ff88, 0x330066, 0.4);
    this.scene.add(hemiLight);
    
    // Flat white area lights for better visibility
    const areaLight1 = new THREE.RectAreaLight(0xffffff, 2, 4, 4);
    areaLight1.position.set(0, 3, 3);
    areaLight1.lookAt(0, 0, 0);
    this.scene.add(areaLight1);
    
    const areaLight2 = new THREE.RectAreaLight(0xffffff, 1.5, 3, 3);
    areaLight2.position.set(-3, 2, 0);
    areaLight2.lookAt(0, 0, 0);
    this.scene.add(areaLight2);
  }

  /**
   * LOAD_MODEL - Load the franken.glb model and extract named meshes
   * Following SCREAMING_SNAKE_CASE convention for core functions
   */
  async LOAD_MODEL(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf: any) => {
          // Add model to scene
          this.scene.add(gltf.scene);
          this.modelRoot = gltf.scene;
          
          // Extract and store references to named meshes
          this.extractNamedMeshes(gltf.scene);
          
          // Add simple body mesh
          this.createBodyMesh();
          
          // Store default states for animations
          this.storeDefaultStates();
          
          // Position camera to show entire console
          this.positionCamera(gltf.scene);
          
          resolve();
        },
        undefined,
        (error: any) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Extract named meshes from the loaded model
   */
  private extractNamedMeshes(scene: THREE.Object3D): void {
    scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase();
        console.log('Found mesh:', child.name); // Debug: log all meshes
        
        // Store screen mesh (exact match)
        if (meshName === 'screen') {
          this.screenMesh = child;
          console.log('Found screen mesh:', child.name);
        }
        
        // Store bolt meshes
        if (meshName.includes('bolt')) {
          if (meshName.includes('left')) {
            this.boltLeftMesh = child;
          } else if (meshName.includes('right')) {
            this.boltRightMesh = child;
          }
        }
        
        // Store eye meshes
        if (meshName.includes('eye')) {
          if (meshName.includes('left')) {
            this.eyeLeftMesh = child;
          } else if (meshName.includes('right')) {
            this.eyeRightMesh = child;
          }
        }
        
        // Store eyebrows mesh
        if (meshName.includes('eyebrows') || meshName.includes('eyebrow')) {
          this.eyebrowsMesh = child;
          console.log('Found eyebrows mesh:', child.name);
        }
        
        // Store top_stitches mesh
        if (meshName.includes('top_stitches') || meshName.includes('topstitches')) {
          this.topStitchesMesh = child;
          console.log('Found top_stitches mesh:', child.name);
        }
        
        // Store glower mesh
        if (meshName === 'glower' || meshName.includes('glower')) {
          this.glowerMesh = child;
          console.log('Found glower mesh:', child.name);
        }

        // Store joystick mesh
        if (meshName === 'new_stick' || meshName === 'jpy' || meshName === 'joystick' || meshName === 'joystick_empty') {
          this.joystickMesh = child;
          console.log('Found joystick mesh:', child.name);
        }
        
        // Store button_start mesh
        if (meshName === 'button_start' || meshName.includes('button_start')) {
          this.buttonStartMesh = child;
          console.log('Found button_start mesh:', child.name);
        }
        
        // Store interactive meshes
        for (const interactiveMesh of INTERACTIVE_MESHES) {
          if (meshName.includes(interactiveMesh.meshId.toLowerCase())) {
            const meshCopy = { ...interactiveMesh, mesh: child };
            this.interactiveMeshes.set(interactiveMesh.meshId, meshCopy);
          }
        }
      }
    });
    
    // Try direct search for joystick if not found in traverse
    if (!this.joystickMesh) {
      const joystickMesh = scene.getObjectByName('new_stick') || scene.getObjectByName('jpy');
      if (joystickMesh && joystickMesh instanceof THREE.Mesh) {
        this.joystickMesh = joystickMesh;
        console.log('Found joystick mesh via getObjectByName:', joystickMesh.name);
      }
    }
    
    // Log warnings for missing meshes
    if (!this.screenMesh) console.warn('Screen mesh not found in model');
    if (!this.boltLeftMesh || !this.boltRightMesh) console.warn('Bolt meshes not found in model');
    if (!this.eyeLeftMesh || !this.eyeRightMesh) console.warn('Eye meshes not found in model');
    if (!this.eyebrowsMesh) console.warn('Eyebrows mesh not found in model');
    if (!this.topStitchesMesh) console.warn('Top stitches mesh not found in model');
    if (!this.joystickMesh) console.warn('Joystick mesh not found in model');
    if (!this.glowerMesh) console.warn('Glower mesh not found in model');
    
    // Start glower pulsing animation if mesh exists
    if (this.glowerMesh) {
      this.START_GLOWER_PULSE();
    }
  }

  /**
   * Store default states of meshes for animation reset
   */
  private storeDefaultStates(): void {
    // Store bolt positions
    if (this.boltLeftMesh) {
      this.defaultMeshStates.set('bolt_left', {
        position: this.boltLeftMesh.position.clone()
      });
    }
    if (this.boltRightMesh) {
      this.defaultMeshStates.set('bolt_right', {
        position: this.boltRightMesh.position.clone()
      });
    }
    
    // Store eye emissive intensity and color
    if (this.eyeLeftMesh && this.eyeLeftMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.eyeLeftMesh.material;
      this.defaultMeshStates.set('eye_left', {
        position: this.eyeLeftMesh.position.clone(),
        emissiveIntensity: material.emissiveIntensity
      });
      // Store original emissive color in material userData
      material.userData.originalEmissive = material.emissive.getHex();
    }
    if (this.eyeRightMesh && this.eyeRightMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.eyeRightMesh.material;
      this.defaultMeshStates.set('eye_right', {
        position: this.eyeRightMesh.position.clone(),
        emissiveIntensity: material.emissiveIntensity
      });
      // Store original emissive color in material userData
      material.userData.originalEmissive = material.emissive.getHex();
    }
    

    if (this.eyebrowsMesh) {
      this.defaultMeshStates.set('eyebrows', {
        position: this.eyebrowsMesh.position.clone()
      });
    }

    if (this.topStitchesMesh && this.topStitchesMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.topStitchesMesh.material;
      material.userData.originalEmissive = material.emissive.getHex();
      this.defaultMeshStates.set('top_stitches', {
        position: this.topStitchesMesh.position.clone(),
        emissiveIntensity: material.emissiveIntensity
      });
    }

    // Store joystick rotation
    if (this.joystickMesh) {
      this.defaultMeshStates.set('joystick', {
        position: this.joystickMesh.position.clone()
      });
    }
    
    // Store button_start position
    if (this.buttonStartMesh) {
      this.defaultMeshStates.set('button_start', {
        position: this.buttonStartMesh.position.clone()
      });
    }
    
    // Store button A and B positions
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase();
        if (meshName === 'button_a' || meshName.includes('button_a')) {
          this.defaultMeshStates.set('button_a', {
            position: child.position.clone()
          });
        } else if (meshName === 'button_b' || meshName.includes('button_b')) {
          this.defaultMeshStates.set('button_b', {
            position: child.position.clone()
          });
        } else if (meshName.includes('dpad') || meshName.includes('d-pad') || meshName.includes('cross')) {
          this.defaultMeshStates.set('dpad', {
            position: child.position.clone()
          });
        }
      }
    });
    
    // Store glower emissive intensity
    if (this.glowerMesh && this.glowerMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.glowerMesh.material;
      this.defaultMeshStates.set('glower', {
        position: this.glowerMesh.position.clone(),
        emissiveIntensity: material.emissiveIntensity
      });
      material.userData.originalEmissive = material.emissive.getHex();
    }
  }

  /**
   * Position camera to show entire console clearly
   */
  private positionCamera(model: THREE.Object3D): void {
    // Calculate bounding box of the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate camera distance to fit entire model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Add some padding
    cameraZ *= 1.5;
    
    // Position camera
    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Get mesh by ID
   */
  getMesh(meshId: string): THREE.Mesh | undefined {
    // Check special meshes first
    if (meshId === 'screen') return this.screenMesh;
    if (meshId === 'bolt_left') return this.boltLeftMesh;
    if (meshId === 'bolt_right') return this.boltRightMesh;
    if (meshId === 'eye_left') return this.eyeLeftMesh;
    if (meshId === 'eye_right') return this.eyeRightMesh;
    if (meshId === 'joystick') return this.joystickMesh;
    
    // Check interactive meshes
    const interactiveMesh = this.interactiveMeshes.get(meshId);
    return interactiveMesh?.mesh;
  }

  /**
   * Get all interactive meshes
   */
  getInteractiveMeshes(): InteractiveMesh[] {
    return Array.from(this.interactiveMeshes.values());
  }

  /**
   * Get screen mesh for texture mapping
   */
  getScreenMesh(): THREE.Mesh | undefined {
    return this.screenMesh;
  }

  /**
   * Render the scene
   */
  render(): void {
    // Update all tweens
    TWEEN.update();
    
    // Update particles if active
    if (this.particleSystem) {
      this.UPDATE_PARTICLES();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Get scene for raycasting
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get camera for raycasting
   */
  getCamera(): THREE.Camera {
    return this.camera;
  }

  /**
   * ANIMATE_BOLTS - Shake bolt meshes for incorrect action feedback
   * Following SCREAMING_SNAKE_CASE convention for core functions
   */
  ANIMATE_BOLTS(duration: number = 300): void {
    const shakeIntensity = 0.08; // 4x more intense shake!
    
    // Animate left bolt
    if (this.boltLeftMesh) {
      const defaultPos = this.defaultMeshStates.get('bolt_left')?.position;
      if (defaultPos) {
        // Shake animation with multiple keyframes
        new TWEEN.Tween(this.boltLeftMesh.position)
          .to({ x: defaultPos.x + shakeIntensity }, duration / 6)
          .chain(
            new TWEEN.Tween(this.boltLeftMesh.position)
              .to({ x: defaultPos.x - shakeIntensity }, duration / 6)
              .chain(
                new TWEEN.Tween(this.boltLeftMesh.position)
                  .to({ x: defaultPos.x + shakeIntensity }, duration / 6)
                  .chain(
                    new TWEEN.Tween(this.boltLeftMesh.position)
                      .to({ x: defaultPos.x - shakeIntensity }, duration / 6)
                      .chain(
                        new TWEEN.Tween(this.boltLeftMesh.position)
                          .to({ x: defaultPos.x + shakeIntensity / 2 }, duration / 6)
                          .chain(
                            new TWEEN.Tween(this.boltLeftMesh.position)
                              .to({ x: defaultPos.x, y: defaultPos.y, z: defaultPos.z }, duration / 6)
                          )
                      )
                  )
              )
          )
          .start();
      }
    }
    
    // Animate right bolt
    if (this.boltRightMesh) {
      const defaultPos = this.defaultMeshStates.get('bolt_right')?.position;
      if (defaultPos) {
        // Shake animation with multiple keyframes (opposite phase)
        new TWEEN.Tween(this.boltRightMesh.position)
          .to({ x: defaultPos.x - shakeIntensity }, duration / 6)
          .chain(
            new TWEEN.Tween(this.boltRightMesh.position)
              .to({ x: defaultPos.x + shakeIntensity }, duration / 6)
              .chain(
                new TWEEN.Tween(this.boltRightMesh.position)
                  .to({ x: defaultPos.x - shakeIntensity }, duration / 6)
                  .chain(
                    new TWEEN.Tween(this.boltRightMesh.position)
                      .to({ x: defaultPos.x + shakeIntensity }, duration / 6)
                      .chain(
                        new TWEEN.Tween(this.boltRightMesh.position)
                          .to({ x: defaultPos.x - shakeIntensity / 2 }, duration / 6)
                          .chain(
                            new TWEEN.Tween(this.boltRightMesh.position)
                              .to({ x: defaultPos.x, y: defaultPos.y, z: defaultPos.z }, duration / 6)
                          )
                      )
                  )
              )
          )
          .start();
      }
    }
  }

  /**
   * ANIMATE_EYES - Make eye meshes glow for incorrect action feedback
   * Following SCREAMING_SNAKE_CASE convention for core functions
   */
  ANIMATE_EYES(intensity: number = 5.0, duration: number = 500): void {
    // Animate left eye
    if (this.eyeLeftMesh && this.eyeLeftMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.eyeLeftMesh.material;
      const defaultIntensity = this.defaultMeshStates.get('eye_left')?.emissiveIntensity ?? 0;
      const originalEmissive = material.userData.originalEmissive ?? 0x000000;
      
      // Set emissive color to bright red for angry glow
      material.emissive.setHex(0xff0000);
      
      // Glow up then return to default
      new TWEEN.Tween({ intensity: material.emissiveIntensity })
        .to({ intensity }, duration / 2)
        .onUpdate((obj: any) => {
          material.emissiveIntensity = obj.intensity;
        })
        .chain(
          new TWEEN.Tween({ intensity })
            .to({ intensity: defaultIntensity }, duration / 2)
            .onUpdate((obj: any) => {
              material.emissiveIntensity = obj.intensity;
            })
            .onComplete(() => {
              // Reset emissive color back to original
              material.emissive.setHex(originalEmissive);
            })
        )
        .start();
    }
    
    // Animate right eye
    if (this.eyeRightMesh && this.eyeRightMesh.material instanceof THREE.MeshStandardMaterial) {
      const material = this.eyeRightMesh.material;
      const defaultIntensity = this.defaultMeshStates.get('eye_right')?.emissiveIntensity ?? 0;
      const originalEmissive = material.userData.originalEmissive ?? 0x000000;
      
      // Set emissive color to bright red for angry glow
      material.emissive.setHex(0xff0000);
      
      // Glow up then return to default
      new TWEEN.Tween({ intensity: material.emissiveIntensity })
        .to({ intensity }, duration / 2)
        .onUpdate((obj: any) => {
          material.emissiveIntensity = obj.intensity;
        })
        .chain(
          new TWEEN.Tween({ intensity })
            .to({ intensity: defaultIntensity }, duration / 2)
            .onUpdate((obj: any) => {
              material.emissiveIntensity = obj.intensity;
            })
            .onComplete(() => {
              // Reset emissive color back to original
              material.emissive.setHex(originalEmissive);
            })
        )
        .start();
    }
  }

  /**
  /**
   * ANIMATE_TOP_STITCHES - Make top stitches glow red when eyes are red
   */
  ANIMATE_TOP_STITCHES(intensity: number = 5.0, duration: number = 500): void {
    if (!this.topStitchesMesh || !(this.topStitchesMesh.material instanceof THREE.MeshStandardMaterial)) {
      return;
    }
    
    const material = this.topStitchesMesh.material;
    const defaultIntensity = this.defaultMeshStates.get('top_stitches')?.emissiveIntensity ?? 0;
    const originalEmissive = material.userData.originalEmissive ?? 0x000000;
    
    // Set emissive color to bright red matching the eyes
    material.emissive.setHex(0xff0000);
    
    // Glow up then return to default
    new TWEEN.Tween({ intensity: material.emissiveIntensity })
      .to({ intensity }, duration / 2)
      .onUpdate((obj: any) => {
        material.emissiveIntensity = obj.intensity;
      })
      .chain(
        new TWEEN.Tween({ intensity })
          .to({ intensity: defaultIntensity }, duration / 2)
          .onUpdate((obj: any) => {
            material.emissiveIntensity = obj.intensity;
          })
          .onComplete(() => {
            // Reset emissive color back to original
            material.emissive.setHex(originalEmissive);
          })
      )
      .start();
  }

  /**
   * ANIMATE_EYEBROWS - Raise eyebrows at the end of each level (twice)
   */
  ANIMATE_EYEBROWS(duration: number = 800): void {
    if (!this.eyebrowsMesh) {
      console.warn('Eyebrows mesh not found');
      return;
    }
    
    const defaultPos = this.defaultMeshStates.get('eyebrows')?.position;
    if (!defaultPos) {
      console.warn('No default position stored for eyebrows');
      return;
    }
    
    const raiseAmount = 0.05; // Raise by 5cm
    
    // First raise
    const raise1 = new TWEEN.Tween(this.eyebrowsMesh.position)
      .to({ y: defaultPos.y + raiseAmount }, duration / 4)
      .easing(TWEEN.Easing.Quadratic.Out);
    
    const lower1 = new TWEEN.Tween(this.eyebrowsMesh.position)
      .to({ y: defaultPos.y }, duration / 4)
      .easing(TWEEN.Easing.Quadratic.In)
      .delay(200);
    
    // Second raise
    const raise2 = new TWEEN.Tween(this.eyebrowsMesh.position)
      .to({ y: defaultPos.y + raiseAmount }, duration / 4)
      .easing(TWEEN.Easing.Quadratic.Out)
      .delay(100);
    
    const lower2 = new TWEEN.Tween(this.eyebrowsMesh.position)
      .to({ y: defaultPos.y }, duration / 4)
      .easing(TWEEN.Easing.Quadratic.In)
      .delay(200);
    
    // Chain animations
    raise1.chain(lower1);
    lower1.chain(raise2);
    raise2.chain(lower2);
    
    raise1.start();
  }

  /**
   * ANIMATE_TOP_STITCHES_CONTINUOUS - Continuous glow for top_stitches mesh
   */
  ANIMATE_TOP_STITCHES_CONTINUOUS(): void {
    if (!this.topStitchesMesh || !(this.topStitchesMesh.material instanceof THREE.MeshStandardMaterial)) {
      console.warn('Top stitches mesh not found or invalid material');
      return;
    }
    
    const material = this.topStitchesMesh.material;
    const defaultIntensity = material.emissiveIntensity || 0;
    const glowIntensity = 3.5;
    const duration = 1000;
    
    // Set emissive color to bright lime green
    material.emissive.setHex(0x88ff00);
    
    // Stop existing animation if any
    if (this.topStitchesAnimation) {
      this.topStitchesAnimation.stop();
    }
    
    // Create glowing animation that loops
    const glowUp = new TWEEN.Tween(material)
      .to({ emissiveIntensity: glowIntensity }, duration / 2)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const glowDown = new TWEEN.Tween(material)
      .to({ emissiveIntensity: defaultIntensity }, duration / 2)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    // Chain animations to loop
    glowUp.chain(glowDown);
    glowDown.chain(glowUp);
    
    // Store reference and start
    this.topStitchesAnimation = glowUp;
    glowUp.start();
  }

  /**
   * STOP_TOP_STITCHES_ANIMATION - Stop the continuous top stitches glow
   */
  STOP_TOP_STITCHES_ANIMATION(): void {
    if (this.topStitchesAnimation) {
      this.topStitchesAnimation.stop();
      this.topStitchesAnimation = undefined;
    }
  }

  /**
   * ANIMATE_JOYSTICK - Tilt joystick in direction of input action
   * Following SCREAMING_SNAKE_CASE convention for core functions
   */
  ANIMATE_JOYSTICK(action: InputAction, duration: number = 200): void {
    if (!this.joystickMesh) return;
    
    const defaultPos = this.defaultMeshStates.get('joystick')?.position;
    if (!defaultPos) return;
    
    const moveAmount = 0.04; // Move by 4cm (doubled)
    let targetX = defaultPos.x;
    let targetY = defaultPos.y;
    
    // Determine movement direction based on input action
    switch (action) {
      case InputAction.JOYSTICK_UP:
        targetY = defaultPos.y + moveAmount;
        break;
      case InputAction.JOYSTICK_DOWN:
        targetY = defaultPos.y - moveAmount;
        break;
      case InputAction.JOYSTICK_LEFT:
        targetX = defaultPos.x - moveAmount;
        break;
      case InputAction.JOYSTICK_RIGHT:
        targetX = defaultPos.x + moveAmount;
        break;
      default:
        // Not a joystick action, return without animating
        return;
    }
    
    // Animate movement to target position
    new TWEEN.Tween(this.joystickMesh.position)
      .to({ x: targetX, y: targetY }, duration / 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(
        // Return to center position
        new TWEEN.Tween(this.joystickMesh.position)
          .to({ x: defaultPos.x, y: defaultPos.y }, duration / 2)
          .easing(TWEEN.Easing.Quadratic.In)
      )
      .start();
  }

  // Frankenstein sprite references
  private frankensteinSprite?: THREE.Sprite;
  private frankensteinTextures: {
    calm?: THREE.Texture;
    angry?: THREE.Texture;
    alive?: THREE.Texture;
  } = {};

  /**
   * ANIMATE_BUTTON_START - Animate nose/start button press with glow
   */
  ANIMATE_BUTTON_START(duration: number = 1000): void {
    if (!this.buttonStartMesh) {
      console.warn('Button start mesh not found');
      return;
    }
    
    const defaultPos = this.defaultMeshStates.get('button_start')?.position;
    if (!defaultPos) {
      console.warn('No default position stored for button_start');
      return;
    }
    
    // Stop any existing animation and reset position immediately
    if (this.buttonStartAnimation) {
      this.buttonStartAnimation.stop();
      this.buttonStartMesh.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
    }
    
    const pressDepth = 0.02; // Press in by 2cm
    
    // Press button in
    const pressIn = new TWEEN.Tween(this.buttonStartMesh.position)
      .to({ z: defaultPos.z - pressDepth }, 100)
      .easing(TWEEN.Easing.Quadratic.In)
      .chain(
        // Hold pressed
        new TWEEN.Tween(this.buttonStartMesh.position)
          .to({ z: defaultPos.z - pressDepth }, duration - 200)
          .chain(
            // Release button
            new TWEEN.Tween(this.buttonStartMesh.position)
              .to({ x: defaultPos.x, y: defaultPos.y, z: defaultPos.z }, 100)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onComplete(() => {
                this.buttonStartAnimation = undefined;
              })
          )
      );
    
    this.buttonStartAnimation = pressIn;
    pressIn.start();
  }

  /**
   * ANIMATE_BUTTON - Animate button A or B press
   */
  ANIMATE_BUTTON(action: InputAction, duration: number = 200): void {
    let buttonMesh: THREE.Mesh | undefined;
    let buttonKey: string | undefined;
    let animationRef: 'buttonAAnimation' | 'buttonBAnimation' | undefined;
    
    // Find the correct button mesh
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase();
        if (action === InputAction.BUTTON_A && (meshName === 'button_a' || meshName.includes('button_a'))) {
          buttonMesh = child;
          buttonKey = 'button_a';
          animationRef = 'buttonAAnimation';
        } else if (action === InputAction.BUTTON_B && (meshName === 'button_b' || meshName.includes('button_b'))) {
          buttonMesh = child;
          buttonKey = 'button_b';
          animationRef = 'buttonBAnimation';
        }
      }
    });
    
    if (!buttonMesh || !buttonKey || !animationRef) {
      console.warn('Button mesh not found for action:', action);
      return;
    }
    
    const defaultPos = this.defaultMeshStates.get(buttonKey)?.position;
    if (!defaultPos) {
      console.warn('No default position stored for', buttonKey);
      return;
    }
    
    // Stop any existing animation and reset position
    if (this[animationRef]) {
      this[animationRef]!.stop();
      buttonMesh.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
    }
    
    const pressDepth = 0.02; // Press in by 2cm
    
    // Press button in
    const pressIn = new TWEEN.Tween(buttonMesh.position)
      .to({ z: defaultPos.z - pressDepth }, duration / 2)
      .easing(TWEEN.Easing.Quadratic.In)
      .chain(
        // Release button
        new TWEEN.Tween(buttonMesh.position)
          .to({ x: defaultPos.x, y: defaultPos.y, z: defaultPos.z }, duration / 2)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => {
            this[animationRef!] = undefined;
          })
      );
    
    this[animationRef] = pressIn;
    pressIn.start();
  }

  /**
   * ANIMATE_DPAD - Animate d-pad direction press
   */
  ANIMATE_DPAD(action: InputAction, duration: number = 150): void {
    let dpadMesh: THREE.Mesh | undefined;
    
    // Find the d-pad mesh
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase();
        if (meshName.includes('dpad') || meshName.includes('d-pad') || meshName.includes('cross')) {
          dpadMesh = child;
        }
      }
    });
    
    if (!dpadMesh) {
      console.warn('D-pad mesh not found');
      return;
    }
    
    const defaultPos = this.defaultMeshStates.get('dpad')?.position;
    if (!defaultPos) {
      console.warn('No default position stored for dpad');
      return;
    }
    
    // Stop any existing animation and reset position
    if (this.dpadAnimation) {
      this.dpadAnimation.stop();
      dpadMesh.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
    }
    
    const moveAmount = 0.015; // Move by 1.5cm
    let targetX = defaultPos.x;
    let targetY = defaultPos.y;
    
    // Determine movement direction
    switch (action) {
      case InputAction.DPAD_UP:
        targetY = defaultPos.y + moveAmount;
        break;
      case InputAction.DPAD_DOWN:
        targetY = defaultPos.y - moveAmount;
        break;
      case InputAction.DPAD_LEFT:
        targetX = defaultPos.x - moveAmount;
        break;
      case InputAction.DPAD_RIGHT:
        targetX = defaultPos.x + moveAmount;
        break;
      default:
        return;
    }
    
    // Animate movement
    const moveOut = new TWEEN.Tween(dpadMesh.position)
      .to({ x: targetX, y: targetY }, duration / 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(
        // Return to center
        new TWEEN.Tween(dpadMesh.position)
          .to({ x: defaultPos.x, y: defaultPos.y, z: defaultPos.z }, duration / 2)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(() => {
            this.dpadAnimation = undefined;
          })
      );
    
    this.dpadAnimation = moveOut;
    moveOut.start();
  }

  /**
   * Create 2D billboard sprites for Frankenstein patient and surgeon
   */
  private createBodyMesh(): void {
    this.loadFrankensteinTextures();
  }

  /**
   * Load Frankenstein sprite textures
   */
  private loadFrankensteinTextures(): void {
    const textureLoader = new THREE.TextureLoader();
    
    // Load all three states
    textureLoader.load('/assets/frankenstein-calm.png', (texture) => {
      this.frankensteinTextures.calm = texture;
      this.createFrankensteinSprite();
      console.log('Frankenstein calm texture loaded');
    });
    
    textureLoader.load('/assets/frankenstein-angry.png', (texture) => {
      this.frankensteinTextures.angry = texture;
      console.log('Frankenstein angry texture loaded');
    });
    
    textureLoader.load('/assets/frankenstein-alive.png', (texture) => {
      this.frankensteinTextures.alive = texture;
      console.log('Frankenstein alive texture loaded');
    });
  }

  /**
   * Create Frankenstein sprite with initial calm texture
   */
  private createFrankensteinSprite(): void {
    if (!this.frankensteinTextures.calm) return;
    
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.frankensteinTextures.calm,
      transparent: true
    });
    
    this.frankensteinSprite = new THREE.Sprite(spriteMaterial);
    this.frankensteinSprite.scale.set(4, 6, 1); // Adjust size as needed
    this.frankensteinSprite.position.set(0, -10, -10); // Behind console
    
    this.scene.add(this.frankensteinSprite);
    console.log('Frankenstein sprite created and added to scene');
  }

  /**
   * Change Frankenstein's emotional state
   */
  SET_FRANKENSTEIN_STATE(state: 'calm' | 'angry' | 'alive'): void {
    if (!this.frankensteinSprite) return;
    
    const texture = this.frankensteinTextures[state];
    
    if (texture && this.frankensteinSprite.material instanceof THREE.SpriteMaterial) {
      this.frankensteinSprite.material.map = texture;
      this.frankensteinSprite.material.needsUpdate = true;
      console.log('Frankenstein state changed to:', state);
    }
  }



  /**
   * CREATE_PARTICLE_SYSTEM - Create electric particle effects around the model
   */
  CREATE_PARTICLE_SYSTEM(): void {
    try {
      console.log('>>> CREATE_PARTICLE_SYSTEM called');
      
      // Remove existing particles first
      this.REMOVE_PARTICLE_SYSTEM();
      
      const particleCount = 300;
      console.log('Creating', particleCount, 'particles');
      
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      this.particleVelocities = new Float32Array(particleCount * 3);
      
      // Get model bounds for particle positioning
      const modelCenter = new THREE.Vector3(0, 0, 0);
      if (this.modelRoot) {
        this.modelRoot.getWorldPosition(modelCenter);
      }
      
      console.log('Model center:', modelCenter);
      
      // Initialize particle positions around the model
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.8 + Math.random() * 1.2;
        const height = (Math.random() - 0.5) * 1.5;
        
        positions[i3] = modelCenter.x + Math.cos(angle) * radius;
        positions[i3 + 1] = modelCenter.y + height;
        positions[i3 + 2] = modelCenter.z + Math.sin(angle) * radius;
        
        // Electric cyan/yellow colors
        const colorChoice = Math.random();
        if (colorChoice > 0.7) {
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 0.0;
        } else {
          colors[i3] = 0.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;
        }
        
        // Random velocities
        this.particleVelocities[i3] = (Math.random() - 0.5) * 0.03;
        this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.03;
        this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.03;
      }
      
      console.log('Creating geometry...');
      this.particleGeometry = new THREE.BufferGeometry();
      this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      console.log('Creating material...');
      this.particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        transparent: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
      });
      
      console.log('Creating Points object...');
      this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
      
      console.log('Adding to scene...');
      this.scene.add(this.particleSystem);
      
      console.log('>>> Particle system SUCCESSFULLY created! Scene children:', this.scene.children.length);
      console.log('>>> Particle system visible:', this.particleSystem.visible);
    } catch (error) {
      console.error('>>> ERROR creating particle system:', error);
    }
  }

  /**
   * UPDATE_PARTICLES - Animate particle system based on type
   */
  UPDATE_PARTICLES(): void {
    if (!this.particleSystem || !this.particleGeometry || !this.particleType) return;
    
    // Safety check for geometry attributes
    if (!this.particleGeometry.attributes || !this.particleGeometry.attributes.position) {
      console.warn('Particle geometry missing attributes, removing particle system');
      this.REMOVE_PARTICLE_SYSTEM();
      return;
    }
    
    const positions = this.particleGeometry.attributes.position.array as Float32Array;
    const modelCenter = new THREE.Vector3(0, 0, 0);
    if (this.modelRoot) {
      this.modelRoot.getWorldPosition(modelCenter);
    }
    
    if (this.particleType === 'electric') {
      // Electric sparks - rise to top of head and fade out
      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        
        positions[i] += this.particleVelocities[i];
        positions[i + 1] += this.particleVelocities[i + 1];
        positions[i + 2] += this.particleVelocities[i + 2];
        
        // Fade out as they rise
        this.particleLifetimes[particleIndex] -= 0.008;
        
        // Update material opacity based on lifetime
        if (this.particleMaterial) {
          this.particleMaterial.opacity = Math.max(0.3, Math.min(0.9, this.particleLifetimes[particleIndex]));
        }
        
        // Reset particles that reach top or fade out
        if (positions[i + 1] > modelCenter.y + 0.6 || this.particleLifetimes[particleIndex] <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.25 + Math.random() * 0.15;
          const height = 0.1 + Math.random() * 0.2;
          
          positions[i] = modelCenter.x + Math.cos(angle) * radius;
          positions[i + 1] = modelCenter.y + height;
          positions[i + 2] = modelCenter.z + Math.sin(angle) * radius;
          
          this.particleVelocities[i] = (Math.random() - 0.5) * 0.005;
          this.particleVelocities[i + 1] = 0.015 + Math.random() * 0.01;
          this.particleVelocities[i + 2] = (Math.random() - 0.5) * 0.005;
          
          this.particleLifetimes[particleIndex] = 1.0;
        }
      }
    } else if (this.particleType === 'explosion') {
      // Explosion - burst outward and fade
      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        
        positions[i] += this.particleVelocities[i];
        positions[i + 1] += this.particleVelocities[i + 1];
        positions[i + 2] += this.particleVelocities[i + 2];
        
        // Add gravity
        this.particleVelocities[i + 1] -= 0.0008;
        
        this.particleLifetimes[particleIndex] -= 0.015;
        
        // Fade out material
        if (this.particleMaterial) {
          this.particleMaterial.opacity = Math.max(0, this.particleLifetimes[particleIndex]);
        }
      }
      
      // Remove explosion after particles fade
      if (this.particleLifetimes[0] <= 0) {
        this.REMOVE_PARTICLE_SYSTEM();
      }
    } else if (this.particleType === 'success') {
      // Success - stream upward and fan out continuously
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += this.particleVelocities[i];
        positions[i + 1] += this.particleVelocities[i + 1];
        positions[i + 2] += this.particleVelocities[i + 2];
        
        // Gradually increase outward velocity as they rise (fan effect)
        const height = positions[i + 1] - modelCenter.y;
        if (height > 0) {
          const fanMultiplier = 1.0 + (height * 0.3);
          this.particleVelocities[i] *= fanMultiplier;
          this.particleVelocities[i + 2] *= fanMultiplier;
        }
        
        // Reset particles that go too high or too far out
        const dx = positions[i] - modelCenter.x;
        const dz = positions[i + 2] - modelCenter.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (positions[i + 1] > modelCenter.y + 1.8 || distance > 1.5) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.15 + Math.random() * 0.3;
          
          positions[i] = modelCenter.x + Math.cos(angle) * radius;
          positions[i + 1] = modelCenter.y - 0.5;
          positions[i + 2] = modelCenter.z + Math.sin(angle) * radius;
          
          const fanOutSpeed = 0.008 + Math.random() * 0.01;
          this.particleVelocities[i] = Math.cos(angle) * fanOutSpeed;
          this.particleVelocities[i + 1] = 0.02 + Math.random() * 0.025;
          this.particleVelocities[i + 2] = Math.sin(angle) * fanOutSpeed;
        }
      }
    }
    
    // Safety check before updating - geometry might have been removed during update
    if (this.particleGeometry && this.particleGeometry.attributes && this.particleGeometry.attributes.position) {
      this.particleGeometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * CREATE_ELECTRIC_SPARKS - Electric arcs/sparks during body prep (ritual steps)
   */
  CREATE_ELECTRIC_SPARKS(): void {
    this.REMOVE_PARTICLE_SYSTEM();
    
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    this.particleVelocities = new Float32Array(particleCount * 3);
    this.particleLifetimes = new Float32Array(particleCount);
    this.particleType = 'electric';
    
    const modelCenter = new THREE.Vector3(0, 0, 0);
    if (this.modelRoot) {
      this.modelRoot.getWorldPosition(modelCenter);
    }
    
    // Initialize particles near bolt positions, rising to top of head
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spawn near bolts at base
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.25 + Math.random() * 0.15;
      const height = 0.1 + Math.random() * 0.2;
      
      positions[i3] = modelCenter.x + Math.cos(angle) * radius;
      positions[i3 + 1] = modelCenter.y + height;
      positions[i3 + 2] = modelCenter.z + Math.sin(angle) * radius;
      
      // Neon green shades only
      const greenShade = Math.random();
      if (greenShade > 0.66) {
        colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.0; // Bright green
      } else if (greenShade > 0.33) {
        colors[i3] = 0.3; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.3; // Light green
      } else {
        colors[i3] = 0.5; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.0; // Yellow-green
      }
      
      // Upward velocities with slight wobble
      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.005;
      this.particleVelocities[i3 + 1] = 0.015 + Math.random() * 0.01; // Upward
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
      
      this.particleLifetimes[i] = Math.random();
      sizes[i] = 0.05 + Math.random() * 0.1; // Varied sizes
    }
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
      map: this.createRoundParticleTexture()
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
    
    console.log('Electric sparks created');
  }

  /**
   * CREATE_EXPLOSION_BURST - Explosive burst when player fails
   */
  CREATE_EXPLOSION_BURST(): void {
    this.REMOVE_PARTICLE_SYSTEM();
    
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    this.particleVelocities = new Float32Array(particleCount * 3);
    this.particleLifetimes = new Float32Array(particleCount);
    this.particleType = 'explosion';
    
    const modelCenter = new THREE.Vector3(0, 0, 0);
    if (this.modelRoot) {
      this.modelRoot.getWorldPosition(modelCenter);
    }
    
    // All particles start at center
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      positions[i3] = modelCenter.x;
      positions[i3 + 1] = modelCenter.y + 0.2;
      positions[i3 + 2] = modelCenter.z;
      
      // Green explosion colors (toxic/radioactive feel)
      const colorChoice = Math.random();
      if (colorChoice > 0.66) {
        colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.0; // Bright green
      } else if (colorChoice > 0.33) {
        colors[i3] = 0.5; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.0; // Yellow-green
      } else {
        colors[i3] = 0.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.5; // Cyan-green
      }
      
      // Explosive velocities in all directions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.025 + Math.random() * 0.05;
      
      this.particleVelocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      this.particleVelocities[i3 + 1] = Math.cos(phi) * speed;
      this.particleVelocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      
      this.particleLifetimes[i] = 1.0;
      sizes[i] = 0.08 + Math.random() * 0.15; // Varied sizes
    }
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
      map: this.createRoundParticleTexture()
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
    
    console.log('Explosion burst created');
  }

  /**
   * CREATE_SUCCESS_GLOW - Radiant white particles streaming upwards on success
   */
  CREATE_SUCCESS_GLOW(): void {
    this.REMOVE_PARTICLE_SYSTEM();
    
    const particleCount = 250;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    this.particleVelocities = new Float32Array(particleCount * 3);
    this.particleLifetimes = new Float32Array(particleCount);
    this.particleType = 'success';
    
    const modelCenter = new THREE.Vector3(0, 0, 0);
    if (this.modelRoot) {
      this.modelRoot.getWorldPosition(modelCenter);
    }
    
    // Initialize particles at base, streaming upward and fanning out
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start at base in a circle
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.15 + Math.random() * 0.3;
      
      positions[i3] = modelCenter.x + Math.cos(angle) * radius;
      positions[i3 + 1] = modelCenter.y - 0.5 + Math.random() * 1.5;
      positions[i3 + 2] = modelCenter.z + Math.sin(angle) * radius;
      
      // Bright white/golden/cyan glow colors
      const colorChoice = Math.random();
      if (colorChoice > 0.7) {
        colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // Pure white
      } else if (colorChoice > 0.4) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.6; // Golden
      } else {
        colors[i3] = 0.7; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // Cyan
      }
      
      // Upward streaming velocities with outward fan
      const fanOutSpeed = 0.008 + Math.random() * 0.01;
      this.particleVelocities[i3] = Math.cos(angle) * fanOutSpeed; // Fan out
      this.particleVelocities[i3 + 1] = 0.02 + Math.random() * 0.025; // Upward
      this.particleVelocities[i3 + 2] = Math.sin(angle) * fanOutSpeed; // Fan out
      
      this.particleLifetimes[i] = Math.random();
      sizes[i] = 0.06 + Math.random() * 0.12; // Varied sizes
    }
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
      map: this.createRoundParticleTexture()
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
    
    console.log('Success glow created');
  }

  /**
   * createRoundParticleTexture - Create a round, glowy particle texture
   */
  private createRoundParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create radial gradient for soft, glowy circle
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * REMOVE_PARTICLE_SYSTEM - Clean up particle effects
   */
  REMOVE_PARTICLE_SYSTEM(): void {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleGeometry?.dispose();
      this.particleMaterial?.dispose();
      this.particleSystem = undefined;
      this.particleGeometry = undefined;
      this.particleMaterial = undefined;
      this.particleType = null;
    }
  }

  /**
   * ANIMATE_IDLE - More noticeable breathing animation for idle state
   */
  ANIMATE_IDLE(): void {
    if (!this.modelRoot) {
      console.warn('No model root found for idle animation');
      return;
    }
    
    console.log('Starting idle animation');
    
    const originalPosition = this.modelRoot.position.clone();
    const originalRotation = this.modelRoot.rotation.clone();
    
    // More noticeable breathing and slight rotation
    const breatheIn = new TWEEN.Tween(this.modelRoot.position)
      .to({ y: originalPosition.y + 0.08 }, 1500) // Bigger movement, faster
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const breatheOut = new TWEEN.Tween(this.modelRoot.position)
      .to({ y: originalPosition.y }, 1500)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    // Slight rotation for more life
    const rotateRight = new TWEEN.Tween(this.modelRoot.rotation)
      .to({ y: originalRotation.y + 0.05 }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const rotateLeft = new TWEEN.Tween(this.modelRoot.rotation)
      .to({ y: originalRotation.y - 0.05 }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    // Chain animations to loop
    breatheIn.chain(breatheOut);
    breatheOut.chain(breatheIn);
    
    rotateRight.chain(rotateLeft);
    rotateLeft.chain(rotateRight);
    
    // Start animations
    breatheIn.start();
    rotateRight.start();
    
    this.idleAnimation = breatheIn;
  }

  /**
   * STOP_IDLE_ANIMATION - Stop the idle animation
   */
  STOP_IDLE_ANIMATION(): void {
    console.log('Stopping idle animation');
    
    if (this.idleAnimation) {
      this.idleAnimation.stop();
      this.idleAnimation = undefined;
    }
    
    // Directly reset model position and rotation (no tweens)
    if (this.modelRoot) {
      this.modelRoot.position.x = 0;
      this.modelRoot.position.y = 0;
      this.modelRoot.position.z = 0;
      this.modelRoot.rotation.x = 0;
      this.modelRoot.rotation.y = 0;
      this.modelRoot.rotation.z = 0;
    }
  }

  /**
   * FORCE_STOP_ALL_ANIMATIONS - Nuclear option to stop everything
   */
  FORCE_STOP_ALL_ANIMATIONS(): void {
    console.log('>>> FORCE STOPPING ALL ANIMATIONS');
    
    // Stop all tracked animations
    if (this.idleAnimation) {
      this.idleAnimation.stop();
      this.idleAnimation = undefined;
    }
    
    if (this.itsAliveAnimation) {
      this.itsAliveAnimation.stop();
      this.itsAliveAnimation = undefined;
    }
    
    // Remove ALL tweens (nuclear option)
    TWEEN.removeAll();
    
    // Force reset model position and rotation
    if (this.modelRoot) {
      this.modelRoot.position.set(0, 0, 0);
      this.modelRoot.rotation.set(0, 0, 0);
    }
    
    // Restart stitches animation will be done by caller
    console.log('>>> All animations force stopped');
  }

  /**
   * FLASH_BACKGROUND - Subtle electric pulse between two colors
   */
  FLASH_BACKGROUND(): void {
    console.log('>>> Starting background flash');
    
    // Two colors: original dark purple and brighter version
    const colors = [
      new THREE.Color(0x0d0028), // Dark purple (original)
      new THREE.Color(0x2d0058)  // Brighter purple (electric pulse)
    ];
    
    let colorIndex = 0;
    
    this.backgroundFlashInterval = window.setInterval(() => {
      this.scene.background = colors[colorIndex].clone();
      colorIndex = (colorIndex + 1) % colors.length;
    }, 400); // Slower pulse
  }

  /**
   * STOP_BACKGROUND_FLASH - Stop the background flash and reset
   */
  STOP_BACKGROUND_FLASH(): void {
    console.log('>>> Stopping background flash');
    
    if (this.backgroundFlashInterval) {
      clearInterval(this.backgroundFlashInterval);
      this.backgroundFlashInterval = undefined;
    }
    
    // Reset to gradient background
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 512;
    canvas2d.height = 512;
    const ctx = canvas2d.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#0d0028');
      gradient.addColorStop(1, '#11000e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      const bgTexture = new THREE.CanvasTexture(canvas2d);
      this.scene.background = bgTexture;
    }
  }

  /**
   * ANIMATE_ITS_ALIVE - Animate the model when "It's Alive" state is reached
   */
  ANIMATE_ITS_ALIVE(): void {
    if (!this.modelRoot) {
      console.warn('No model root found for Its Alive animation');
      return;
    }
    
    console.log('Starting Its Alive animation');
    
    // Stop any existing animations first
    this.STOP_ITS_ALIVE_ANIMATION();
    this.STOP_IDLE_ANIMATION();
    
    const originalPosition = this.modelRoot.position.clone();
    const originalRotation = this.modelRoot.rotation.clone();
    
    // More dramatic floating and rotation animation
    const floatUp = new TWEEN.Tween(this.modelRoot.position)
      .to({ y: originalPosition.y + 0.15 }, 1000)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const floatDown = new TWEEN.Tween(this.modelRoot.position)
      .to({ y: originalPosition.y }, 1000)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const rotateRight = new TWEEN.Tween(this.modelRoot.rotation)
      .to({ y: originalRotation.y + 0.15 }, 1500)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const rotateLeft = new TWEEN.Tween(this.modelRoot.rotation)
      .to({ y: originalRotation.y - 0.15 }, 1500)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const rotateCenter = new TWEEN.Tween(this.modelRoot.rotation)
      .to({ y: originalRotation.y }, 1500)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    // Chain animations to loop
    floatUp.chain(floatDown);
    floatDown.chain(floatUp);
    
    rotateRight.chain(rotateLeft);
    rotateLeft.chain(rotateCenter);
    rotateCenter.chain(rotateRight);
    
    // Start animations
    floatUp.start();
    rotateRight.start();
    
    this.itsAliveAnimation = floatUp;
  }

  /**
   * STOP_ITS_ALIVE_ANIMATION - Stop the "It's Alive" animation
   */
  STOP_ITS_ALIVE_ANIMATION(): void {
    console.log('Stopping Its Alive animation');
    
    // Stop the animation tween
    if (this.itsAliveAnimation) {
      this.itsAliveAnimation.stop();
      this.itsAliveAnimation = undefined;
    }
    
    // Directly reset model position and rotation (no tweens)
    if (this.modelRoot) {
      this.modelRoot.position.x = 0;
      this.modelRoot.position.y = 0;
      this.modelRoot.position.z = 0;
      this.modelRoot.rotation.x = 0;
      this.modelRoot.rotation.y = 0;
      this.modelRoot.rotation.z = 0;
    }
  }

  /**
   * START_GLOWER_PULSE - Start gentle pulsing glow animation for glower mesh
   */
  START_GLOWER_PULSE(): void {
    if (!this.glowerMesh || !(this.glowerMesh.material instanceof THREE.MeshStandardMaterial)) {
      console.warn('Glower mesh not found or invalid material');
      return;
    }
    
    const material = this.glowerMesh.material;
    const baseIntensity = 0.5;
    const pulseIntensity = 2.5;
    const duration = 2000; // 2 second gentle pulse
    
    // Set green emissive color
    material.emissive.setHex(0x00ff00); // Bright green glow
    material.emissiveIntensity = baseIntensity;
    
    // Store original emissive
    if (!material.userData.originalEmissive) {
      material.userData.originalEmissive = 0x00ff00;
    }
    
    // Stop existing animation if any
    if (this.glowerAnimation) {
      this.glowerAnimation.stop();
    }
    
    // Create gentle pulsing animation that loops
    const glowUp = new TWEEN.Tween(material)
      .to({ emissiveIntensity: pulseIntensity }, duration)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    const glowDown = new TWEEN.Tween(material)
      .to({ emissiveIntensity: baseIntensity }, duration)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    
    // Chain animations to loop infinitely
    glowUp.chain(glowDown);
    glowDown.chain(glowUp);
    
    // Store reference and start
    this.glowerAnimation = glowUp;
    glowUp.start();
    
    console.log('Started glower pulse animation with green emission');
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Stop all animations
    if (this.topStitchesAnimation) {
      this.topStitchesAnimation.stop();
    }
    TWEEN.removeAll();
    
    // Dispose renderer
    this.renderer.dispose();
    
    // Dispose scene resources
    this.scene.traverse((object: any) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}
