class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.baseHeight = 720;
    this.ratio=this.height/this.baseHeight;
    this.background = new Background(this);
    this.player = new Player(this);
    this.sound = new AudioControl(); // Initialize audio control
    this.obstacles = [];
    this.numberOfObstacles = 10; // Number of obstacles to generate
    this.gravity;
    this.speed;
    this.minSpeed;
    this.maxSpeed;
    this.score;
    this.gameOver;// Flag to track game over state
    this.bottomMargin;
    this.timer;
    this.message1;
    this.message2;
    this.eventTimer = 0; // Timer for obstacle generation
    this.eventInterval = 150; // Interval for generating obstacles
    this.eventUpdate = false; // Timer for updating the event
    this.touchStartX;
    this.swipeDistance = 50; // Distance to trigger Dash on swipe
    this.debug = false; // Flag to toggle debug mode

    this.resize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.resize(window.innerWidth, window.innerHeight);
    });
    //Mouse Controls
    this.canvas.addEventListener('mousedown', (e) => {
      this.player.flap();
    });
    this.canvas.addEventListener('mouseup', (e) => {
      this.player.wingsUp();
    });
    //keyboard controls
    window.addEventListener('keydown', (e) => {
      console.log(e.key);
      if (e.key === ' ' || e.key === 'Enter') this.player.flap();
      if (e.key === 'Shift' || e.key.toLowerCase() === 'c') {
        this.player.startCharge(); // Start charging for Dash
      }
      if (e.key.toLowerCase() === 'r') {
        this.resize(window.innerWidth, window.innerHeight); // Reset the game on 'R' key press
        if (e.key.toLowerCase() === 'f') {
          this.toggleFullscreen(); // Toggle fullscreen mode on 'R' key press
        }
        this.debug = false; // Flag to toggle debug mode
        if (e.key.toLowerCase() === 'd') {
          this.debug = !this.debug; // Toggle debug mode on 'D' key press
      }
    }
    });
    window.addEventListener('keyup', (e) => {
      this.player.wingsUp(); // Reset player animation on key release
    });
    //Touch Controls
    this.canvas.addEventListener('touchstart', (e) => {
      this.player.flap();
      this.touchStartX = e.changedTouches[0].pageX; // Store the initial touch position
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance) {
        this.player.startCharge(); // Start charging for Dash if swiped right
      }
    });
  }

  resize(width, height) {
    // update canvas resolution
    this.canvas.width = width;
    this.canvas.height =  height;
    this.ctx.fillStyle = 'cyan';
    this.ctx.font = `15px 'Bungee Inline', 'Titillium Web', sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'white';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ratio=this.height/this.baseHeight;
    // update player properties
    this.bottomMargin = Math.floor(50 * this.ratio); // Bottom margin for player
    this.gravity = 0.15 * this.ratio;
    this.speed = 2 * this.ratio;
    this.minSpeed = this.speed;
    this.maxSpeed = this.speed * 5; // Maximum speed for Dash
    this.background.resize();
    this.player.resize();
    this.createObstacles();
    this.obstacles.forEach(obstacle => {
      obstacle.resize();
    });
    this.score = 0; // Reset score on resize
    this.gameOver = false; // Reset game over state on resize
    this.timer = 0; // Reset timer on resize
  }

  render(deltaTime) {
    if (!this.gameOver) this.timer += deltaTime;
    this.handlePeriodicEvents(deltaTime);
    this.background.update();
    this.background.draw();
    this.drawStatusText(); 
    this.player.update();
    this.player.draw();
    this.obstacles.forEach(obstacle => {
      obstacle.update();
      obstacle.draw();
    });
  }
  createObstacles() {
    this.obstacles = [];
    const firstX = this.baseHeight * this.ratio; // Start obstacles at the right edge of the screen
    const obstacleSpacing = 600 * this.ratio; // Space between obstacles
    for (let i=0; i < this.numberOfObstacles; i++) {
      this.obstacles.push(new Obstacle(this, firstX + i * obstacleSpacing));
    }
  }
  checekCollision(a,b) {
    const dx = a.collisionX - b.collisionX;
    const dy = a.collisionY - b.collisionY;
    const distance = Math.hypot(dx, dy);
    // Check if the distance between the two objects is less than the sum of their collision radii
    const sumOfRadii = a.collisionRadius + b.collisionRadius;
    return distance <= sumOfRadii;
  }
  formatTimer() {
    return (this.timer * 0.001).toFixed(2); // Convert milliseconds to seconds
  }
  handlePeriodicEvents(deltaTime) {
    if (this.eventTimer < this.eventInterval) {
      this.eventTimer += deltaTime;
      this.eventUpdate = false; // Reset event update flag
    } else {
      this.eventTimer = this.eventTimer % this.eventInterval; // Reset timer
      this.eventUpdate = true; // Set event update flag
    }
}
  drawStatusText() {
    /*this.ctx.save();
    this.ctx.fillText(`Score : `+ this.score , this.width - 10 , 30);
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Timer : `+ this.formatTimer() , 10 , 30);
    let lineHeight = 20 * this.ratio;
    if (this.gameOver) {
      if(this.player.collided) {
        this.message1 = 'Getting Rusty? 💀';
        this.message2 = "Collision Time "+ this.formatTimer() + " seconds ! ";
      } else if (this.obstacles.length <= 0) {
        this.sound.play(this.sound.win); // Play win sound
        this.message1 = 'Nailed It ! 🏆';
        this.message2 = "Can you do it faster than "+ this.formatTimer() + " seconds ? 👀";
      }
      this.ctx.textAlign = 'center';
      this.ctx.font = `30px 'Bungee Inline', 'Titillium Web', sans-serif`;
      this.ctx.fillText(this.message1,this.width * 0.5, this.height * 0.5 - 40 );
      this.ctx.font = `15px 'Bungee Inline', 'Titillium Web', sans-serif`;
      this.ctx.fillText(this.message2,this.width * 0.5, this.height * 0.5 -20 );
      this.ctx.fillText("Press 'R' To Try Again ! 🙌",this.width * 0.5, this.height * 0.5);
    }*/
   this.ctx.save();
