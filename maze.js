var WINDOW_WIDTH = 720,
    WINDOW_HEIGHT = 720,
    MAZE_WIDTH = 4,
    MAZE_HEIGHT = 5

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
var cube;
render = function () {
  requestAnimationFrame(render);
  cube.rotation.x += 0.02; cube.rotation.y += 0.02;
  renderer.render(scene, camera);
};
  
setup_three = function() {
  scene = new THREE.Scene(); 
  camera = new THREE.PerspectiveCamera( 75, WINDOW_WIDTH/WINDOW_HEIGHT, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer(); renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  document.body.appendChild( renderer.domElement );
  var geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  camera.position.z = 5;

  render();

};




setup = function() {
  maze = generate_maze();
  setup_three();
};

jQuery(document).ready(setup);
