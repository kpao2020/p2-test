// Team : Ken Pao, Yuying Huang
// Class: ART 259
// Assignment: Project 2
// Title: Bunny Cards
// Game link 1: https://kpao2020.github.io/art259-p2/
// Game link 2: https://bunny-cards.glitch.me
// Reference: listed at the end of this file
///////////////////////////////////////////////////////////////////////////////

let cards = []; // Array to store card objects
let flipCards = []; // Array to track flipped cards (2 max)
let cardImages = []; // Array of card images
let bonusImages = []; // Array of bonus images
let levelImages = []; // Array of images for each level
let backImage; // Back of card image
let cardSize; // Card size based on level and screen size
let space; // Spacer between cards
let level; // Level grid
let gameTime, startTime, levelTime, lTime, winTime; // Timing variables
let startBtn, levelBtn; // Start button
let gameStart; // Game start state = true or false
let score, tScore; // Keep track of score
let cardRemain; // Keep track of remaining cards
let balls; // End game animation
let endMessage; // Display end game message
let allowFlip; // Flip control state
let carrots, carrotImages=[]; // Start page animation
let bunny, winImage, loseImage; // Win/Lose page image
let sounds, soundBtn, isMute, soundOnImg, soundOffImg; // Sound variables
let bg; // Background image
let dp, isBonus; // Double Point Bonus state and check
let bonusFlip, bonusOpen=[]; // Bonus Open Cards count and array
let winPair; // Win match cards animation

// Class Card defines coordinate, size, image, 
// flip state, mouse hover check and display function
class Card {
  constructor(x, y, size, img) {
    this.x = x;
    this.y = y;
    this.w = size.w;
    this.h = size.h;
    this.img = img;
    this.flipped = false; // false = face down
    this.bonus = false;
  }

  // show card image
  display() {
    if (this.bonus){
      strokeWeight(10);
      stroke('gold');
    } else {
      strokeWeight(0); 
    }
    rect(this.x, this.y, this.w, this.h, 5);
    if (this.flipped) {
      image(this.img, this.x, this.y, this.w, this.h);
    } else {
      image(backImage, this.x, this.y, this.w, this.h);
    }
  }

  // check if mouse is 'hover' within each card area
  hovers(px, py) {
    return (px > this.x && px < this.x + this.w && py > this.y && py < this.y + this.h);
  }

  // flip state
  flip() {
    this.flipped = !this.flipped;
  }

  // Bonus state
  setBonus() {
    this.bonus = !this.bonus;
  }
}

// Preload images and sound files into memory
function preload() {
  // Load all card images - total 26
  for (let i = 0; i < 32; i++) {
    cardImages.push(loadImage('image/bunny'+i+'.png')); 
  }

  // Load all bonus images - total 4
  for (let b = 0; b < 8; b++) {
    bonusImages.push(loadImage('image/bonus'+b+'.png')); 
  }

  // Load carrot animation images - total 2
  for (let j = 0; j < 2; j++) {
    carrotImages.push(loadImage('image/carrotmove'+j+'.png')); 
  }

  backImage = loadImage('image/bunnyBack.png');
  winImage = loadImage('image/win.png');
  loseImage = loadImage('image/lose.png');
  bg = loadImage('image/background.jpg');
  soundOnImg = loadImage('image/soundOn50.png');
  soundOffImg = loadImage('image/soundOff50.png');

  sounds = [
    loadSound('sound/achieve.wav'),
    loadSound('sound/bonus.wav'),
    loadSound('sound/bonus2.wav'),
    loadSound('sound/exp-inc.wav'),
    loadSound('sound/hp-recharge.wav'),
    loadSound('sound/level-complete.wav'),
    loadSound('sound/level-complete2.wav'),
    loadSound('sound/lose.wav'),
    loadSound('sound/p-boost.wav'),
    loadSound('sound/treasure.wav'),
    loadSound('sound/unlock.wav'),
    loadSound('sound/win.wav'),
    loadSound('sound/win2.wav')
  ];
}

