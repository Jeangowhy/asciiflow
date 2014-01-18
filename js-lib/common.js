/**
 * Common classes.
 */
goog.provide('ascii.Vector');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
ascii.Vector = function(x, y) {
  /** type {Number} */ this.x = x;
  /** type {Number} */ this.y = y;
};

/**
 * @param {ascii.Vector} other
 * @return {boolean}
 */
ascii.Vector.prototype.equals = function(other) {
  return (other != null) && (this.x == other.x) && (this.y == other.y);
};

/**
 * @param {ascii.Vector} other
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.subtract = function(other) {
  return new ascii.Vector(this.x - other.x, this.y - other.y);
};

/**
 * @param {ascii.Vector} other
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.add = function(other) {
  return new ascii.Vector(this.x + other.x, this.y + other.y);
};

/**
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.clone = function() {
  return new ascii.Vector(this.x, this.y);
};

/** @return {number} */
ascii.Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * @param {number} scale
 * @return {ascii.Vector}
 */
ascii.Vector.prototype.scale = function(scale) {
  return new ascii.Vector(this.x * scale, this.y * scale);
};

