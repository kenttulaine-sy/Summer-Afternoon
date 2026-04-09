/**
 * Main Application - Complete Asset Integration
 * Uses ALL 68 assets from Stylized Nature Mega Kit
 * Version: 1.1.0 - Code cleanup and bug fixes
 */

// ============================================
// ASSET REGISTRY - All 68 assets organized
// ============================================

const AssetRegistry = {
    // TREES - 20 variants
    TREES: {
        COMMON: ['CommonTree_1.obj', 'CommonTree_2.obj', 'CommonTree_3.obj', 'CommonTree_4.obj', 'CommonTree_5.obj'],
        TWISTED: ['TwistedTree_1.obj', 'TwistedTree_2.obj', 'TwistedTree_3.obj', 'TwistedTree_4.obj', 'TwistedTree_5.obj'],
        DEAD: ['DeadTree_1.obj', 'DeadTree_2.obj', 'DeadTree_3.obj', 'DeadTree_4.obj', 'DeadTree_5.obj'],
        PINE: ['Pine_1.obj', 'Pine_2.obj', 'Pine_3.obj', 'Pine_4.obj', 'Pine_5.obj']
    },
    
    // ROCKS - 13 variants
    ROCKS: {
        MEDIUM: ['Rock_Medium_1.obj', 'Rock_Medium_2.obj', 'Rock_Medium_3.obj'],
        PATH_ROUND: ['RockPath_Round_Small_1.obj', 'RockPath_Round_Small_2.obj', 'RockPath_Round_Small_3.obj', 
                      'RockPath_Round_Thin.obj', 'RockPath_Round_Wide.obj'],
        PATH_SQUARE: ['RockPath_Square_Small_1.obj', 'RockPath_Square_Small_2.obj', 'RockPath_Square_Small_3.obj',
                      'RockPath_Square_Thin.obj', 'RockPath_Square_Wide.obj']
    },
    
    // BUSHES - 2 variants
    BUSHES: ['Bush_Common.obj', 'Bush_Common_Flowers.obj'],
    
    // PLANTS - 11 variants
    PLANTS: {
        FERN: ['Fern_1.obj'],
        CLOVER: ['Clover_1.obj', 'Clover_2.obj'],
        PLANT: ['Plant_1.obj', 'Plant_1_Big.obj', 'Plant_7.obj', 'Plant_7_Big.obj'],
        GRASS: ['Grass_Common_Short.obj', 'Grass_Common_Tall.obj', 'Grass_Wispy_Short.obj', 'Grass_Wispy_Tall.obj']
    },
    
    // FLOWERS - 9 variants
    FLOWERS: {
        GROUP: ['Flower_3_Group.obj', 'Flower_4_Group.obj'],
        SINGLE: ['Flower_3_Single.obj', 'Flower_4_Single.obj'],
        PETAL: ['Petal_1.obj', 'Petal_2.obj', 'Petal_3.obj', 'Petal_4.obj', 'Petal_5.obj']
    },
    
    // MUSHROOMS - 2 variants
    MUSHROOMS: ['Mushroom_Common.obj', 'Mushroom_Laetiporus.obj'],
    
    // PEBBLES - 11 variants
    PEBBLES: {
        ROUND: ['Pebble_Round_1.obj', 'Pebble_Round_2.obj', 'Pebble_Round_3.obj', 'Pebble_Round_4.obj', 'Pebble_Round_5.obj'],
        SQUARE: ['Pebble_Square_1.obj', 'Pebble_Square_2.obj', 'Pebble_Square_3.obj', 'Pebble_Square_4.obj', 'Pebble_Square_5.obj', 'Pebble_Square_6.obj']
    }
};

// Asset categorization for distribution
const AssetCategories = {
    LARGE_ANCHORS: [...AssetRegistry.TREES.COMMON, ...AssetRegistry.TREES.TWISTED, ...AssetRegistry.TREES.PINE, ...AssetRegistry.TREES.DEAD],
    MEDIUM_STRUCTURE: [...AssetRegistry.ROCKS.MEDIUM, ...AssetRegistry.BUSHES],
    SMALL_DETAIL: [
        ...AssetRegistry.PLANTS.FERN, ...AssetRegistry.PLANTS.CLOVER, 
        ...AssetRegistry.FLOWERS.SINGLE, ...AssetRegistry.MUSHROOMS,
        ...AssetRegistry.PEBBLES.ROUND.slice(0, 3), ...AssetRegistry.PEBBLES.SQUARE.slice(0, 3)
    ],
    PATH_DECORATION: [
        ...AssetRegistry.ROCKS.PATH_ROUND, ...AssetRegistry.ROCKS.PATH_SQUARE,
        ...AssetRegistry.PEBBLES.ROUND, ...AssetRegistry.PEBBLES.SQUARE
    ],
    GROUND_COVER: [
        ...AssetRegistry.PLANTS.GRASS, ...AssetRegistry.PLANTS.PLANT,
        ...AssetRegistry.FLOWERS.GROUP, ...AssetRegistry.FLOWERS.PETAL
    ]
};

// ============================================
// Hero Background Scene
// ============================================