// Setup Canvas and initialize variables
function setup() {
  let cnvs = createCanvas(windowWidth, windowHeight);
  cnvs.parent('p2');
  // initialize level 1 parameters
  level = {
    l: 1,
    row: 4,
    col: 5
  };
  space = 20;

  // no Stroke for cards
  strokeWeight(0);

  balls = new Group();
  balls.x = width*0.54; // balls animation test: ball.x = () => random(width*0.2, width*0.8);
  balls.y = height*0.72; // balls animation test: ball.y = () => random(height*0.5, height*0.8);
  balls.d = () => random (5, 10);
  balls.collider = 'none'; // no collision needed for balls animation
  // for local p5 lib, balls.speed is not working at setup function
  // has to declare balls.speed right before new balls.Sprite(); line
  // balls.direction = () => random(0, 360);
	// balls.speed = () => random(1, 5);  line 241
  balls.visible = false;
  balls.life = 120; // 2 seconds

  carrots = new Group();
  // wiggle is looping 2 images
  carrots.addAnimation('wiggle', carrotImages[0], carrotImages[1]);
  carrots.scale = 0.1;
  carrots.x = () => random(width*0.1, width*0.9);
  carrots.y = () => random(height*0.2, height*0.9);
  carrots.rotation = 0;
  carrots.rotationlock = true;
  carrots.visible = true;
  carrots.collider = 'n';
  carrots.life = 120; // 2 seconds

  bunny = new Sprite(width*0.5, height*0.85, 1, 'n'); // placeholder for bunny image
  
  bunny.visible = false;

  startBtn = new Sprite(width*0.5, height*0.5, 150, 's'); // start button
  startBtn.textSize = 28;
  startBtn.text = 'START';

  levelBtn = new Sprite(width*0.85, height*0.85, 200, 100, 'n'); // level button
  levelBtn.textSize = 28;
  
  levelBtn.color = 'lime';
  levelBtn.visible = false;

  // Sound button will be positioned below Start button initially
  // but will move to top bar section once game starts
  soundBtn = new Sprite(width*0.7, height*0.04, 50, 50, 's'); 
  isMute = false;

  gameStart = false;
  allowFlip = false;
  score = 0;
  dp = false;
  isBonus = false;
  bonusFlip = 0;
  
  endMessage = new Sprite(width*0.5, height*0.3, 1, 'n');
  endMessage.color = 'lightyellow';
  endMessage.textSize = 50;
  endMessage.textColor = 'red';
  endMessage.visible = false;

  winPair = new Group();
  winPair.vel.y = -1;
  winPair.amount = 2;
  winPair.textSize = 38;
  winPair.textColor = 'lime';
  winPair.visible = false;
  winPair.life = 60;
}

// Draw function calls following functions
// to run the game
// topBar = card remaining, score, time remaining
// createLevel = random load cards and bonus base on level
function draw() {
  clear();

  background(bg);
  
  // Start page animation
  if (carrots.visible){
    if (carrots.length < 3){
      new carrots.Sprite();
    }
  } else {
    carrots.removeAll();
  }

  topBar(); // display header info

  ///// start the game and timer /////
  if (startBtn.mouse.hovering()){
    startBtn.color = 'yellow';
    cursor(HAND);
  } else {
    startBtn.color = 'lime';
    cursor(ARROW);
  }
  
  if (startBtn.mouse.presses()) {
    playSound(8);
    console.log('startBtn sound 8');
    bunny.visible = false;
    carrots.visible = false;
    startBtn.visible = false;
    startBtn.collider = 'n';
    createLevel(level);
    startTime = millis();
  }

  ///// Next Level /////
  if (levelBtn.mouse.hovering()){
    levelBtn.color = 'yellow';
    cursor(HAND);
  } else {
    levelBtn.color = 'lime';
    cursor(ARROW);
  }

  if (levelBtn.mouse.presses()){
    playSound(1);
    console.log('levelBtn sound 1');
    bunny.visible = false; 
    balls.visible = false; 
    carrots.visible = false;
    levelBtn.visible = false;
    levelBtn.collider = 'n';
    if (level.l < 4){
      level.l++;
    }
    createLevel(level);
    startTime = millis();
  }

  // Winning animation
  if (balls.visible){
    if (balls.length < 25){
      let ball = new balls.Sprite();
      ball.direction =  random(0, 360);
      ball.speed =  random(1, 5); // work at local p5 lib
      ball.color = color(random(255),random(255),random(255),random(80,100));
    }
  } else {
    balls.removeAll();
  }

  // Game Start section
  if (gameStart){
    fill('black'); // set background color of card to black
    for (let card of cards) {
      card.display();
    }
  } else {
    resetGame();
  }
}

