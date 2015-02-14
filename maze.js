var WINDOW_WIDTH = 720,
    WINDOW_HEIGHT = 720,
    MAZE_WIDTH = 5,
    MAZE_HEIGHT = 5,
    CELL_WIDTH = 100,
    CELL_HEIGHT = 200
    

var maze, paper;

randint = function(min, max) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * (max - min)) + min;
}

Cell = function (maze, x, y) {
  // constructor for a cell object
  var c = new Object();
  // store some metadata about ourselves
  c.maze = maze;
  c.x = x;
  c.y = y;
  // all walls up by default
  c.walls = [true, true, true, true]; // NSEW walls
  
  // directional navigation
  c.n = function() {
    if ( this.y < MAZE_HEIGHT-1 ) {
      return this.maze[this.x][this.y+1]
    }
    return null;
  }
  c.s = function() {
    if ( this.y > 0 ) {
      return this.maze[this.x][this.y-1]
    }
    return null;
  }
  c.e = function() {
    if ( this.x < MAZE_WIDTH-1 ) {
      return this.maze[this.x+1][this.y]
    }
    return null;
  }
  c.w = function() {
    if ( this.x > 0 ) {
      return this.maze[this.x-1][this.y]
    }
    return null;
  }
  
  c.neighbours = function() {
    return [this.n(), this.s(), this.e(), this.w()];
  };
  
  // are all walls up?
  c.all_walls = function() {
    return this.walls[0] && this.walls[1] && this.walls[2] && this.walls[3];
  };
  
  // array of neighours with all walls up
  c.neighbouring_with_all_walls = function() {
    var neigh = this.neighbours();
    var real_neigh = new Array();
    $(neigh).each(function(i, c){
      if ( c != null && c.all_walls() ) {
        real_neigh.push(c);
      }
    });
    return real_neigh;
  };
  
  return c;
}

generate_maze = function() {
  /* from psuedocode at http://www.mazeworks.com/mazegen/mazetut/ */
  var cell_stack = new Array();
  var total_cells = MAZE_WIDTH * MAZE_HEIGHT;
  var visited_cells = 1;
  var x, y;
  var current, next, candidates;
  
  // buide maze data structure
  var maze = new Array(MAZE_WIDTH);
  for( var i=0; i<MAZE_WIDTH; i++ ) {
    maze[i] = new Array(MAZE_HEIGHT);
    for( var j=0; j<MAZE_HEIGHT; j++ ) {
      maze[i][j] = Cell(maze, i, j);
    }
  }
  
  // knock down some walls
  x = randint(0, MAZE_WIDTH);
  y = randint(0, MAZE_HEIGHT);
  current = maze[x][y];
  while (visited_cells < total_cells) {
    candidates = current.neighbouring_with_all_walls();
    if ( candidates.length > 0 ) {
      next = candidates[randint(0, candidates.length)];
      // knock down the wall between current and next
      if (next == current.n()) {
        current.walls[0] = false;
        next.walls[1] = false;
      } else if (next == current.s()) {
        current.walls[1] = false;
        next.walls[0] = false;
      } else if (next == current.e()) {
        current.walls[2] = false;
        next.walls[3] = false;
      } else if (next == current.w()) {
        current.walls[3] = false;
        next.walls[2] = false;
      }
      
      cell_stack.push(current);
      current = next;
      visited_cells += 1;
      
    } else {
      current = cell_stack.pop()
    }
  }
  
  return maze;
};

var renderer, scene, camera;
render = function () {
  requestAnimationFrame(render);
  //camera.position.z += -1;
  renderer.render(scene, camera);
};

var floor_material = new THREE.MeshLambertMaterial({color: 0xCC0000});
var wall_material = new THREE.MeshLambertMaterial({color: 0x00CC00});

setup_three = function() {
  // basic scene setup
  scene = new THREE.Scene(); 
  camera = new THREE.PerspectiveCamera( 75, WINDOW_WIDTH/WINDOW_HEIGHT, 0.1, CELL_WIDTH*MAZE_WIDTH*10);
  renderer = new THREE.WebGLRenderer(); renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  document.body.appendChild( renderer.domElement );
  
  // lighting
  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);
  var pointLight = new THREE.PointLight( 0xFFFFFF );
  pointLight.position.set(0, CELL_HEIGHT*10, CELL_WIDTH*MAZE_HEIGHT*2);
  scene.add(pointLight);
  
  // floor
  var geom = new THREE.BoxGeometry(CELL_WIDTH*MAZE_WIDTH, 1, CELL_WIDTH*MAZE_HEIGHT); 
  var ground = new THREE.Mesh( geom, floor_material );
  ground.position.set(0, 0, 0);
  scene.add(ground);

  // draw the maze
  var geometry = new THREE.BoxGeometry( CELL_WIDTH, CELL_HEIGHT, CELL_WIDTH ); 
  cube = new THREE.Mesh( geometry, wall_material );
  cube.position.set(0, CELL_HEIGHT/2, 0)
  //scene.add( cube );

  camera.position.set(0, CELL_HEIGHT/2, CELL_WIDTH);
  render();

};

cell_pos = function(x, y) {
  // 3d base position of maze cell x,y
  return [(x+0.5)*CELL_WIDTH - CELL_WIDTH*MAZE_WIDTH/2, CELL_HEIGHT/2, -y*CELL_WIDTH + CELL_WIDTH*MAZE_HEIGHT/2]
}

draw_wall = function(x, y, xoff, yoff, width, height) {
  var geom = new THREE.BoxGeometry(width, CELL_HEIGHT, height);
  var wall = new THREE.Mesh(geom, wall_material);
  var pos = cell_pos(x, y);
  wall.position.set(pos[0] + xoff, pos[1], pos[2] + yoff);
  scene.add(wall);
}

draw_maze = function(maze) {
  var cell;
  for( var i=0; i<MAZE_WIDTH; i++ ) {
    for( var j=0; j<MAZE_HEIGHT; j++ ) {
      cell = maze[i][j];
      if ( cell.walls[0] ) { // N
        draw_wall(i, j, 0, -CELL_WIDTH, CELL_WIDTH, 1);
      }
      if ( cell.walls[1] ) { // S
        draw_wall(i, j, 0, 0, CELL_WIDTH, 1);
      }
      if ( cell.walls[2] ) { // E
        draw_wall(i, j, CELL_WIDTH/2, -CELL_WIDTH/2, 1, CELL_WIDTH);
      }
      if ( cell.walls[3] ) { // W
        draw_wall(i, j, -CELL_WIDTH/2, -CELL_WIDTH/2, 1, CELL_WIDTH);
      }
    }
  }
};


setup = function() {
  maze = generate_maze();
  setup_three();
  draw_maze(maze);
};

jQuery(document).ready(setup);
