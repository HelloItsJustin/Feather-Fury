class Obstacle {
  constructor(game , x) {
    this.game = game;
    this.spriteWidth = 120;
    this.spriteHeight = 120;
    this.scaledWidth = this.spriteWidth * this.game.ratio;
    this.scaledHeight = this.spriteHeight * this.game.ratio;
    this.x = x;
    this.y = Math.random() * (this.game.height - this.scaledHeight); // Random vertical position
    this.collisionX;
    this.collisionY;
    this.collisionRadius; // Collision radius based on width
    this.speedY = Math.random() < 0.5 ? -1 * this.game.ratio:  1 * this.game.ratio; // Randomly set speed to move up or down
    this.markedForDeletion = false; // Flag to mark obstacle for deletion
    this.image = document.getElementById('smallGears'); // Use the smallGears image for obstacles
    this.frameX = Math.floor(Math.random() * 4); // Random frame for obstacle animation
  }
  update() {
    this.x -= this.game.speed;
    this.y += this.speedY;
    this.collisionX = this.x + this.scaledWidth * 0.5; // Center of the obstacle for collision detection
    this.collisionY = this.y + this.scaledHeight * 0.5; // Center of the obstacle for collision detection
    if(!this.game.gameOver){
       if (this.y <= 0 || this.y >= this.game.height - this.scaledHeight) {
      this.speedY *= -1; // Reverse direction if hitting top or bottom
    }
    } else {
      this.speedY += 0.1; // Gravity effect when game is over
    }
    if (this.isOffScreen()) {
      this.markedForDeletion = true; // Mark obstacle for deletion if it goes off screen
      this.game.obstacles = this.game.obstacles.filter(obstacle => !obstacle.markedForDeletion); // Remove marked obstacles
      if (!this.game.gameOver) {
        this.game.score += 1; // Increase score when obstacle is removed
  }
      if (this.game.obstacles.length <= 0) this.game.gameOver = true; // Set game over if no obstacles left
    }
    if(this.game.checekCollision(this, this.game.player)) {
      this.game.gameOver = true; // Set game over if collision detected with player
      this.game.player.collided = true; // Set player collision flag
      this.game.player.stopCharge(); // Stop charging if player collides with an obstacle
      this.game.sound.loose.play(this.game.sound.loose); // Play loose sound on collision
    }
  }
  draw() {
    this.game.ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.scaledWidth, this.scaledHeight);
    if (this.game.debug) {
      this.game.ctx.beginPath();
    this.game.ctx.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
    this.game.ctx.stroke();
  }
    }
  resize() {
    this.scaledWidth = this.spriteWidth * this.game.ratio;
    this.scaledHeight = this.spriteHeight * this.game.ratio;
    this.collisionRadius = this.scaledWidth * 0.4; // Collision radius based on width
  }
  isOffScreen() {
    return this.x < -this.scaledWidth || this.y > this.game.height; // Check if the obstacle is off the left side of the screen
  }
}