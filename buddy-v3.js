/**
 * Buddy Bear 3D - GLB Model Version
 * Loads the professional GLB model
 */

const Buddy3D = (function() {
    'use strict';

    let scene, camera, renderer, buddy, mixer;
    let state = {
        talking: false,
        emotion: 'happy',
        animationFrame: null
    };

    function init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Buddy container not found');
            return null;
        }

        // Scene
        scene = new THREE.Scene();

        // Camera
        const width = container.clientWidth || 300;
        const height = container.clientHeight || 300;
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 1, 4);
        camera.lookAt(0, 1, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0xFFE8CC, 0.8);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xFFFFAA, 0.8);
        key.position.set(2, 3, 2);
        key.castShadow = true;
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xCCDDFF, 0.3);
        fill.position.set(-2, 1, -1);
        scene.add(fill);

        console.log('🐻 Buddy: Scene initialized, loading GLB model...');
        
        // Load GLB model
        loadGLBModel();

        // Start animation
        animate();

        return {
            talk: (text) => talk(text),
            setEmotion: (emotion) => setEmotion(emotion),
            celebrate: () => celebrate()
        };
    }

    function loadGLBModel() {
        // Simple fetch-based GLB loader
        fetch('buddy-model.glb')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                console.log('🐻 Buddy: GLB file loaded, parsing...');
                parseGLB(arrayBuffer);
            })
            .catch(error => {
                console.error('🐻 Buddy: Failed to load GLB model:', error);
                console.log('🐻 Buddy: Creating fallback geometric model...');
                createFallbackBuddy();
            });
    }

    function parseGLB(arrayBuffer) {
        // Basic GLB structure parser
        const view = new DataView(arrayBuffer);
        
        // Verify it's a GLB file
        const magic = view.getUint32(0, true);
        if (magic !== 0x46546C67) { // 'glTF' in ASCII
            console.error('🐻 Buddy: Not a valid GLB file');
            createFallbackBuddy();
            return;
        }

        // For now, use Three.js GLTFLoader if available
        // Otherwise fall back to geometric buddy
        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            const blob = new Blob([arrayBuffer]);
            const url = URL.createObjectURL(blob);
            
            loader.load(url, (gltf) => {
                buddy = gltf.scene;
                setupBuddyModel(buddy);
                
                // Store animations if any
                if (gltf.animations && gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(buddy);
                    gltf.animations.forEach(clip => {
                        mixer.clipAction(clip).play();
                    });
                }
                
                console.log('🐻 Buddy: GLB model loaded successfully!');
                URL.revokeObjectURL(url);
            }, undefined, (error) => {
                console.error('🐻 Buddy: GLTFLoader error:', error);
                createFallbackBuddy();
            });
        } else {
            console.log('🐻 Buddy: GLTFLoader not available, using fallback');
            createFallbackBuddy();
        }
    }

    function setupBuddyModel(model) {
        // Get bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Scale to fit (2 units tall)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        
        // Position at Y=1 (where camera is looking) and center XZ
        const scaledCenter = center.multiplyScalar(scale);
        model.position.set(-scaledCenter.x, 1, -scaledCenter.z);
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);
        console.log('🐻 Buddy: GLB positioned at Y=1 (camera target)');
    }

    function createFallbackBuddy() {
        console.log('🐻 Buddy: Creating fallback geometric model');
        
        buddy = new THREE.Group();

        const furMat = new THREE.MeshStandardMaterial({ color: 0xD4944E, roughness: 0.8 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xF0DCC4, roughness: 0.8 });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x2A1E18, roughness: 0.4 });
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
        const eyeMat = new THREE.MeshStandardMaterial({ 
            color: 0xD49430, 
            roughness: 0.1,
            emissive: 0x8a5a10,
            emissiveIntensity: 0.2
        });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), furMat);
        body.scale.set(1, 1.1, 0.9);
        body.castShadow = true;
        buddy.add(body);

        // Belly
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), bellyMat);
        belly.position.set(0, -0.1, 0.4);
        belly.scale.set(1, 1.2, 0.8);
        buddy.add(belly);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), furMat);
        head.position.set(0, 0.8, 0);
        head.castShadow = true;
        buddy.add(head);
        buddy.userData.head = head;

        // Ears
        [-0.35, 0.35].forEach(x => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), furMat);
            ear.position.set(x, 1.15, 0);
            ear.scale.set(0.9, 1, 0.8);
            ear.castShadow = true;
            buddy.add(ear);
        });

        // Muzzle
        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), bellyMat);
        muzzle.position.set(0, 0.7, 0.4);
        muzzle.scale.set(1.1, 0.8, 0.8);
        buddy.add(muzzle);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), noseMat);
        nose.position.set(0, 0.75, 0.5);
        nose.scale.set(1.2, 0.8, 0.9);
        nose.castShadow = true;
        buddy.add(nose);

        // Eyes
        [-0.18, 0.18].forEach(x => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(x, 0.85, 0.35);

            const white = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeWhiteMat);
            white.scale.set(1, 1.1, 0.9);
            eyeGroup.add(white);

            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
            iris.position.z = 0.08;
            eyeGroup.add(iris);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), pupilMat);
            pupil.position.z = 0.1;
            eyeGroup.add(pupil);

            buddy.add(eyeGroup);
        });

        // Arms
        [-0.4, 0.4].forEach(x => {
            const armGroup = new THREE.Group();
            
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8), furMat);
            arm.castShadow = true;
            armGroup.add(arm);
            
            const armTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), furMat);
            armTop.position.y = 0.15;
            armGroup.add(armTop);
            
            const armBottom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), furMat);
            armBottom.position.y = -0.15;
            armGroup.add(armBottom);
            
            armGroup.position.set(x, 0.2, 0);
            armGroup.rotation.z = x < 0 ? 0.3 : -0.3;
            buddy.add(armGroup);
        });

        // Legs
        [-0.2, 0.2].forEach(x => {
            const legGroup = new THREE.Group();
            
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 8), furMat);
            leg.castShadow = true;
            legGroup.add(leg);
            
            const legTop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), furMat);
            legTop.position.y = 0.125;
            legGroup.add(legTop);
            
            const legBottom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), furMat);
            legBottom.position.y = -0.125;
            legGroup.add(legBottom);
            
            legGroup.position.set(x, -0.5, 0.1);
            buddy.add(legGroup);
        });

        // Position buddy where camera is looking
        buddy.position.set(0, 1, 0);
        buddy.scale.set(1, 1, 1);

        scene.add(buddy);
        
        console.log('🐻 Buddy: Geometric model positioned at Y=1 (camera target)');
    }

    function animate() {
        state.animationFrame = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Update animations if present
        if (mixer) {
            mixer.update(0.016);
        }

        // Gentle breathing for geometric buddy
        if (buddy && !mixer) {
            buddy.scale.y = 1 + Math.sin(time * 2) * 0.02;
            
            if (buddy.userData.head) {
                buddy.userData.head.position.y = 0.8 + Math.sin(time * 2) * 0.02;
            }
        }

        renderer.render(scene, camera);
    }

    function talk(text) {
        state.talking = true;
        setTimeout(() => {
            state.talking = false;
        }, 2000);
    }

    function setEmotion(emotion) {
        state.emotion = emotion;
    }

    function celebrate() {
        // Celebration animation
    }

    return {
        init
    };

})();
