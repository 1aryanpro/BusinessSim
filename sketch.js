let businesses = [];

let money = 4 / 1.07;

function setup() {
  createCanvas(1500, 900, P2D);
  noStroke();

  businesses.push(new Business("Lemonade Stand", 4 / 1.07, 1.07, 0.6, 1));
  businesses.push(new Business("Newspaper Deliver", 60, 1.15, 3, 60));
  businesses.push(new Business("Car Wash", 720, 1.14, 6, 540));
  businesses.push(new Business("Pizza Deliver", 8640, 1.13, 12, 4320));
  businesses.push(new Business("Donut Shop", 103680, 1.12, 24, 51840));
  businesses.push(new Business("Shrimp Boat", 1244160, 1.11, 96, 622080));
  businesses.push(new Business("Hockey Team", 14929920, 1.10, 384, 7464960));
  businesses.push(new Business("Movie Studio", 179159040, 1.09, 1536, 89579520));
  businesses.push(new Business("Bank", 2149908480, 1.08, 6144, 1074954240));
  businesses.push(new Business("Oil Company", 25798901760, 1.07, 36864, 29668737024));
  businesses[0].buy();
}

function draw() {
  background(200);

  businesses.forEach((biz) => biz.run(deltaTime));

  textAlign(CENTER, CENTER);
  textSize(50);
  text(getNumberName(money), width / 2, 40);
}

function mousePressed() {
  businesses.forEach((biz) => biz.clickCheck(mouseX, mouseY) ? biz.buy() : undefined); 
}

class Business {
  static i = 0;
  constructor(name, price, coef, time, revenue) {
    this.name = name;

    let gutter = 20;
    let i = Business.i;
    this.w = (width - gutter * 2) * 0.25;
    this.h = (height - gutter * 10) / 5;
    this.x = gutter + floor(i / 5) * (this.w + gutter);
    this.y = gutter * 5 + (i % 5) * (this.h + gutter);
    Business.i++;

    this.price = price;
    this.coef = coef;
    this.revenue = revenue;
    this.timerLen = time * 1000;

    this.count = 0;
    this.timer = this.timerLen;
  }

  display() {
    let [x, y, w, h] = [this.x, this.y, this.w, this.h];

    fill('#1e9900');
    rect(x, y, w, h);

    fill('#49db41');
    rect(x + 10, y + 10, w - 20, h - 20);

    fill('#1a8400');
    rect(x + 20, y + h - 50, w - 40, 30, 15);

    fill('#1e9900');
    rect(x + 25, y + h - 45, w - 50, 20, 10);

    fill('#49db41');
    rect(x + 25, y + h - 45, (w - 50) * (1 - this.timer / this.timerLen), 20, 10);

    textSize(20);
    textStyle(BOLD);
    fill(0);

    textAlign(CENTER, CENTER);
    text(this.name, x + w / 2, y + 30);

    textAlign(RIGHT, TOP);
    if (this.count != 0)
      text(getNumberName(this.revenue * this.count), x + w - 30, y + h - 45);
    text(getNumberName(this.price), x + w - 30, y + h - 90);

    textAlign(LEFT, TOP);
    if (this.count != 0)
      text(round(this.timer / 1000 + 0.4) + 's', x + 30, y + h - 45);
    text(this.count, x + 30, y + h - 90);
  }

  run(delta) {
    this.display();

    if (this.count == 0) return;
    this.timer -= delta;
    if (this.timer < 0) {
      this.timer += this.timerLen;
      money += this.revenue * this.count;
    }
  }

  buy() {
    if (money < this.price) return;
    this.count++;
    money -= this.price;
    this.price *= this.coef;
  }

  clickCheck(x, y) {
    if (x < this.x || x > this.x + this.w || y < this.y || y > this.y + this.h) return false;
    return true;
  }
}

var numberNames = [
  'K',
  'Million',
  'Billion',
  'Trillion',
  'Quadrillion',
  'Quintillion',
  'Sestilion',
  'Septillion',
  'Octillion',
  'Nonillion',
  'Decillion',
  'Undecillion',
  'Duodecillion',
  'Quattuordecillion',
  'Quindecillion',
  'Sexdecillion',
  'Septendecillion',
  'Octodecillion',
  'Novemdecillion',
  'Vigintillion',
  'Duovigintillion',
  'Tresvigintillion',
  'Quattuorvigintillion',
  'Quinquavigintillion',
  'Sesvigintillion',
  'Septemvigintillion',
  'Octovigintillion',
  'Novemvigintillion',
  'Trigintillion',
  'Untrigintillion',
  'Duotrigintillion',
  'Trestrigintillion',
  'Quattuortrigintillion',
  'Quinquatrigintillion',
  'Sestrigintillion',
  'Septentrigintillion',
  'Octotrigintillion',
  'Noventrigintillion',
  'Quadragintillion',
];

function getNumberName(num) {
  if (!num) return '$0';
  if (num < 1000) return '$' + round(num);
  for (var i = 0; i < numberNames.length; i++) {
    num /= 1000;
    if (num < 1000) return '$' + round(num * 10) / 10 + ' ' + numberNames[i];
  }
  return 'Infinity';
}