const HeroScene = (function() {
    function init() {
        const container = document.getElementById('hero-canvas');
        if (!container) return;
        
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 2, 0);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        const sun = new THREE.DirectionalLight(0xffd700, 0.8);
        sun.position.set(10, 20, 10);
        scene.add(sun);
        
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshLambertMaterial({ color: 0x2d5a27, transparent: true, opacity: 0.8 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        scene.add(ground);
        
        const trees = [];
        const positions = [
            [-8, -5], [-5, -8], [-3, -3], [5, -6], [8, -4],
            [-6, 2], [-2, 5], [3, 4], [7, 3], [0, -10]
        ];
        
        positions.forEach((pos, i) => {
            const scale = 0.8 + Math.random() * 0.4;
            const tree = createLowPolyTree(pos[0], pos[1], scale);
            scene.add(tree);
            trees.push({ mesh: tree, origY: tree.position.y, offset: i * 0.5 });
        });
        
        const particleGeo = new THREE.BufferGeometry();
        const particleCount = 50;
        const positions_arr = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions_arr[i] = (Math.random() - 0.5) * 30;
            positions_arr[i + 1] = Math.random() * 10;
            positions_arr[i + 2] = (Math.random() - 0.5) * 20;
        }
        
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions_arr, 3));
        const particles = new THREE.Points(
            particleGeo,
            new THREE.PointsMaterial({ color: 0xffd700, size: 0.1, transparent: true, opacity: 0.6 })
        );
        scene.add(particles);
        
        let time = 0;
        let active = true;
        let animationId;
        
        function animate() {
            if (!active) return;
            animationId = requestAnimationFrame(animate);
            
            time += 0.01;
            
            trees.forEach(t => {
                t.mesh.rotation.y = Math.sin(time + t.offset) * 0.1;
                t.mesh.position.y = t.origY + Math.sin(time * 2 + t.offset) * 0.1;
            });
            
            particles.rotation.y = time * 0.05;
            
            camera.position.x = Math.sin(time * 0.1) * 15;
            camera.position.z = Math.cos(time * 0.1) * 15;
            camera.lookAt(0, 2, 0);
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        document.addEventListener('visibilitychange', () => {
            active = !document.hidden;
            if (active) {
                animate();
            } else if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
    }
    
    function createLowPolyTree(x, z, scale) {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 6),
            new THREE.MeshLambertMaterial({ color: 0x4a3728 })
        );
        trunk.position.y = 0.75 * scale;
        tree.add(trunk);
        
        const colors = [0x2d5a27, 0x3d7a37, 0x1d4a17];
        for (let i = 0; i < 3; i++) {
            const leaves = new THREE.Mesh(
                new THREE.ConeGeometry((1.2 - i * 0.3) * scale, 1.5 * scale, 6),
                new THREE.MeshLambertMaterial({ color: colors[i] })
            );
            leaves.position.y = (2 + i * 0.8) * scale;
            tree.add(leaves);
        }
        
        tree.position.set(x, -2, z);
        return tree;
    }
    
    return { init };
})();

// ============================================
// World Chunk Manager with Full Asset Distribution
// ============================================

