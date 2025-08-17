class Player{
  constructor(game){
    this.game = game;
    this.x = 20;
    this.y;
    this.spirteWidth = 200;
    this.spriteHeight = 200;
    this.width;
    this.height;
    this.speedY;
    this.flapSpeed;
    this.collisionX;
    this.collisionY;
    this.collisionRadius; 
    this.collided; // Flag to indicate if the player has collided with an obstacle
    this.energy = 20; // Player's energy level
    this.maxEnergy = this.energy * 2; // Maximum energy level
    this.minEnergy = 10; // Minimum energy level
    this.barSize;
    this.charging; // Flag to indicate if the player is charging for Dash
    this.image = document.getElementById('player_fish');
    this.frameY; // Frame for player animation
  }
  draw(){
    this.game.ctx.drawImage(this.image, 0, this.frameY * this.spriteHeight, this.spirteWidth, this.spriteHeight,this.x, this.y, this.width, this.height);
    if (this.game.debug) {
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.collisionX + this.collisionRadius * 0.9, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
    this.game.ctx.stroke();
    }
  }
  update(){
    this.handleEnergy();
    if (this.speedY >= 0) {
      this.wingsUp(); // Set frame for up animation when moving down
    }
    this.y += this.speedY;
    this.collisionY = this.y + this.height * 0.5; // Center of the player for collision detection
      if(!this.isTouchingBottom() && !this.charging){
        this.speedY += this.game.gravity;
      } else {
        this.speedY = 0; // Reset speed if touching the bottom
      }
      // Bottom boundary
      if (this.isTouchingBottom()) {
        this.y = this.game.height - this.height - this.game.bottomMargin; // Adjust position to stay above the bottom margin
        this.wingsIdle(); // Set frame for idle animation when touching the bottom
      }
  }
  resize(){
    this.width = this.spirteWidth * this.game.ratio;
    this.height = this.spriteHeight * this.game.ratio;
    this.y = this.game.height * 0.5 - this.height * 0.5;
    this.speedY = -8 * this.game.ratio; // Initial speed
    this.flapSpeed = 5 * this.game.ratio; // Speed when flapping
    this.collisionRadius = 40 * this.game.ratio; // Collision radius based on width
    this.collisionX = this.x + this.width * 0.5; // Center of the player for collision detection
    this.collided = false; // Reset collision flag on resize
    this.barSize = Math.floor(5 * this.game.ratio); // Size of the energy bar
    this.energy = 20;
    this.frameY = 0;
    this.charging = false; // Reset charging flag on resiz
  }
  startCharge() {
    if (this.energy >= this.minEnergy && !this.charging) {
    this.charging = true; // Set charging flag
    this.game.speed = this.game.maxSpeed; // Set game speed to maximum for Dash
    this.wingsCharge(); // Set frame for charging animation
    this.game.sound.charge.play(this.game.sound.charge); // Play charging sound
    } else {
      this.stopCharge(); // Stop charging if energy is below minimum
    }
  }
  stopCharge() {
    this.charging = false; // Reset charging flag
    this.game.speed = this.game.minSpeed; // Reset game speed to minimum after Dash
  }
  wingsIdle() {
    if(!this.charging) this.frameY = 0; // Set frame for idle animation
  }
  wingsDown() {
    if(!this.charging) this.frameY = 1; // Set frame for down animation
  }
  wingsUp() {
    if(!this.charging) this.frameY = 2; // Set frame for up animation
  }
  wingsCharge(){
    this.frameY = 3; // Set frame for charging animation
  }
  isTouchingTop(){
    return this.y <= 0;
  }
  isTouchingBottom(){
    return this.y >= this.game.height - this.height - this.game.bottomMargin; // Check if player is touching the bottom with margin
  }
  handleEnergy(){
    if(this.game.eventUpdate){
      if (this.energy < this.maxEnergy) {
      this.energy += 1; // Regenerate energy over time
      }
      if (this.charging) {
        this.energy -= 10; // Drain energy while charging for Dash
        if(this.energy <= 0) {
        this.energy = 0; // Prevent energy from going below 0
        this.stopCharge(); // Stop charging if energy is depleted
        }
      }
    }
  }
  flap(){
    this.stopCharge(); // Stop charging when flapping
    if(!this.isTouchingTop()){
      this.speedY = -this.flapSpeed;
      this.game.sound.play(this.game.sound.flapSounds[Math.floor(Math.random() * 5)]); // Play flap sound
      this.wingsDown(); // Set frame for down animation when flapping
    }
  }
}