// This global mousePressed will check if clicking on card
// Then check if card is already flipped
// Otherwise, it will flip the card and check if there is a match
// Update card remaining count and score appropriately
// Also check for bonus cards
function mousePressed() {
  if (allowFlip){
    for (let card of cards) {
      if (card.hovers(mouseX, mouseY) && !card.flipped) {
        card.flip();
        playSound(0);
        console.log('flip 1st card sound 0');
        cardRemain--;

          if (bonusFlip > 0){
            if (matchOBC(card)){
              console.log('check OBC = true');
          } else {
              console.log('check OBC = false');
            flipCards.push(card);
          }} else {
            console.log('bonusFlip == 0');
            flipCards.push(card);
          }
        if (flipCards.length === 2) {
          if (flipCards[0].img === flipCards[1].img) {
            // Match section
            // console.log('match');
            
            score += 100;
            playSound(9);
            console.log('match sound 9');

            isBonus = checkBonus(flipCards[0],flipCards[1]);

            if (!isBonus){
              if (dp == true) {
                score += 100;
                dp = false;
                matchAni(flipCards[0],flipCards[1],'+200');
              } else {
                matchAni(flipCards[0],flipCards[1],'+100');
              }
            }
            flipCards = [];
          }
          else {
            // Not a match, flip back after a delay of 0.5 second
            // console.log('not match');
              allowFlip = false;
              setTimeout(() => {
                flipCards[0].flip();
                flipCards[1].flip();
                cardRemain += 2;
                flipCards = [];
                if (score > 0){
                  score -= 10;
                }
                allowFlip = true;
              }, 500);
          }
        } 
      }
    }
  }
}

// This is the secret key to skip level
function keyPressed(k){
  if (k.code === 'KeyP'){
    playSound(10);
    console.log('p key sound 10');
    showLevel();
  }
  if (k.code === 'KeyL'){
    level.l = 4;
    showLevel();
  }
}

// If secret key is pressed, show the level button and
// update appropriate variables
function showLevel(){
  // Skip level: Press P key
      gameStart = false;
      endMessage.visible = false;
      allowFlip = false;
      levelBtn.visible = true;
      levelBtn.collider = 's';
      levelBtn.text = 'Secret Skip'
      startBtn.visible = false;
      startBtn.collider = 'n';
      carrots.visible = false;
      flipCards = []; // avoid cardRemain error
}

// Play a sound base on event. 'i' defines the sound to play
function playSound(i){
  if (!isMute){
    sounds[i].play();
  } else {
    sounds[i].stop();
  }
}

