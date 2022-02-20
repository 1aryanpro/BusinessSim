let businesses = [];

let money = 0;

function setup() {
  createCanvas(1500, 900, P2D);
  noStroke();

  for (let i = 0; i < 10; i++) {
    businesses.push(new Business(i + '', i, 0, 12));
  }
}

function draw() {
  background(200);

  businesses.forEach((biz) => biz.run(deltaTime));

  textAlign(CENTER, CENTER);
  textSize(50)
  text(getNumberName(money), width/2, 40)
}

class Business {
  constructor(name, i, price, revenue) {
    this.name = name;

    let gutter = 20;
    this.w = (width - gutter * 2) * 0.25;
    this.h = (height - gutter * 10) / 5;
    this.x = gutter + floor(i / 5) * (this.w + gutter);
    this.y = gutter * 5 + (i % 5) * (this.h + gutter);

    this.price = price;
    this.revenue = revenue;
    this.count = 0;

    this.timerLen = 5000;
    this.timer = this.timerLen;
  }

  display() {
    let [x, y, w, h] = [this.x, this.y, this.w, this.h];

    fill('#1e9900');
    rect(x, y, w, h);

    fill('#49db41');
    rect(x + 10, y + 10, w - 20, h - 20);

    fill('#1e9900');
    rect(x + 20, y + h - 50, w - 40, 30);

    fill('#49db41');
    rect(x + 25, y + h - 45, (w - 50) * (1 - this.timer / this.timerLen), 20);

    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    fill(0);
    text(this.name, x + w / 2, y + 30);

    textAlign(RIGHT, TOP);
    text(getNumberName(this.revenue * this.count), x + w - 30, y + h - 45)
    text(getNumberName(this.price), x + w - 30, y + h - 90)

    textAlign(LEFT, TOP);
    text(ceil(this.timer /1000) + 's', x + 30, y + h - 45);
    text(this.count, x + 30, y + h - 90)
  }

  run(delta) {
    this.display();

    this.timer -= delta;
    if (this.timer < 0) {
      this.timer += this.timerLen;
      money += this.revenue * this.count;
    }
  }

  buy() {
    if (money < this.price) return;
    this.count++;
  }
}

var numberNames = [
	"K",
	"Million",
	"Billion",
	"Trillion",
	"Quadrillion",
	"Quintillion",
	"Sestilion",
	"Septillion",
	"Octillion",
	"Nonillion",
	"Decillion",
	"Undecillion",
	"Duodecillion",
	"Quattuordecillion",
	"Quindecillion",
	"Sexdecillion",
	"Septendecillion",
	"Octodecillion",
	"Novemdecillion",
	"Vigintillion",
	"Duovigintillion",
	"Tresvigintillion",
	"Quattuorvigintillion",
	"Quinquavigintillion",
	"Sesvigintillion",
	"Septemvigintillion",
	"Octovigintillion",
	"Novemvigintillion",
	"Trigintillion",
	"Untrigintillion",
	"Duotrigintillion",
	"Trestrigintillion",
	"Quattuortrigintillion",
	"Quinquatrigintillion",
	"Sestrigintillion",
	"Septentrigintillion",
	"Octotrigintillion",
	"Noventrigintillion",
	"Quadragintillion"
];

function getNumberName(num) {
	if (!num) return("$0");
	if (num < 1000) return "$" + round(num);
	for (var i = 0; i < numberNames.length; i++){
		num /= 1000;
		if (num < 1000) return "$" + (round(num * 10) / 10) + " " + numberNames[i];
	}
	return "Infinity";
}
