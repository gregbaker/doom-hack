var WINDOW_WIDTH = 720,
    WINDOW_HEIGHT = 720,
    MAZE_WIDTH = 5,
    MAZE_HEIGHT = 5,
    CELL_WIDTH = 100,
    CELL_HEIGHT = 200;

var GOAL_X = MAZE_WIDTH - 1,
    GOAL_Y = MAZE_HEIGHT - 1;

var floor_material = new THREE.MeshLambertMaterial({
  map: THREE.ImageUtils.loadTexture(floor_texture)
});
var wall_material = new THREE.MeshLambertMaterial({
  map: THREE.ImageUtils.loadTexture(wall_texture)
});
var goal_material = new THREE.MeshLambertMaterial({
  map: THREE.ImageUtils.loadTexture(goal_texture)
});

var maze, game={};
var renderer, scene, camera;

var randint = function (min, max) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * (max - min)) + min;
};

var Cell = function (maze, x, y) {
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

var generate_maze = function() {
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

render = function () {
  requestAnimationFrame(render);
  //camera.position.y += 1;
  renderer.render(scene, camera);
};

var setup_three = function() {
  // basic scene setup
  scene = new THREE.Scene(); 
  camera = new THREE.PerspectiveCamera( 120, WINDOW_WIDTH/WINDOW_HEIGHT, 0.1, CELL_WIDTH*MAZE_WIDTH*10);
  renderer = new THREE.WebGLRenderer({antialias: true}); 
  renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
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

  render();
};

var cell_pos = function(x, y) {
  // 3d base position of maze cell x,y
  return [(x+0.5)*CELL_WIDTH - CELL_WIDTH*MAZE_WIDTH/2, CELL_HEIGHT/2, -y*CELL_WIDTH + CELL_WIDTH*MAZE_HEIGHT/2]
}

var draw_wall = function(x, y, xoff, yoff, width, height) {
  var geom = new THREE.BoxGeometry(width, CELL_HEIGHT, height);
  var wall = new THREE.Mesh(geom, wall_material);
  var pos = cell_pos(x, y);
  wall.position.set(pos[0] + xoff, pos[1], pos[2] + yoff);
  scene.add(wall);
}

var draw_maze = function() {
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
  
  // goal
  var geom = new THREE.SphereGeometry(CELL_WIDTH/2, 16, 16);
  var goal = new THREE.Mesh(geom, goal_material);
  var pos = cell_pos(GOAL_X, GOAL_Y);
  goal.position.set(pos[0], CELL_HEIGHT/2, pos[2] - CELL_WIDTH/2);
  scene.add(goal);
};

var position_camera = function() {
  var pos = cell_pos(game.x, game.y);
  var look;
  camera.position.set(pos[0], CELL_HEIGHT*0.5, pos[2] - CELL_WIDTH/2);
  if ( game.facing == 0 ) { // N
    look = cell_pos(game.x, game.y+1);
  } else if ( game.facing == 1 ) { // S
    look = cell_pos(game.x, game.y-1);
  } else if ( game.facing == 2 ) { // E
    look = cell_pos(game.x+1, game.y);
  } else if ( game.facing == 3 ) { // W
    look = cell_pos(game.x-1, game.y);
  }
  camera.lookAt(new THREE.Vector3(look[0], look[1], look[2] - CELL_WIDTH/2));
};

var init_game = function() {
  game.x = 0;
  game.y = 0;
  game.facing = 0;
  game.won = false
  position_camera();
};

var check_goal = function() {
  if (game.x == GOAL_X && game.y == GOAL_Y) {
    game.won = True;
    alert("Winner");
  }
};

var handle_key = function(e) {
  var cell = maze[game.x][game.y];
  console.log(game, cell)
  if ( e.key == 'Right' ) {
    if ( game.facing == 0 ) { // N
      game.facing = 2;
    } else if ( game.facing == 1 ) { // S
      game.facing = 3;
    } else if ( game.facing == 2 ) { // E
      game.facing = 1;
    } else if ( game.facing == 3 ) { // W
      game.facing = 0;
    }
  } else if ( e.key == 'Left' ) {
    if ( game.facing == 0 ) { // N
      game.facing = 3;
    } else if ( game.facing == 1 ) { // S
      game.facing = 2;
    } else if ( game.facing == 2 ) { // E
      game.facing = 0;
    } else if ( game.facing == 3 ) { // W
      game.facing = 1;
    }
  } else if ( e.key == 'Up' ) {
    if ( game.facing == 0 && !cell.walls[0] ) { // N
      game.y += 1;
    } else if ( game.facing == 1 && !cell.walls[1] ) { // S
      game.y -= 1;
    } else if ( game.facing == 2 && !cell.walls[2] ) { // E
      game.x += 1;
    } else if ( game.facing == 3 && !cell.walls[3] ) { // W
      game.x -= 1;
    }
  } else if ( e.key == 'Down' ) {
    if ( game.facing == 0 && !cell.walls[1] ) { // N
      game.y -= 1;
    } else if ( game.facing == 1 && !cell.walls[2] ) { // S
      game.y += 1;
    } else if ( game.facing == 2 && !cell.walls[3] ) { // E
      game.x -= 1;
    } else if ( game.facing == 3 && !cell.walls[2] ) { // W
      game.x += 1;
    }
  } else if ( e.key == 'z' ) {
    if ( game.facing == 0 && !cell.walls[3] ) { // N
      game.x -= 1;
    } else if ( game.facing == 1 && !cell.walls[2] ) { // S
      game.x += 1;
    } else if ( game.facing == 2 && !cell.walls[0] ) { // E
      game.y += 1;
    } else if ( game.facing == 3 && !cell.walls[1] ) { // W
      game.y -= 1;
    }
  } else if ( e.key == 'x' ) {
    if ( game.facing == 0 && !cell.walls[2] ) { // N
      game.x += 1;
    } else if ( game.facing == 1 && !cell.walls[3] ) { // S
      game.x -= 1;
    } else if ( game.facing == 2 && !cell.walls[1] ) { // E
      game.y -= 1;
    } else if ( game.facing == 3 && !cell.walls[0] ) { // W
      game.y += 1;
    }
  }
  position_camera();
  check_goal();
};

var setup = function() {
  maze = generate_maze();
  setup_three();
  draw_maze();
  init_game();
  $("body").keypress(handle_key);
};

jQuery(document).ready(setup);
