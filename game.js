
//Hector Mauricio Gonzalez Coello
//A01328258

var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
player = null,
column= null,
enemyplayer = null,
floor = null,
directionalLight = null;
orbitControls = null;

var object;
var animator = null;
var loopAnimation = true;

var moveLeft = false;
var moveRight = false;

var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

var controls = null;
var keyboard = null;

var obstacles = [];
var bullets = [];

var player_loaded = 0;
var column_loaded;
var bool = true;

var floorAnimator = null;
var animateFloor = true;

var objLoader = null;
var mtlLoader = null;

var duration = 1500; // ms
var currentTime = Date.now();
var actualTime = Date.now();
var startedTime = Date.now();

var score = 0; 
var isGameRunning = false;
var health = 100;

function start(){

    isGameRunning = true;
    document.getElementById("startButton").innerHTML.disabled = true;
    startedTime = Date.now();
    currentTime = Date.now();
    actualTime = Date.now();
}

function cloneObstacle(){

    var newcolumn = column.clone();

    zPos = Math.floor(Math.random() * 200) - 100  

    newcolumn.position.z = zPos;
    newcolumn.position.x = -550;
    newcolumn.position.y = 0;
    newcolumn.bbox = new THREE.Box3()
    newcolumn.bbox.setFromObject(newcolumn)
    scene.add(newcolumn);
    obstacles.push(newcolumn);

}

function cloneEnemy(){

    var enemyClone = enemyplayer.clone();

    zPos = Math.floor(Math.random() * 200) - 100  

    enemyClone.position.z = zPos;
    enemyClone.position.x = -550;
    enemyClone.position.y = 30;
    enemyClone.bbox = new THREE.Box3()
    enemyClone.bbox.setFromObject(enemyClone)             
    enemyClone.type = "enemy";

    scene.add(enemyClone);
    obstacles.push(enemyClone);

}

function animate() {
    player.bbox.setFromObject(player)

    var now = Date.now();
    var delta = now - currentTime;
    currentTime = now;

    seconds = (now - actualTime)/1000
    
    if (seconds >= 3 ){
 
        cloneObstacle(); 
        cloneEnemy();
        actualTime = now;
    }
    direction.z = Number( moveLeft ) - Number( moveRight );
    direction.normalize();
    if ( moveLeft || moveRight ) velocity.z += direction.z *0.003* delta;
    
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    velocity.y = 0;
    velocity.z = 0;

    player.bbox.setFromObject(player)

    for(column_i of obstacles){
        column_i.bbox.setFromObject(column_i)
        column_i.position.x += 5;
        if (column_i.position.x >= 400)
        {
            scene.remove(column_i)
            obstacles.shift()
        }

        if (player.bbox.intersectsBox(column_i.bbox)){
            health--;
            document.getElementById("health").innerHTML = "Health: "+ health;
        }
        
    }
    if (bullets.length > 0){

        for (bullet of bullets){

            bullet.position.x -= 10;

            if (bullet.position.x <= -100){
                scene.remove(bullet)
                bullet.inGame = false
            }
            else if (bullet.inGame != false) {

                bullet.bbox.setFromObject(bullet)
    
                for (column_i of obstacles){
                    column_i.bbox.setFromObject(column_i);
                    if (bullet.bbox.intersectsBox(column_i.bbox) && column_i.type == "enemy"){
                        score ++;
                        document.getElementById("score").innerHTML = "Total Kills: " + score;
                        scene.remove(column_i)
                        scene.remove(bullet)
      
                    }
        
                }
            }
               
        }
    }  
}

function ResetGame(){

    for(bullet of bullets){
        scene.remove(bullet)
    }
    for (column_i of obstacles){
        scene.remove(bullets)
    }

    health = 100;

    bullets = [];
    obstacles = [];

    isGameRunning = false;

}

function run()
{
    requestAnimationFrame(function() { run(); });

        renderer.render( scene, camera );
    
        if (isGameRunning){
            // Render the scene
            NowTime = Date.now();
            elapsedTime = (NowTime - startedTime)/1000

            console.log(elapsedTime)

            if (elapsedTime >= 60 || health <= 0) {

                ResetGame();
                document.getElementById("startButton").innerHTML.disabled = true;
                           
            }
            // Update the animations
            KF.update();
        
            floorAnimator.start();
            animate();
        }

}