// Display header info such as card remaining, score, time, etc.
// Also control sound mute state and level screen
// Check for winning or losing state
function topBar(){
  textSize(25);
  fill('blue'); // set text color to blue
  textAlign(CENTER);

  ///// timer function /////
  lTime = 3 - round((millis()-startTime)/1000);
  gameTime = levelTime + 3 - round((millis()-startTime)/1000);

  if (lTime > 0){
    endMessage.visible = true;
    endMessage.text = 'Level '+level.l;
    if (lTime <= 3){
      textSize(60);
      text(lTime.toString(), width*0.5, height*0.4);
    }
  } else if (lTime == 0) {
    gameStart = true;
    allowFlip = true;
    endMessage.visible = false;
  }
  
  ///// Start game time when click Start /////
  if (gameStart){
    text('Score: '+score.toString(),width*0.5,height*0.05);

    ///// prevent time to run over 0 /////
    if (gameTime > 0) {
      text('Cards: '+cardRemain.toString(), width*0.15, height*0.05);
      text('Time : '+gameTime.toString(), width*0.85, height*0.05);

      // check winning condition
      if (cardRemain == 0){
        winGame();
        playSound(2);
        console.log('win sound 2');
        gameStart = false;
      }
    }
    ///// stop game when time reaches 0 /////
    else {
      text('Time : 0', width*0.85, height*0.05);
      gameStart = false;

      // check losing condition
      if ((cardRemain > 0)&&(!levelBtn.visible)){
        loseGame();
        playSound(7);
        console.log('lose sound 7');
      }
    }
  } else {
    // Show Title of Game and Instructions
    if ((startBtn.visible) && (startBtn.text === 'START')){
      endMessage.text = "Bunny Cards";
      endMessage.visible = true;
      fill(255);
      textAlign(LEFT);
      textSize(30);
      text(
        'Rules:\
        \nEach level has bonus card(s)\
        \nEach incorrect guess = -10 points\
        \nEach correct match   = +100 points\
        \nMatch all the cards to proceed next level.',width*0.12,height*0.76);
      // fill('lightgreen');
        text('ART 259 Project 2\
        \nBy: Ken Pao & Yuying Huang', width*0.12, height*0.65);
    }
  }

  // Mute control
  if (soundBtn.mouse.presses()) {
    isMute = !isMute;
    console.log('isMute',isMute);
  }
  if (isMute){
    soundBtn.img = soundOffImg;
  } else {
    soundBtn.img = soundOnImg;
  }
}

// Based on level, generate random cards
function createLevel(level){
  cards = [];
  levelImages = [];
  
  // each level contains row and column size
  // which adjust how many card images involved per level
  if (level.l == 1){
    level.row = 4;
    level.col = 5;
    levelTime = 60;
  } else if (level.l == 2){
    level.row = 5;
    level.col = 8;
    levelTime = 180;
  } else if (level.l == 3){
    level.row = 6;
    level.col = 10;
    levelTime = 250;
  } else if (level.l == 4){
    level.row = 8;
    level.col = 10;
    levelTime = 300;
  }

  let bonusMax = pow(2, level.l - 1);

  for (let j = 0; j < 2; j++){
    for (let i = 0; i < bonusMax; i++){
      levelImages.push(bonusImages[i]);
    }
  }

  // Adjust card size for each level
  let tempW = (width-((level.col+1)*space))/level.col;
  let tempH = (height-((level.row+1)*space))/(level.row+0.5);

  cardSize = {
    w: tempW,
    h: tempH
  };
  
  shuffle(cardImages, true);
  cardRemain = level.row * level.col;
  let k = cardRemain - pow(2, level.l); // 2^level.l = bonus cards
  for (let x = 0; x < k; x++){
    levelImages.push(cardImages[x % (k/2)]);
  }

  shuffle(levelImages, true);
  // Create new card objects
  for (let i = 0; i < level.col; i++) {
    for (let j = 0; j < level.row; j++) {
      let x = i * (cardSize.w + space) + space;
      let y = (j + 0.5) * (cardSize.h + space);
      let imgIndex = i * level.row + j;
      cards.push(new Card(x, y, cardSize, levelImages[imgIndex]));
    }
  }
}

