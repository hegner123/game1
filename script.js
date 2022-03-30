// Import the functions you need from the SDKs you need
const initializeApp = require("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2PZ0gLt5DATueH8yter2kckIOKT6_Zcs",
  authDomain: "beagle-jump.firebaseapp.com",
  projectId: "beagle-jump",
  storageBucket: "beagle-jump.appspot.com",
  messagingSenderId: "439102659257",
  appId: "1:439102659257:web:2264c7eb05e5dd2d5f1968",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

var myGamePiece;
var myFloor;
var myObstacle;
var myObstacles = [];
var global = 0;
var startBtn = document.querySelector("#start");
var resetBtn = document.querySelector("#reset");
var root = document.querySelector("#screen");

function startGame() {
  myGameArea.start();
  myGamePiece = new component(30, 30, 10, 120);
  myFloor = new obstacle(489, 20, "green", 10, 268);
}
function resetGame() {
  myObstacles = [];
  myGameArea.reset();
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  points: 0,
  start: function () {
    startBtn.classList.add("off");
    resetBtn.classList.remove("off");
    this.startInterval();
    this.frameNo = global;
    window.addEventListener("keydown", function (e) {
      myGameArea.key = e.keyCode;
      if (myGameArea.key === 32) {
        jump();
      }
    });
    window.addEventListener("keyup", function (e) {
      myGameArea.key = false;
    });
  },
  reset: function () {
    setScore();
    this.canvas.remove();
    this.canvas = document.createElement("canvas");
    this.stop();
    this.points = 0;
    this.startInterval(this.canvas);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    clearInterval(this.interval);
    setScore(this.points);
  },
  startInterval: function () {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    this.interval = setInterval(updateGameArea, 20);
    root.appendChild(this.canvas);
    var score = document.createElement("h3");
    score.setAttribute("id", "score-board");
    document.body.appendChild(score);
  },
};

function component(width, height, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = global;
  this.speedY = 1;
  this.x = x;
  this.y = y;
  this.jumpCount = global;
  this.maxJump = 3;

  this.jump1 = function () {
    console.log(this.jumpCount);
    if (this.jumpCount + 1 < this.maxJump) {
      this.jumpCount += 1;
      this.speedY = -7;
    }
  };
  this.crashWith = function (otherobj) {
    var prediction = 0.5;
    var myleft = this.x;
    var myright = this.x + this.width;
    var mytop = this.y;
    var mybottom = this.y + this.height;
    var otherleft = otherobj.x;
    var otherright = otherobj.x + otherobj.width;
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + otherobj.height;
    var crash = true;

    if (
      mybottom + prediction < othertop - prediction ||
      mytop - prediction > otherbottom + prediction ||
      myright + prediction < otherleft - prediction ||
      myleft - prediction > otherright + prediction
    ) {
      crash = false;
    }

    return crash;
  };
  this.update = function () {
    var img1 = new Image(); // Image constructor
    img1.src = "./assets/35500600.png";
    img1.alt = "alt";
    var img2 = new Image(); // Image constructor
    img2.src = "./assets/35500612.png";
    img2.alt = "alt";
    ctx = myGameArea.context;
    ctx.drawImage(img1, this.x, this.y, this.width, this.height);
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
  this.gravity = function (collision) {
    if (collision) {
      myGamePiece.speedY = global;
      myGamePiece.jumpCount = global;
      myGamePiece.y = 269 - myGamePiece.height;
    } else if (myGamePiece.speedY <= 7) {
      myGamePiece.speedY += 0.5;
    }
  };
}

function obstacle(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = -5;
  this.speedY = global;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
}

function jump() {
  myGamePiece.jump1();
}

function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == global) {
    return true;
  }
  return false;
}

function setScore() {
  db.collection("hi-score").doc(new Date()).set({
    score: score,
  });
}

function getHiScore() {
  var docRef = db.collection("hi-score");

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function updateScore() {
  var scoreBoard = document.querySelector("#score-board");
  myGameArea.points++;
  scoreBoard.innerHTML = myGameArea.points;
}

function updateGameArea() {
  updateScore();

  var x, height, gap, minHeight, maxHeight, minGap, maxGap;
  for (i = 0; i < myObstacles.length; i += 1) {
    if (myGamePiece.crashWith(myObstacles[i])) {
      myGameArea.stop();
      return;
    }
  }
  myGameArea.clear();
  myGameArea.frameNo += 1;
  if (myGameArea.frameNo == 1 || everyinterval(150)) {
    x = myGameArea.canvas.width;
    minHeight = 200;
    maxHeight = 250;
    height = Math.floor(
      Math.random() * (maxHeight - minHeight + 1) + minHeight
    );
    myObstacles.push(new obstacle(10, x - height, "green", x, height));
  }
  for (i = 0; i < myObstacles.length; i += 1) {
    myObstacles[i].newPos();
    myObstacles[i].update();
  }
  myGamePiece.newPos();
  myGamePiece.gravity(myGamePiece.crashWith(myFloor));
  myFloor.update();
  myGamePiece.update();
}