function loadPlayer()
{
    if(!objLoader)

        objLoader = new THREE.OBJLoader();

        objLoader.load(
            'models/F15C/F-15C_Eagle.obj',

            function(object)
            {    
                object.traverse( function ( child ) 
                {
                    if ( child instanceof THREE.Mesh ) 
                    {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                } );
                        
                player = object;
                player.scale.set(1,1,1);
                player.bbox = new THREE.Box3()
                player.bbox.setFromObject(player)
                player.position.z = 0;
                player.position.x = 400;
                player.position.y = 30;
                player.rotation.y = Math.PI /2;
            
                group.add(player);

            },
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

                player_loaded = ( xhr.loaded / xhr.total * 100 )

                if (player_loaded >= 100 && bool){
                    console.log("controls")
                    controls = new THREE.PointerLockControls(group);
                    scene.add(controls.getObject());
                    bool = false;
                }
        
            },
            function ( error ) {
        
                console.log( 'An error happened' );
        
            });
    
}
function loadEnemy(){

    console.log("Loading enemy")

        if(!mtlLoader)

            mtlLoader = new THREE.MTLLoader();

            mtlLoader.load('models/E-45/E_45_Aircraft_obj.mtl',
                
            function(materials){

            materials.preload();

            if(!objLoader)

                objLoader = new THREE.OBJLoader();

                objLoader.setMaterials(materials)

                objLoader.load(
                    'models/E-45/E_45_Aircraft_obj.obj',

                function(object)
                {    
                    object.traverse( function ( child ) 
                    {
                        if ( child instanceof THREE.Mesh ) 
                        {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    } );
                            
                    enemyplayer = object;
                    enemyplayer.scale.set(10,10,10);
                    enemyplayer.bbox = new THREE.Box3()
                    enemyplayer.bbox.setFromObject(enemyplayer)
                    enemyplayer.position.z = 0;
                    enemyplayer.position.x = 300;
                    enemyplayer.position.y = 50;
                    enemyplayer.rotation.y = Math.PI/2;
                },
                function ( xhr ) {

                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

                    column_loaded = ( xhr.loaded / xhr.total * 100 )
            
                },
                function ( error ) {
            
                    console.log( 'An error happened' );
            
                });
        })
}

function loadObstacles()
{
    if(!objLoader)

    objLoader = new THREE.OBJLoader();

    objLoader.load(
        'models/stickman.OBJ',

        function(object)
        {       
            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );
                    
            column = object;
            column.scale.set(2,2,2);
            column.bbox = new THREE.Box3()
            column.bbox.setFromObject(column)
            column.position.z = 0;
            column.position.x = -250;
            column.position.y = -150;
            column.rotation.y = Math.PI;
            
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            player_loaded = ( xhr.loaded / xhr.total * 100 )

        },
        function ( error ) {
    
            console.log( 'An error happened' );
    
    });
}


function shoot(){

    var material = new THREE.MeshPhongMaterial({color: 0x00ff00 });
    var geometry = new THREE.CubeGeometry(3, 1, 1);
    cube = new THREE.Mesh(geometry, material);

    cube.position.y = player.bbox.min.y;
    cube.position.z = player.bbox.min.z;
    cube.position.x = player.bbox.min.x;
    cube.bbox = new THREE.Box3()
    cube.bbox.setFromObject(cube)

    bullets.push(cube);
    scene.add(cube)

}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(window.innerWidth -20, window.innerHeight -20);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(500,50,0);
    camera.lookAt(new THREE.Vector3(0,50,0))
    scene.add(camera);
    root = new THREE.Object3D;
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set(0, 50, 300);
    root.add(directionalLight);
    var pointLight = new THREE.PointLight (0xffffff, 0.5, 10000);
    pointLight.position.set(350, 350, 300);
    pointLight.castShadow = true;
    pointLight.shadow.camera.far = 4000;
    scene.add(pointLight);    
    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    group = new THREE.Object3D;
    root.add(group);
    var map = new THREE.TextureLoader().load("images/plane.jpg");
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(10,10);
    var color = 0xffffff;
    geometry = new THREE.PlaneGeometry(800, 1500, 50, 50);
    floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    root.add( floor );
    floor.castShadow = false;
    floor.receiveShadow = true;
    scene.add( root );

    loadPlayer();
    loadObstacles();
    loadEnemy();

    //controls
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 37:
            case 65:
                moveLeft = true;
                break;
            case 39:
            case 68:
                moveRight = true;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch ( event.keyCode ) {
            case 37:
            case 65:
                moveLeft = false;
                break;
            case 39:
            case 68:
                moveRight = false;
                break;
            case 32:
                shoot()
                break;
        }
    };

    window.addEventListener( 'resize', onWindowResize);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

	var skyGeometry = new THREE.CubeGeometry( 1500, 1500, 1500 );		
	var cubeMaterials = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "images/nightsky_ft.png" ), side: THREE.DoubleSide }), //front side
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'images/nightsky_bk.png' ), side: THREE.DoubleSide }), //back side
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'images/nightsky_up.png' ), side: THREE.DoubleSide }), //up side
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'images/nightsky_dn.png' ), side: THREE.DoubleSide }), //down side
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'images/nightsky_rt.png' ), side: THREE.DoubleSide }), //right side
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'images/nightsky_lf.png' ), side: THREE.DoubleSide }) //left side
    ];
	var skyMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add(skyBox);
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function playAnimations()
{
    if (animateFloor)
    {
        floorAnimator = new KF.KeyFrameAnimator;
        floorAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, 1], 
                        values:[
                                { x : 0, y : 0 },
                                { x : -3, y : 0 },
                                ],
                        target:floor.material.map.offset
                    },
                ],
            loop: loopAnimation,
            duration:duration,
        });
    }
}