// Check if card is a bonus card and update bonus appropriately
function checkBonus(c1,c2){
    if (c1.img === bonusImages[0]){
        levelTime += 10;
        matchAni(c1, c2, '+10s');
        return true;

    } else if (c1.img === bonusImages[1]){
        if (dp == true){
          score += 200;
          dp = false;
          matchAni(c1,c2,'+300');
        } else {
          score += 100;
          matchAni(c1, c2, '+200');
        }
        return true;

    } else if (c1.img === bonusImages[2]){
        levelTime += 30;
        matchAni(c1, c2, '+30s');
        return true;

    } else if (c1.img === bonusImages[3]){
        if (dp == true){
          score += 1000;
          matchAni(c1, c2, '+1100');
          dp = false;
        } else {
          score += 500;
          matchAni(c1, c2, '+600');
        }
        return true;

    } else if (c1.img === bonusImages[4]){
        if (dp == true){
          score += 2000;
          matchAni(c1, c2, '+2100');
          dp = false;
        } else {
          score += 1000;
          matchAni(c1, c2, '+1100');
        }
        return true;

    } else if (c1.img === bonusImages[5]){
        levelTime += 60;
        matchAni(c1, c2, '+60s');
        return true;

    } else if (c1.img === bonusImages[6]){
        bonusFlip = 5;
        matchAni(c1, c2, '+5 open');
        openBonusCards(bonusFlip);
        return true;

    } else if (c1.img === bonusImages[7]){
        dp = true;
        matchAni(c1, c2, '2x Points');
        return true;

    } else {
        return false;
    }
}

function openBonusCards(count){
  for (let i = 0; i < count; i++){
    let openCard = random(cards);
    if (openCard.flipped){
      // openCard = random(cards);
      console.log('random openCard already flipped',openCard);
      count++;
    } else {
      openCard.flip();
      openCard.setBonus();
      bonusOpen.push(openCard);
      console.log('openCard not flipped',openCard,'bO length',bonusOpen.length);
    }
  }
  cardRemain -= bonusOpen.length;
}

// check Open Bonus Cards if match flipped card
function matchOBC(fCard){
  if (bonusOpen.length > 0){
    for (let i = 0; i < bonusOpen.length; i++){
      if (fCard.img === bonusOpen[i].img){
        bonusOpen[i].setBonus();
        isBonus = checkBonus(fCard, bonusOpen[i]);
        if (!isBonus){
          score += 100;
          matchAni(fCard,bonusOpen[i],'+100');
        }
        bonusOpen.splice(i,1);
        bonusFlip--;
        return true;
      }
    }
  }
}

function matchAni(c1,c2,msg){
  strokeWeight(0);
  let w1 = new winPair.Sprite(c1.w/2+c1.x, c1.y, 1, 'n');
  let w2 = new winPair.Sprite(c2.w/2+c2.x, c2.y, 1, 'n');
  w1.text = w2.text = msg;
  winPair.visible = true;
}

// Win game screen
function winGame(){
  
  bunny.img = winImage;
  bunny.visible = true;
  balls.visible = true;
  if (level.l < 4){
    levelBtn.text = 'Next\nLevel '+(level.l+1);
  } else {
    levelBtn.text = 'Replay\nLevel '+(level.l);
  }
  levelBtn.visible = true;
  levelBtn.collider = 's';
  startBtn.visible = false;
  startBtn.collider = 'n';
  strokeWeight(0);
  endMessage.visible = true;
  winTime = gameTime;
  tScore = winTime * 10 + score;
  endMessage.text = `You Win!
                    \n\nTime Completed : ${winTime} s 
                    \nYour Score : ${score}
                    \nTotal Score : ${tScore}`;
}

// Lose game screen
function loseGame(){
  strokeWeight(0);
  bunny.img = loseImage;
  bunny.visible = true;
  endMessage.visible = true;
  endMessage.text = 'Replay?';
  startBtn.text = 'Restart';
  carrots.visible = true;
  startBtn.visible = true;
  startBtn.collider = 's';
}

// Reset game variables
function resetGame(){
  score = 0;
  tScore = 0;
  allowFlip = false;
  flipCards = [];
  bonusFlip = 0;
  bonusOpen = [];
}

// Window resized function will run when "reload" after a browser window resize
function windowResized(){
  // Canvas is set to 95% width and height - match setup scale
  resizeCanvas(windowWidth, windowHeight);
}

///////////////////////////////////////////////////////////////////////////////
// Reference
// P5play: https://p5play.org/learn/
//        * P5play is a javascript game engine that uses p5js library to
//          allow more comprehensive interaction and specifically tailor to 
//          build game in 2D or 3D mode with easy to learn features.
//
// P5 JS lib: https://p5js.org/reference/
///////////////////////////////////////////////////////////////////////////////