this.ctx.fillText(`Score : ` + this.score, this.width - 10, 30);
this.ctx.textAlign = 'left';
this.ctx.fillText(`Timer : ` + this.formatTimer(), 10, 30);

let lineHeight = 40 * this.ratio; // adjustable spacing

if (this.gameOver) {
  if (this.player.collided) {
    this.message1 = 'Getting Rusty? 💀';
    this.message2 = "Collision Time " + this.formatTimer() + " seconds ! ";
  } else if (this.obstacles.length <= 0) {
    this.sound.play(this.sound.win); // Play win sound
    this.message1 = 'Nailed It ! 🏆';
    this.message2 = "Can you do it faster than " + this.formatTimer() + " seconds ? 👀";
  }

  this.ctx.textAlign = 'center';

  // Line 1
  this.ctx.font = `35px 'Bungee Inline', 'Titillium Web', sans-serif`;
  this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5 - lineHeight);

  // Line 2
  this.ctx.font = `20px 'Bungee Inline', 'Titillium Web', sans-serif`;
  this.ctx.fillText(this.message2, this.width * 0.5, this.height * 0.5);

  // Line 3
  this.ctx.fillText("Press 'R' To Try Again ! 🙌", this.width * 0.5, this.height * 0.5 + lineHeight);
}

    /*if (this.player.energy <= this.player.minEnergy) {
      this.ctx.fillStyle = 'orange'; // Change color to red when energy is low
    } else if (this.player.energy >= this.player.maxEnergy) {
      this.ctx.fillStyle = 'green'; // Change color to green when energy is full
    }
    for(let i = 0 ; i < this.player.energy; i++) {
      this.ctx.fillRect(10,this.height - 10 - this.player.barSize * i ,this.player.barSize * 5 , this.player.barSize);
    }*/
   // === ADAPTIVE ENERGY BAR WITH SMOOTH RED DRAIN + LOW ENERGY PULSE ===
const hudMargin = this.canvas.height * 0.04;

const barWidth = this.canvas.width * 0.3;    
const barHeight = this.canvas.height * 0.035; 

const barX = (this.canvas.width / 2) - (barWidth / 2);
const barY = hudMargin;

const energyRatio = this.player.energy / this.player.maxEnergy;
const currentBarWidth = barWidth * energyRatio;

// --- Keep track of red drain separately ---
if (!this.prevEnergyWidth) this.prevEnergyWidth = currentBarWidth;
if (!this.drainAlpha) this.drainAlpha = 1.0;

if (currentBarWidth < this.prevEnergyWidth) {
  // energy dropped → reset red drain to full alpha
  this.drainAlpha = 1.0;
  this.prevEnergyWidth -= (this.prevEnergyWidth - currentBarWidth) * 0.08;
} else {
  // energy increased → catch up
  this.prevEnergyWidth = currentBarWidth;
}

// --- Neon outline ---
this.ctx.strokeStyle = "#0ff";
this.ctx.lineWidth = 2;
this.ctx.shadowColor = "#0ff";
this.ctx.shadowBlur = 12;

// ⚡ If energy is low → add pulsing red glow
if (energyRatio < 0.2) {
  const pulse = (Math.sin(Date.now() / 200) + 1) / 2; // 0 → 1 oscillation
  this.ctx.shadowColor = `rgba(255,0,0,${0.6 + 0.4 * pulse})`;
  this.ctx.shadowBlur = 18 + 6 * pulse;
}

this.ctx.strokeRect(barX, barY, barWidth, barHeight);
this.ctx.shadowBlur = 0;

// --- Background ---
this.ctx.fillStyle = "rgba(0,0,0,0.5)";
this.ctx.fillRect(barX, barY, barWidth, barHeight);

// --- Green fill (current energy) ---
this.ctx.fillStyle = "limegreen";
this.ctx.fillRect(barX, barY, currentBarWidth, barHeight);

// --- Red drain overlay with fade ---
if (this.prevEnergyWidth > currentBarWidth) {
  this.ctx.fillStyle = `rgba(255,0,0,${this.drainAlpha})`;
  this.ctx.fillRect(barX + currentBarWidth, barY, this.prevEnergyWidth - currentBarWidth, barHeight);

  // slowly fade out
  this.drainAlpha = Math.max(0, this.drainAlpha - 0.02);
}

// --- Text inside bar ---
this.ctx.font = `${Math.floor(barHeight * 0.6)}px 'Bungee Inline', 'Titillium Web', sans-serif`;
this.ctx.fillStyle = "white";
this.ctx.textAlign = "center";
this.ctx.textBaseline = "middle";
this.ctx.shadowColor = "#f0f";
this.ctx.shadowBlur = 8;
this.ctx.fillText("CHARGE", barX + barWidth / 2, barY + barHeight / 2);
this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width=720;
  canvas.height=720;

  const game = new Game(canvas, ctx);

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(deltaTime);
     requestAnimationFrame(animate);
  }
  this.requestAnimationFrame(animate);
});