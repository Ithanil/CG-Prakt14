var Character = Class.extend({
  // Class constructor
  init: function (args) {
    /* ... */
    // Set the character modelisation object
    this.mesh = new THREE.Object3D();
    /* ... */
    // Set the rays : one vector for every potential direction
    this.rays = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(-1, 0, -1),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(-1, 0, 1)
    ];
    // And the "RayCaster", able to test for intersections
    this.caster = new THREE.Raycaster();
  },
  // Test and avoid collisions
  collision: function () {
    'use strict';
    var collisions, i,
      // Maximum distance from the origin before we consider collision
      distance = 32,
      // Get the obstacles array from our world
      obstacles = basicScene.world.getObstacles();
    // For each ray
    for (i = 0; i < this.rays.length; i += 1) {
      // We reset the raycaster to this direction
      this.caster.set(this.mesh.position, this.rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = this.caster.intersectObjects(obstacles);
      // And disable that direction if we do
      if (collisions.length > 0 && collisions[0].distance <= distance) {
        // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
        if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
          this.direction.setZ(0);
        } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
          this.direction.setZ(0);
        }
        if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
          this.direction.setX(0);
        } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
          this.direction.setX(0);
        }
      }
    }
  },
  // Process the character motions
  motion: function () {
    'use strict';
    // Update the directions if we intersect with an obstacle
    this.collision();
    // If we're not static
    if (this.direction.x !== 0 || this.direction.z !== 0) {
      // Rotate the character
      this.rotate();
      // Move the character
      this.move();
      return true;
    }
  }
  /* ... */
});