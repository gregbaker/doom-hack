var WINDOW_WIDTH = 720,
    WINDOW_HEIGHT = 720,
    MAZE_WIDTH = 10,
    MAZE_HEIGHT = 10

generate_maze = function() {
};

setup = function() {
  paper = Raphael('maze', WINDOW_WIDTH, WINDOW_HEIGHT);
  
  circ = paper.circle(25, 25, 24);
  circ.attr({
    'fill': '#f00',
    'stroke': '#000',
    'stroke-width': '2'
  });
  
  $('svg').css('border', 'solid black 1px')
};

jQuery(document).ready(setup);
