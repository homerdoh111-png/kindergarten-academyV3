/**
 * 3D Magical Overlay Elements
 * Butterflies, sparkles, and fireflies over the treehouse background image
 */

const TreehouseScene = (function() {
    'use strict';

    let scene, camera, renderer;
    let butterflies = [];
    let sparkles = [];
    let fireflies = [];
    let animationId;

    function init() {
        const canvas = document.getElementById('treehouseCanvas');
        if (!canvas) return;

        // Scene setup
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 3, 0);

        // Renderer with transparency
        renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true,
            alpha: true // Transparent background
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Fully transparent

        // Lighting for 3D elements
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.8);
        scene.add(ambient);

        // Create magical elements
        createButterflies();
        createSparkles();
        createFireflies();

        // Event listeners
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function createButterflies() {
        const butterflyColors = [0xFF69B4, 0xFFD700, 0x87CEEB, 0xFF6B9D, 0xFFA500];
        
        // Create 15 butterflies spread across entire scene
        for (let i = 0; i < 15; i++) {
            const butterfly = new THREE.Group();
            const wingMat = new THREE.MeshBasicMaterial({
                color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            
            // Wings
            const leftWing = new THREE.Mesh(new THREE.CircleGeometry(0.15, 8), wingMat);
            leftWing.position.x = -0.1;
            butterfly.add(leftWing);
            
            const rightWing = new THREE.Mesh(new THREE.CircleGeometry(0.15, 8), wingMat);
            rightWing.position.x = 0.1;
            butterfly.add(rightWing);

            // Spread across ENTIRE screen (much wider range)
            butterfly.position.set(
                Math.random() * 30 - 15,  // -15 to +15 (wider)
                Math.random() * 10 + 1,   // 1 to 11 (higher)
                Math.random() * 20 - 10   // -10 to +10 (deeper)
            );
            
            butterfly.userData = {
                angle: Math.random() * Math.PI * 2,
                radius: 3 + Math.random() * 5,        // Bigger circles
                speed: 0.08 + Math.random() * 0.12,   // Much slower (was 0.15-0.35)
                height: butterfly.position.y,
                center: { 
                    x: butterfly.position.x, 
                    z: butterfly.position.z 
                }
            };
            
            scene.add(butterfly);
            butterflies.push(butterfly);
        }
        
        console.log('🦋 15 butterflies created (slow & spread out)');
    }

    function createSparkles() {
        // Magical floating sparkles
        const sparkleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        
        for (let i = 0; i < 30; i++) {
            const sparkleMat = new THREE.MeshBasicMaterial({
                color: [0xFFFFAA, 0xFFD700, 0xFFF8DC, 0xFFE4B5][Math.floor(Math.random() * 4)],
                transparent: true,
                opacity: 0.6
            });
            
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMat);
            
            sparkle.position.set(
                Math.random() * 16 - 8,
                Math.random() * 10 + 1,
                Math.random() * 8 - 4
            );
            
            sparkle.userData = {
                speed: 0.2 + Math.random() * 0.3,
                range: 0.5 + Math.random() * 1,
                offset: Math.random() * Math.PI * 2,
                originalY: sparkle.position.y
            };
            
            scene.add(sparkle);
            sparkles.push(sparkle);
        }
    }

    function createFireflies() {
        // Glowing fireflies
        const fireflyGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        
        for (let i = 0; i < 20; i++) {
            const fireflyMat = new THREE.MeshBasicMaterial({
                color: 0xFFFF88,
                transparent: true,
                opacity: 0.8
            });
            
            const firefly = new THREE.Mesh(fireflyGeometry, fireflyMat);
            
            // Add glow
            const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xFFFF88,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMat);
            firefly.add(glow);
            
            firefly.position.set(
                Math.random() * 14 - 7,
                Math.random() * 6 + 2,
                Math.random() * 6 - 3
            );
            
            firefly.userData = {
                angle: Math.random() * Math.PI * 2,
                radius: 1 + Math.random() * 2,
                speed: 0.4 + Math.random() * 0.4,
                pulseSpeed: 2 + Math.random() * 2,
                center: { 
                    x: firefly.position.x, 
                    z: firefly.position.z 
                }
            };
            
            scene.add(firefly);
            fireflies.push(firefly);
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;

        // Animate butterflies (slow and graceful)
        butterflies.forEach(butterfly => {
            const angle = butterfly.userData.angle + time * butterfly.userData.speed;
            butterfly.userData.angle = angle;
            
            butterfly.position.x = butterfly.userData.center.x + Math.cos(angle) * butterfly.userData.radius;
            butterfly.position.z = butterfly.userData.center.z + Math.sin(angle) * butterfly.userData.radius;
            butterfly.position.y = butterfly.userData.height + Math.sin(time * 1.5 + angle) * 0.3;
            
            butterfly.rotation.y = angle + Math.PI / 2;
            
            // Slow wing flapping
            const wing1 = butterfly.children[0];
            const wing2 = butterfly.children[1];
            const flap = Math.sin(time * 3) * 0.3;  // Very slow flapping
            wing1.rotation.y = -flap;
            wing2.rotation.y = flap;
        });

        // Animate sparkles
        sparkles.forEach(sparkle => {
            sparkle.position.y = sparkle.userData.originalY + 
                Math.sin(time * sparkle.userData.speed + sparkle.userData.offset) * sparkle.userData.range;
            
            // Twinkle effect
            sparkle.material.opacity = 0.3 + Math.sin(time * 3 + sparkle.userData.offset) * 0.3;
            
            // Gentle rotation
            sparkle.rotation.y = time * 0.5;
        });

        // Animate fireflies
        fireflies.forEach(firefly => {
            const angle = firefly.userData.angle + time * firefly.userData.speed;
            firefly.userData.angle = angle;
            
            firefly.position.x = firefly.userData.center.x + Math.cos(angle) * firefly.userData.radius;
            firefly.position.z = firefly.userData.center.z + Math.sin(angle) * firefly.userData.radius;
            firefly.position.y += Math.sin(time * 2) * 0.01;
            
            // Pulsing glow
            const pulse = Math.sin(time * firefly.userData.pulseSpeed) * 0.3 + 0.7;
            firefly.material.opacity = pulse;
            if (firefly.children[0]) {
                firefly.children[0].material.opacity = pulse * 0.3;
            }
        });

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Expose public methods
    return {
        init
    };

})();