const WorldChunkManager = (function() {
    // Configuration - Smaller map
    const CHUNK_SIZE = 20;
    const RENDER_DISTANCE = 2;
    const DESPAWN_DISTANCE = 3;
    
    // Asset usage tracking
    let assetUsage = new Map();
    
    // State
    let activeChunks = new Map();
    let playerChunkX = 0;
    let playerChunkZ = 0;
    let scene = null;
    let collisionObjects = { trees: [], rocks: [] };
    let loadedAssets = {};

    function init(gameScene, assets) {
        scene = gameScene;
        loadedAssets = assets;
        
        // Initialize usage tracking for all assets
        Object.values(AssetCategories).flat().forEach(asset => {
            assetUsage.set(asset, 0);
        });
        
        updateChunks(0, 0);
        
        return {
            updatePlayerPosition,
            getCollisionObjects: () => collisionObjects,
            getStats: () => ({
                activeChunks: activeChunks.size,
                totalTrees: collisionObjects.trees.length,
                totalRocks: collisionObjects.rocks.length,
                assetCoverage: getAssetCoverage()
            })
        };
    }

    function getAssetCoverage() {
        const used = Array.from(assetUsage.entries()).filter(([_, count]) => count > 0);
        return {
            totalAssets: assetUsage.size,
            usedAssets: used.length,
            coverage: (used.length / assetUsage.size * 100).toFixed(1) + '%'
        };
    }

    function getChunkKey(cx, cz) {
        return cx + ',' + cz;
    }

    function worldToChunkCoord(x, z) {
        return {
            x: Math.floor(x / CHUNK_SIZE),
            z: Math.floor(z / CHUNK_SIZE)
        };
    }

    function updatePlayerPosition(x, z) {
        const newChunk = worldToChunkCoord(x, z);
        
        if (newChunk.x !== playerChunkX || newChunk.z !== playerChunkZ) {
            playerChunkX = newChunk.x;
            playerChunkZ = newChunk.z;
            updateChunks(newChunk.x, newChunk.z);
        }
    }

    function updateChunks(centerX, centerZ) {
        const chunksToKeep = new Set();
        
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
                const cx = centerX + dx;
                const cz = centerZ + dz;
                const key = getChunkKey(cx, cz);
                
                chunksToKeep.add(key);
                
                if (!activeChunks.has(key)) {
                    generateChunk(cx, cz);
                }
            }
        }
        
        for (const [key, chunk] of activeChunks) {
            if (!chunksToKeep.has(key)) {
                const parts = key.split(',');
                const cx = parseInt(parts[0]);
                const cz = parseInt(parts[1]);
                const dist = Math.sqrt(
                    Math.pow(cx - centerX, 2) + 
                    Math.pow(cz - centerZ, 2)
                );
                
                if (dist > DESPAWN_DISTANCE) {
                    removeChunk(key);
                }
            }
        }
    }

    // ZONE DEFINITIONS - Smaller map with 4 forest clusters
    const ZONES = {
        CENTER: { x: 0, z: 0, radius: 10, type: 'clear' },
        NORTH_WOODS: { x: 10, z: -28, radius: 18, type: 'forest' },
        SOUTH_GROVE: { x: -12, z: 30, radius: 16, type: 'forest' },
        EAST_STAND: { x: 32, z: 8, radius: 15, type: 'forest' },
        WEST_PATCH: { x: -30, z: -10, radius: 14, type: 'forest' }
    };
    
    // FOREST CLUSTER DEFINITIONS - Dense centers with falloff
    const FOREST_CLUSTERS = [
        { 
            center: { x: 10, z: -28 },
            denseRadius: 8,
            sparseRadius: 16,
            treeCount: { min: 6, max: 10 },
            treeTypes: ['PINE', 'COMMON']
        },
        { 
            center: { x: -12, z: 30 },
            denseRadius: 7,
            sparseRadius: 14,
            treeCount: { min: 5, max: 9 },
            treeTypes: ['COMMON', 'TWISTED']
        },
        { 
            center: { x: 32, z: 8 },
            denseRadius: 6,
            sparseRadius: 12,
            treeCount: { min: 4, max: 8 },
            treeTypes: ['PINE', 'DEAD']
        },
        { 
            center: { x: -30, z: -10 },
            denseRadius: 6,
            sparseRadius: 11,
            treeCount: { min: 4, max: 7 },
            treeTypes: ['TWISTED', 'DEAD']
        }
    ];
    
    // PATHS - Clear corridors connecting spawn to forest clusters
    const PATHS = [
        { start: ZONES.CENTER, end: ZONES.NORTH_WOODS, width: 8 },
        { start: ZONES.CENTER, end: ZONES.SOUTH_GROVE, width: 8 },
        { start: ZONES.CENTER, end: ZONES.EAST_STAND, width: 7 },
        { start: ZONES.CENTER, end: ZONES.WEST_PATCH, width: 7 }
    ];
    
    function isOnPath(x, z) {
        for (const path of PATHS) {
            const dx = path.end.x - path.start.x;
            const dz = path.end.z - path.start.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            
            const t = ((x - path.start.x) * dx + (z - path.start.z) * dz) / (len * len);
            const clampedT = Math.max(0, Math.min(1, t));
            
            const closestX = path.start.x + clampedT * dx;
            const closestZ = path.start.z + clampedT * dz;
            
            const distToPath = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
            if (distToPath < path.width / 2) return true;
        }
        return false;
    }
    
    function getZoneAt(x, z) {
        let closestZone = null;
        let closestDist = Infinity;
        
        for (const [name, zone] of Object.entries(ZONES)) {
            const dist = Math.sqrt((x - zone.x) ** 2 + (z - zone.z) ** 2);
            if (dist < zone.radius && dist < closestDist) {
                closestDist = dist;
                closestZone = zone;
            }
        }
        return closestZone;
    }
    
    function generateChunk(cx, cz) {
        const chunk = {
            x: cx,
            z: cz,
            objects: [],
            trees: [],
            rocks: []
        };
        
        const worldX = cx * CHUNK_SIZE;
        const worldZ = cz * CHUNK_SIZE;
        const isSpawnChunk = (cx === 0 && cz === 0);
        
        const chunkCenterX = worldX + CHUNK_SIZE / 2;
        const chunkCenterZ = worldZ + CHUNK_SIZE / 2;
        const zone = getZoneAt(chunkCenterX, chunkCenterZ);
        
        if (zone) {
            switch(zone.type) {
                case 'clear':
                    break;
                case 'forest':
                    placeForestCluster(chunk, worldX, worldZ, zone, isSpawnChunk);
                    break;
                case 'meadow':
                    placeMeadowDecor(chunk, worldX, worldZ, isSpawnChunk);
                    break;
                case 'rocky':
                    placeRockFormation(chunk, worldX, worldZ, isSpawnChunk);
                    break;
            }
        } else {
            placeTransitionDecor(chunk, worldX, worldZ, isSpawnChunk);
        }
        
        if (zone && !isSpawnChunk) {
            placeLandmark(chunk, zone, worldX, worldZ);
        }
        
        activeChunks.set(getChunkKey(cx, cz), chunk);
    }
    
    function placeForestCluster(chunk, worldX, worldZ, zone, isSpawn) {
        const clusterDef = FOREST_CLUSTERS.find(c => 
            Math.abs((worldX + CHUNK_SIZE/2) - c.center.x) < c.sparseRadius + 10 &&
            Math.abs((worldZ + CHUNK_SIZE/2) - c.center.z) < c.sparseRadius + 10
        );
        
        if (!clusterDef) return;
        
        const chunkCenterX = worldX + CHUNK_SIZE / 2;
        const chunkCenterZ = worldZ + CHUNK_SIZE / 2;
        const distFromCenter = Math.sqrt(
            Math.pow(chunkCenterX - clusterDef.center.x, 2) + 
            Math.pow(chunkCenterZ - clusterDef.center.z, 2)
        );
        
        let densityMultiplier = 1.0;
        if (distFromCenter <= clusterDef.denseRadius) {
            densityMultiplier = 1.0;
        } else if (distFromCenter <= clusterDef.sparseRadius) {
            const falloff = (distFromCenter - clusterDef.denseRadius) / 
                           (clusterDef.sparseRadius - clusterDef.denseRadius);
            densityMultiplier = 1.0 - (falloff * 0.7);
        } else {
            densityMultiplier = 0.3;
        }
        
        const targetTrees = Math.floor(
            (clusterDef.treeCount.min + Math.random() * 
            (clusterDef.treeCount.max - clusterDef.treeCount.min)) * densityMultiplier
        );
        
        for (let t = 0; t < targetTrees; t++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.random() * (clusterDef.denseRadius * 0.8);
            
            const lx = (clusterDef.center.x - worldX) + Math.cos(angle) * dist;
            const lz = (clusterDef.center.z - worldZ) + Math.sin(angle) * dist;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (Math.abs(lx) > CHUNK_SIZE * 0.6 || Math.abs(lz) > CHUNK_SIZE * 0.6) continue;
            if (isOnPath(x, z)) continue;
            if (checkOverlap(x, z, 2)) continue;
            
            const typeIndex = Math.floor(Math.random() * clusterDef.treeTypes.length);
            const typeAssets = AssetRegistry.TREES[clusterDef.treeTypes[typeIndex]];
            const assetFile = typeAssets[Math.floor(Math.random() * typeAssets.length)];
            
            if (!loadedAssets[assetFile]) continue;
            
            const tree = loadedAssets[assetFile].clone();
            const distScaleFactor = 1.0 - (dist / clusterDef.denseRadius) * 0.2;
            const scale = (0.8 + Math.random() * 0.5) * Math.max(0.8, distScaleFactor);
            
            tree.position.set(x, 0, z);
            tree.scale.set(scale, scale, scale);
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(tree);
            chunk.objects.push(tree);
            
            const treeData = { x, z, radius: 1.0 * scale };
            chunk.trees.push(treeData);
            collisionObjects.trees.push(treeData);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
        
        if (densityMultiplier > 0.6) {
            const coverCount = Math.floor(2 * densityMultiplier);
            for (let i = 0; i < coverCount; i++) {
                const lx = (clusterDef.center.x - worldX) + (Math.random() - 0.5) * clusterDef.denseRadius;
                const lz = (clusterDef.center.z - worldZ) + (Math.random() - 0.5) * clusterDef.denseRadius;
                const x = worldX + lx;
                const z = worldZ + lz;
                
                if (isOnPath(x, z)) continue;
                
                const coverAssets = [...AssetRegistry.PLANTS.FERN, ...AssetRegistry.MUSHROOMS];
                const assetFile = coverAssets[Math.floor(Math.random() * coverAssets.length)];
                
                if (!loadedAssets[assetFile]) continue;
                
                const cover = loadedAssets[assetFile].clone();
                cover.position.set(x, 0, z);
                cover.scale.set(0.25, 0.25, 0.25);
                cover.rotation.y = Math.random() * Math.PI * 2;
                
                scene.add(cover);
                chunk.objects.push(cover);
                
                assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
            }
        }
    }
    
    function placeMeadowDecor(chunk, worldX, worldZ, isSpawn) {
        const decorCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < decorCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * CHUNK_SIZE * 0.4;
            const lx = Math.cos(angle) * dist;
            const lz = Math.sin(angle) * dist;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (isOnPath(x, z)) continue;
            if (checkOverlap(x, z, 1.5)) continue;
            
            const assetFile = AssetRegistry.BUSHES[i % 2];
            if (!loadedAssets[assetFile]) continue;
            
            const bush = loadedAssets[assetFile].clone();
            const scale = 0.5 + Math.random() * 0.2;
            
            bush.position.set(x, 0, z);
            bush.scale.set(scale, scale, scale);
            bush.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(bush);
            chunk.objects.push(bush);
            
            const bushData = { x, z, radius: 0.6 * scale };
            chunk.rocks.push(bushData);
            collisionObjects.rocks.push(bushData);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
        
        for (let i = 0; i < 6; i++) {
            const lx = (Math.random() - 0.5) * CHUNK_SIZE * 0.9;
            const lz = (Math.random() - 0.5) * CHUNK_SIZE * 0.9;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (isOnPath(x, z)) continue;
            
            const flowerAssets = [...AssetRegistry.FLOWERS.GROUP, ...AssetRegistry.FLOWERS.SINGLE];
            const assetFile = flowerAssets[i % flowerAssets.length];
            
            if (!loadedAssets[assetFile]) continue;
            
            const flower = loadedAssets[assetFile].clone();
            flower.position.set(x, 0, z);
            flower.scale.set(0.2, 0.2, 0.2);
            flower.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(flower);
            chunk.objects.push(flower);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
    }
    
    function placeRockFormation(chunk, worldX, worldZ, isSpawn) {
        const rockCount = 2 + Math.floor(Math.random() * 3);
        const centerX = CHUNK_SIZE / 2 + (Math.random() - 0.5) * 5;
        const centerZ = CHUNK_SIZE / 2 + (Math.random() - 0.5) * 5;
        
        for (let i = 0; i < rockCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 4;
            const lx = centerX + Math.cos(angle) * dist;
            const lz = centerZ + Math.sin(angle) * dist;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (isOnPath(x, z)) continue;
            if (checkOverlap(x, z, 2)) continue;
            
            const assetFile = AssetRegistry.ROCKS.MEDIUM[i % 3];
            if (!loadedAssets[assetFile]) continue;
            
            const rock = loadedAssets[assetFile].clone();
            const scale = 0.5 + Math.random() * 0.3;
            
            rock.position.set(x, 0, z);
            rock.scale.set(scale, scale, scale);
            rock.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(rock);
            chunk.objects.push(rock);
            
            const rockData = { x, z, radius: 1.0 * scale };
            chunk.rocks.push(rockData);
            collisionObjects.rocks.push(rockData);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
        
        for (let i = 0; i < 5; i++) {
            const lx = centerX + (Math.random() - 0.5) * 8;
            const lz = centerZ + (Math.random() - 0.5) * 8;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (isOnPath(x, z)) continue;
            
            const pebbleAssets = [...AssetRegistry.PEBBLES.ROUND, ...AssetRegistry.PEBBLES.SQUARE];
            const assetFile = pebbleAssets[i % pebbleAssets.length];
            
            if (!loadedAssets[assetFile]) continue;
            
            const pebble = loadedAssets[assetFile].clone();
            pebble.position.set(x, 0, z);
            pebble.scale.set(0.15, 0.15, 0.15);
            pebble.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(pebble);
            chunk.objects.push(pebble);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
    }
    
    function placeTransitionDecor(chunk, worldX, worldZ, isSpawn) {
        const itemCount = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < itemCount; i++) {
            const lx = (Math.random() - 0.5) * CHUNK_SIZE * 0.6;
            const lz = (Math.random() - 0.5) * CHUNK_SIZE * 0.6;
            const x = worldX + lx;
            const z = worldZ + lz;
            
            if (isOnPath(x, z)) continue;
            if (checkOverlap(x, z, 3)) continue;
            
            const plantAssets = AssetRegistry.PLANTS.GRASS;
            const assetFile = plantAssets[i % plantAssets.length];
            
            if (!loadedAssets[assetFile]) continue;
            
            const plant = loadedAssets[assetFile].clone();
            plant.position.set(x, 0, z);
            plant.scale.set(0.25, 0.25, 0.25);
            plant.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(plant);
            chunk.objects.push(plant);
            
            assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
        }
    }
    
    function placeLandmark(chunk, zone, worldX, worldZ) {
        const chunkMinX = worldX;
        const chunkMaxX = worldX + CHUNK_SIZE;
        const chunkMinZ = worldZ;
        const chunkMaxZ = worldZ + CHUNK_SIZE;
        
        if (zone.x >= chunkMinX && zone.x <= chunkMaxX &&
            zone.z >= chunkMinZ && zone.z <= chunkMaxZ) {
            
            let assetFile = null;
            let scale = 1.0;
            
            switch(zone.type) {
                case 'forest':
                    assetFile = 'CommonTree_3.obj';
                    scale = 1.2;
                    break;
                case 'meadow':
                    break;
                case 'rocky':
                    assetFile = 'Rock_Medium_2.obj';
                    scale = 1.3;
                    break;
                case 'thicket':
                    assetFile = 'DeadTree_3.obj';
                    scale = 1.1;
                    break;
            }
            
            if (assetFile && loadedAssets[assetFile]) {
                const landmark = loadedAssets[assetFile].clone();
                landmark.position.set(zone.x, 0, zone.z);
                landmark.scale.set(scale, scale, scale);
                landmark.rotation.y = Math.random() * Math.PI * 2;
                
                scene.add(landmark);
                chunk.objects.push(landmark);
                
                if (assetFile.includes('Tree')) {
                    const treeData = { x: zone.x, z: zone.z, radius: 1.5 * scale };
                    chunk.trees.push(treeData);
                    collisionObjects.trees.push(treeData);
                } else if (assetFile.includes('Rock')) {
                    const rockData = { x: zone.x, z: zone.z, radius: 1.2 * scale };
                    chunk.rocks.push(rockData);
                    collisionObjects.rocks.push(rockData);
                }
                
                assetUsage.set(assetFile, (assetUsage.get(assetFile) || 0) + 1);
            }
        }
    }

    function checkOverlap(x, z, minDist) {
        for (const tree of collisionObjects.trees) {
            const dx = x - tree.x;
            const dz = z - tree.z;
            if (Math.sqrt(dx * dx + dz * dz) < minDist + tree.radius) {
                return true;
            }
        }
        for (const rock of collisionObjects.rocks) {
            const dx = x - rock.x;
            const dz = z - rock.z;
            if (Math.sqrt(dx * dx + dz * dz) < minDist + rock.radius) {
                return true;
            }
        }
        return false;
    }

    function removeChunk(key) {
        const chunk = activeChunks.get(key);
        if (!chunk) return;
        
        chunk.objects.forEach(obj => {
            scene.remove(obj);
            obj.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        
        collisionObjects.trees = collisionObjects.trees.filter(
            t => !chunk.trees.includes(t)
        );
        collisionObjects.rocks = collisionObjects.rocks.filter(
            r => !chunk.rocks.includes(r)
        );
        
        activeChunks.delete(key);
    }

    return { init };
})();

// ============================================
// Playable Game with Full Asset Loading
// ============================================

const PlayableGame = (function () {
    let scene, camera, renderer, canvas;
    let isLocked = false;
    let keys = { w: false, a: false, s: false, d: false, shift: false };
    let yaw = 0, pitch = 0;
    let lastTime = performance.now();
    let frameCount = 0, fpsTime = 0;
    let animationId = null;
    let isActive = true;

    const objLoader = new THREE.OBJLoader();
    let loadedAssets = {};
    let chunkManager = null;

    // All 68 asset filenames
    const ALL_ASSETS = [
        'CommonTree_1.obj', 'CommonTree_2.obj', 'CommonTree_3.obj', 'CommonTree_4.obj', 'CommonTree_5.obj',
        'TwistedTree_1.obj', 'TwistedTree_2.obj', 'TwistedTree_3.obj', 'TwistedTree_4.obj', 'TwistedTree_5.obj',
        'DeadTree_1.obj', 'DeadTree_2.obj', 'DeadTree_3.obj', 'DeadTree_4.obj', 'DeadTree_5.obj',
        'Pine_1.obj', 'Pine_2.obj', 'Pine_3.obj', 'Pine_4.obj', 'Pine_5.obj',
        'Rock_Medium_1.obj', 'Rock_Medium_2.obj', 'Rock_Medium_3.obj',
        'RockPath_Round_Small_1.obj', 'RockPath_Round_Small_2.obj', 'RockPath_Round_Small_3.obj',
        'RockPath_Round_Thin.obj', 'RockPath_Round_Wide.obj',
        'RockPath_Square_Small_1.obj', 'RockPath_Square_Small_2.obj', 'RockPath_Square_Small_3.obj',
        'RockPath_Square_Thin.obj', 'RockPath_Square_Wide.obj',
        'Bush_Common.obj', 'Bush_Common_Flowers.obj',
        'Fern_1.obj', 'Clover_1.obj', 'Clover_2.obj', 
        'Plant_1.obj', 'Plant_1_Big.obj', 'Plant_7.obj', 'Plant_7_Big.obj',
        'Grass_Common_Short.obj', 'Grass_Common_Tall.obj', 'Grass_Wispy_Short.obj', 'Grass_Wispy_Tall.obj',
        'Flower_3_Group.obj', 'Flower_4_Group.obj', 'Flower_3_Single.obj', 'Flower_4_Single.obj',
        'Petal_1.obj', 'Petal_2.obj', 'Petal_3.obj', 'Petal_4.obj', 'Petal_5.obj',
        'Mushroom_Common.obj', 'Mushroom_Laetiporus.obj',
        'Pebble_Round_1.obj', 'Pebble_Round_2.obj', 'Pebble_Round_3.obj', 'Pebble_Round_4.obj', 'Pebble_Round_5.obj',
        'Pebble_Square_1.obj', 'Pebble_Square_2.obj', 'Pebble_Square_3.obj', 'Pebble_Square_4.obj', 'Pebble_Square_5.obj', 'Pebble_Square_6.obj'
    ];

    function init() {
        const container = document.getElementById('game-canvas');
        if (!container) return;

        // Guard: retry if container hasn't been painted yet
        if (container.clientWidth === 0) {
            requestAnimationFrame(() => init());
            return;
        }

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 10, 120);

        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        canvas = renderer.domElement;

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const sun = new THREE.DirectionalLight(0xffd700, 0.8);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        scene.add(sun);
        
        // PLANET WITH ATMOSPHERIC CLOUD LAYER
        const planetGeometry = new THREE.SphereGeometry(15, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffd700,
            transparent: true,
            opacity: 0.95
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(-60, 80, -100);
        planet.renderOrder = 1;
        scene.add(planet);
        
        // ATMOSPHERIC CLOUD LAYER
        const cloudSystem = [];
        const clusterCount = 4;
        
        for (let c = 0; c < clusterCount; c++) {
            const clusterAngle = (c / clusterCount) * Math.PI * 2 + Math.random() * 0.5;
            const clusterDist = 20 + Math.random() * 10;
            
            const clusterCenter = {
                x: planet.position.x + Math.cos(clusterAngle) * clusterDist,
                y: planet.position.y + (Math.random() - 0.5) * 15,
                z: planet.position.z + Math.sin(clusterAngle) * clusterDist
            };
            
            const cloudsInCluster = 2 + Math.floor(Math.random() * 3);
            const clusterGroup = [];
            
            for (let i = 0; i < cloudsInCluster; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * Math.random() * 8;
                
                const cloudGeo = new THREE.SphereGeometry(2.5 + Math.random() * 1.5, 16, 16);
                const cloudMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5 + Math.random() * 0.25,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                
                const cloud = new THREE.Mesh(cloudGeo, cloudMat);
                cloud.position.set(
                    clusterCenter.x + Math.cos(angle) * dist,
                    clusterCenter.y + Math.sin(angle * 0.3) * 5 + (Math.random() - 0.5) * 3,
                    clusterCenter.z + Math.sin(angle) * dist
                );
                cloud.renderOrder = 2;
                
                scene.add(cloud);
                clusterGroup.push(cloud);
            }
            
            cloudSystem.push(clusterGroup);
        }
        
        // Add outer atmospheric haze
        const hazeGeo = new THREE.SphereGeometry(18, 32, 32);
        const hazeMat = new THREE.MeshBasicMaterial({
            color: 0xffeeaa,
            transparent: true,
            opacity: 0.15,
            depthWrite: false,
            side: THREE.BackSide
        });
        const haze = new THREE.Mesh(hazeGeo, hazeMat);
        haze.position.copy(planet.position);
        haze.renderOrder = 0;
        scene.add(haze);
        
        // Animate clouds around planet
        function animateClouds() {
            const time = Date.now() * 0.0001;
            
            cloudSystem.forEach((cluster, idx) => {
                const orbitAngle = time + (idx * Math.PI * 0.5);
                const orbitDist = 25 + Math.sin(time * 0.5) * 5;
                
                const centerX = planet.position.x + Math.cos(orbitAngle) * orbitDist;
                const centerZ = planet.position.z + Math.sin(orbitAngle) * orbitDist;
                const centerY = planet.position.y + Math.sin(time + idx) * 5;
                
                cluster.forEach((cloud, cIdx) => {
                    const localAngle = cIdx * 0.5;
                    const localDist = cIdx * 3;
                    cloud.position.x = centerX + Math.cos(localAngle) * localDist;
                    cloud.position.z = centerZ + Math.sin(localAngle) * localDist;
                    cloud.position.y = centerY + Math.sin(time * 0.3 + cIdx) * 2;
                });
            });
            
            requestAnimationFrame(animateClouds);
        }
        animateClouds();
        
        // Rotate planet slowly
        function rotatePlanet() {
            if (planet && isActive) {
                planet.rotation.y += 0.0003;
            }
            requestAnimationFrame(rotatePlanet);
        }
        rotatePlanet();

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshLambertMaterial({ color: 0x4a7c4e })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        loadAllAssets(() => {
            chunkManager = WorldChunkManager.init(scene, loadedAssets);
            placeLowPolyAssets();
            setupEvents(container);
            animate();
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);
    }

    function loadAllAssets(callback) {
        const assetPath = 'assets/models/';
        const lowpolyPath = 'assets/models/lowpoly/LowPolyAssets/';
        let loadedCount = 0;
        const priorityAssets = ALL_ASSETS.slice(0, 35);
        
        // LowPoly FBX assets - load with fallback
        const lowpolyAssets = [
            { file: 'Well.FBX', name: 'Well', scale: 0.03 },
            { file: 'Campfire.FBX', name: 'Campfire', scale: 0.03 },
            { file: 'Tent #1.FBX', name: 'Tent1', scale: 0.03 },
            { file: 'Sign Post.FBX', name: 'SignPost', scale: 0.03 },
            { file: 'LargeRock.FBX', name: 'LargeRock', scale: 0.03 }
        ];
        
        // Note: FBXLoader requires fflate library which is not loaded
        // Using fallback placeholders for these assets
        const fbxLoader = typeof THREE.FBXLoader !== 'undefined' ? new THREE.FBXLoader() : null;
        
        const totalAssets = priorityAssets.length + lowpolyAssets.length;
        
        function checkComplete() {
            loadedCount++;
            if (loadedCount >= totalAssets) {
                callback();
            }
        }
        
        // Load OBJ assets (original)
        priorityAssets.forEach(filename => {
            objLoader.load(
                assetPath + filename,
                (object) => {
                    const scale = getAssetScale(filename);
                    object.scale.set(scale, scale, scale);
                    
                    object.traverse((child) => {
                        if (child.isMesh) {
                            const color = getAssetColor(filename);
                            child.material = new THREE.MeshLambertMaterial({ 
                                color: color,
                                side: THREE.DoubleSide
                            });
                            child.castShadow = !filename.includes('Pebble') && !filename.includes('Petal');
                            child.receiveShadow = true;
                        }
                    });
                    
                    loadedAssets[filename] = object;
                    checkComplete();
                },
                undefined,
                () => {
                    loadedAssets[filename] = null;
                    checkComplete();
                }
            );
        });
        
        // Load LowPoly FBX assets with fallback
        lowpolyAssets.forEach(asset => {
            if (!fbxLoader) {
                console.warn('FBXLoader not available for:', asset.file);
                loadedAssets[asset.name] = null;
                checkComplete();
                return;
            }
            
            fbxLoader.load(
                lowpolyPath + asset.file,
                (object) => {
                    object.scale.set(asset.scale, asset.scale, asset.scale);
                    
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    loadedAssets[asset.name] = object;
                    checkComplete();
                },
                undefined,
                () => {
                    console.warn('Failed to load LowPoly asset:', asset.file);
                    loadedAssets[asset.name] = null;
                    checkComplete();
                }
            );
        });
    }
    
    function placeLowPolyAssets() {
        const placements = [
            { asset: 'Well', x: 25, z: 25, rot: 0 },
            { asset: 'Campfire', x: -20, z: 30, rot: Math.random() * Math.PI },
            { asset: 'Tent1', x: -25, z: 25, rot: Math.PI / 4 },
            { asset: 'SignPost', x: 30, z: -20, rot: -Math.PI / 2 },
            { asset: 'LargeRock', x: 40, z: 40, rot: Math.random() * Math.PI }
        ];

        placements.forEach(placement => {
            if (!loadedAssets[placement.asset]) return;

            const obj = loadedAssets[placement.asset].clone();
            obj.position.set(placement.x, 0, placement.z);
            obj.rotation.y = placement.rot;

            scene.add(obj);

            if (chunkManager) {
                const objs = chunkManager.getCollisionObjects();
                objs.rocks.push({ x: placement.x, z: placement.z, radius: 2 });
            }
        });
    }

    function getAssetScale(filename) {
        if (filename.includes('Tree')) return 0.5;
        if (filename.includes('Bush')) return 0.6;
        if (filename.includes('Rock_Medium')) return 0.4;
        if (filename.includes('RockPath')) return 0.5;
        if (filename.includes('Mushroom')) return 0.25;
        if (filename.includes('Flower') && filename.includes('Group')) return 0.3;
        if (filename.includes('Flower')) return 0.2;
        if (filename.includes('Grass') || filename.includes('Plant')) return 0.3;
        if (filename.includes('Pebble')) return 0.15;
        return 0.3;
    }

    function getAssetColor(filename) {
        if (filename.includes('Tree')) {
            if (filename.includes('Dead')) return 0x8b7355;
            if (filename.includes('Pine')) return 0x1d4a17;
            return 0x2d5a27;
        }
        if (filename.includes('Flower')) return 0xff69b4;
        if (filename.includes('Mushroom')) return 0xd2691e;
        if (filename.includes('Rock')) return 0x808080;
        if (filename.includes('Bush')) return 0x3d7a37;
        return 0x4a8a47;
    }

    function setupEvents(container) {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                canvas.requestPointerLock();
            });
        }

        document.addEventListener('pointerlockchange', () => {
            isLocked = document.pointerLockElement === canvas;
            toggleUI(isLocked);
        });

        document.addEventListener('pointerlockerror', () => {
            console.warn('Pointer lock failed.');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isLocked) return;
            yaw -= e.movementX * 0.002;
            pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch - e.movementY * 0.002));
            camera.rotation.order = 'YXZ';
            camera.rotation.y = yaw;
            camera.rotation.x = pitch;
        });

        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': keys.w = true; break;
                case 'a': keys.a = true; break;
                case 's': keys.s = true; break;
                case 'd': keys.d = true; break;
            }
            if (e.key === 'Shift') keys.shift = true;
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': keys.w = false; break;
                case 'a': keys.a = false; break;
                case 's': keys.s = false; break;
                case 'd': keys.d = false; break;
            }
            if (e.key === 'Shift') keys.shift = false;
        });

        document.getElementById('reset-position')?.addEventListener('click', (e) => {
            e.stopPropagation();
            camera.position.set(0, 2, 0);
            yaw = 0; pitch = 0;
            camera.rotation.set(0, 0, 0, 'YXZ');
        });

        document.getElementById('toggle-pointer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.exitPointerLock();
        });

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    function toggleUI(visible) {
        const overlay = document.getElementById('game-overlay');
        const ui = document.getElementById('game-ui');
        if (overlay) overlay.classList.toggle('hidden', visible);
        if (ui) ui.classList.toggle('visible', visible);
    }

    function checkCollision(newPos) {
        if (!chunkManager) return false;

        const objs = chunkManager.getCollisionObjects();

        for (const t of objs.trees) {
            const dx = newPos.x - t.x;
            const dz = newPos.z - t.z;
            if (Math.sqrt(dx * dx + dz * dz) < t.radius + 0.5) return true;
        }
        for (const r of objs.rocks) {
            const dx = newPos.x - r.x;
            const dz = newPos.z - r.z;
            if (Math.sqrt(dx * dx + dz * dz) < r.radius) return true;
        }
        return false;
    }

    function animate() {
        if (!isActive) return;
        animationId = requestAnimationFrame(animate);

        const time = performance.now();
        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        frameCount++;
        fpsTime += delta;
        if (fpsTime >= 1) {
            const fpsEl = document.getElementById('fps-counter');
            if (fpsEl) fpsEl.textContent = frameCount;
            frameCount = 0;
            fpsTime = 0;
        }

        if (isLocked) {
            const speed = keys.shift ? 15 : 8;
            const localDz = Number(keys.s) - Number(keys.w);
            const localDx = Number(keys.d) - Number(keys.a);

            if (localDz !== 0 || localDx !== 0) {
                const len = Math.sqrt(localDx * localDx + localDz * localDz);
                const ndx = (localDx / len) * speed * delta;
                const ndz = (localDz / len) * speed * delta;

                const moveX = ndx * Math.cos(yaw) + ndz * Math.sin(yaw);
                const moveZ = -ndx * Math.sin(yaw) + ndz * Math.cos(yaw);

                const newPos = camera.position.clone();
                newPos.x += moveX;
                newPos.z += moveZ;

                if (!checkCollision(newPos)) {
                    camera.position.x = newPos.x;
                    camera.position.z = newPos.z;
                }
                camera.position.y = 2;
            }

            if (chunkManager) {
                chunkManager.updatePlayerPosition(camera.position.x, camera.position.z);
            }

            const xEl = document.getElementById('player-x');
            const zEl = document.getElementById('player-z');
            if (xEl) xEl.textContent = Math.round(camera.position.x);
            if (zEl) zEl.textContent = Math.round(camera.position.z);
        }

        renderer.render(scene, camera);
    }
    
    // Cleanup function
    function cleanup() {
        isActive = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (renderer) {
            renderer.dispose();
        }
    }

    return { init };
})();

// ============================================
// Asset Previews (with proper cleanup)
// ============================================

const AssetPreviews = (function() {
    const activeRenderers = [];
    let isActive = true;

    function createPreview(id, type, config) {
        const container = document.getElementById(id);
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1f26);

        const width = container.clientWidth || 150;
        const height = container.clientHeight || 150;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(3, 3, 5);
        camera.lookAt(0, 1, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        
        // Track renderer for cleanup
        activeRenderers.push(renderer);

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 10, 5);
        scene.add(light);

        const group = new THREE.Group();

        if (type === 'tree') {
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.2, 1, 6),
                new THREE.MeshLambertMaterial({ color: 0x5c4033 })
            );
            trunk.position.y = 0.5;
            group.add(trunk);

            for (let i = 0; i < 3; i++) {
                const leaves = new THREE.Mesh(
                    new THREE.ConeGeometry(0.8 - i * 0.2, 1.2, 6),
                    new THREE.MeshLambertMaterial({ color: config.color || 0x2d5a27 })
                );
                leaves.position.y = 1.2 + i * 0.7;
                group.add(leaves);
            }
        } else if (type === 'rock') {
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.7),
                new THREE.MeshLambertMaterial({ color: 0x808080 })
            );
            rock.position.y = 0.5;
            group.add(rock);
        } else if (type === 'detail') {
            for (let i = 0; i < 3; i++) {
                const leaf = new THREE.Mesh(
                    new THREE.ConeGeometry(0.1, 0.6, 4),
                    new THREE.MeshLambertMaterial({ color: 0x4a8a47 })
                );
                leaf.position.set((i - 1) * 0.2, 0.3, 0);
                leaf.rotation.z = (i - 1) * 0.3;
                group.add(leaf);
            }
        }

        scene.add(group);

        let time = 0;
        function animate() {
            if (!isActive) return;
            requestAnimationFrame(animate);
            time += 0.01;
            group.rotation.y = Math.sin(time) * 0.3;
            renderer.render(scene, camera);
        }
        animate();
    }
    
    // Cleanup function to dispose resources
    function cleanup() {
        isActive = false;
        activeRenderers.forEach(renderer => {
            renderer.dispose();
        });
        activeRenderers.length = 0;
    }

    function init() {
        createPreview('tree-preview', 'tree', { color: 0x2d5a27 });
        createPreview('rock-preview', 'rock', {});
        createPreview('detail-preview', 'detail', {});
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);
    }

    return { init };
})();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    HeroScene.init();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => PlayableGame.init());
    });

    AssetPreviews.init();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});