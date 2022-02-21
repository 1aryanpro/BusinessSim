const gutter = 20;
let money = 4 / 1.07;
let businesses = [];
let stocks;
let dev = false;
let psave = 0;

function setup() {
  createCanvas(1500, 900, P2D);
  noStroke();

  businesses.push(new Business('Lemonade Stand', 4 / 1.07, 1.07, 0.6, 1));
  businesses.push(new Business('Newspaper Deliver', 60, 1.15, 3, 60));
  businesses.push(new Business('Car Wash', 720, 1.14, 6, 540));
  businesses.push(new Business('Pizza Deliver', 8640, 1.13, 12, 4320));
  businesses.push(new Business('Donut Shop', 103680, 1.12, 24, 51840));
  businesses.push(new Business('Shrimp Boat', 1244160, 1.11, 96, 622080));
  businesses.push(new Business('Hockey Team', 14929920, 1.1, 384, 7464960));
  businesses.push(
    new Business('Movie Studio', 179159040, 1.09, 1536, 89579520)
  );
  businesses.push(new Business('Bank', 2149908480, 1.08, 6144, 1074954240));
  businesses.push(
    new Business('Oil Company', 25798901760, 1.07, 36864, 29668737024)
  );
  businesses[0].buy();

  stocks = new Stocks();

  if (getItem('gameSaved') == true) {
    let bizData = getItem('biz');
    bizData.forEach((data, i) => {
      let biz = businesses[i];
      biz.count = data.count;
      biz.timerLen = data.timerLen;
      biz.timer = data.timer;
    });

    money = getItem('money');
  }
}

function draw() {
  background(200);

  let check = false;
  businesses.forEach((biz) => {
    biz.run(deltaTime);
    if (check) return;
    check = biz.count == 0;
    biz.display();
  });

  stocks.display();

  textAlign(CENTER, CENTER);
  textSize(50);
  textFont('monospace');
  textStyle(NORMAL);
  text(getNumberName(money), width / 2, 50);

  let time = millis();
  if (time > psave + 5000) {
    saveGame();
    psave = time - time % 5000;
  }
}

function mousePressed() {
  businesses.forEach((biz) =>
    clickCheck(biz, mouseX, mouseY) ? biz.buy() : undefined
  );
}

function clickCheck(obj, x, y) {
  if (x < obj.x || x > obj.x + obj.w || y < obj.y || y > obj.y + obj.h)
    return false;
  return true;
}

function saveGame() {
  storeItem('money', money);
  storeItem(
    'biz',
    businesses.map((biz) => biz.getData())
  );
  storeItem('gameSaved', true);
}

function checkBonuses() {
  let count = businesses[0].count;
  let check = true;
  businesses.forEach((biz) => {
    if (biz.count != count && check) check = false;
  });
  if (!check) return;
  if ([25, 50, 100, 200, 300, 400].indexOf(count) != -1)
    businesses.forEach((biz) => {
      biz.timerLen /= 2;
      biz.timer /= 2;
    });
}

class Business {
  static i = 0;
  constructor(name, price, coef, time, revenue) {
    this.name = name;

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
    let mps = this.timerLen < 30;
    let prop = mps ? 1 : 1 - this.timer / this.timerLen;
    rect(x + 25, y + h - 45, (w - 50) * prop, 20, 10);

    textSize(20);
    textStyle(BOLD);
    textFont('sans-serif');
    fill(0);

    textAlign(CENTER, CENTER);
    text(this.name, x + w / 2, y + 30);

    textAlign(RIGHT, TOP);
    text(getNumberName(this.price), x + w - 30, y + h - 90);

    textAlign(LEFT, TOP);
    text(this.count, x + 30, y + h - 90);

    let rev = this.revenue * this.count;
    if (mps) {
      textAlign(CENTER, TOP);
      text(
        `${getNumberName((rev / this.timerLen) * 1000)}/s`,
        x + w / 2,
        y + h - 45
      );
    } else if (this.count > 0) {
      textAlign(RIGHT, TOP);
      text(getNumberName(rev), x + w - 30, y + h - 45);
      textAlign(LEFT, TOP);
      text(round(this.timer / 1000 + 0.4) + 's', x + 30, y + h - 45);
    }
  }

  run(delta) {
    if (this.count != 0) {
      this.timer -= delta;
      while (this.timer < 0) {
        this.timer += this.timerLen;
        money += this.revenue * this.count;
      }
    }
  }

  buy() {
    if (money < this.price) return;
    this.count++;
    if ([25, 50, 100, 200, 300, 400].indexOf(this.count) != -1) {
      this.timerLen /= 2;
      this.timer /= 2;
    }

    money -= this.price;
    this.price *= this.coef;
    checkBonuses();
  }

  getData() {
    return {
      count: this.count,
      timerLen: this.timerLen,
      timer: this.timer,
    };
  }
}

class Stocks {
  constructor() {
    this.x = gutter + 2 * ((width - gutter * 2) * 0.25 + gutter);
    this.y = gutter * 5;
    this.w = width - this.x - gutter;
    this.h = height - this.y - gutter;

    this.numStocks = 15;
    this.stockPrices = [];
    let seed = random(1000);
    for (let i = 0; i < this.numStocks; i++) {
      this.stockPrices.push(noise(seed + i * (2 / this.numStocks)));
    }
  }

  display() {
    if (!dev) return;

    fill(51);
    rect(this.x, this.y, this.w, this.h);
    fill(35);
    rect(
      this.x + gutter,
      this.y + gutter,
      this.w - gutter * 2,
      this.h / 2 - gutter
    );

    stroke(255);
    let px = this.x + gutter;
    let py = (this.h / 2) * this.stockPrices[0] + this.y;
    for (let i = 1; i < this.numStocks; i++) {
      let price = this.stockPrices[i];
      let x =
        (i * (this.w - gutter * 2)) / (this.numStocks - 1) + this.x + gutter;
      let y = (this.h / 2) * price + this.y;
      line(px, py, x, y);
      px = x;
      py = y;
    }
    line(
      this.x + gutter,
      this.y + this.h / 4 - gutter / 2,
      this.x + this.w - gutter,
      this.y + this.h / 4 - gutter / 2
    );
    noStroke();
  }
}

class Button {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
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
    if (num > 1000) continue;

    let decs = num < 100 ? num < 10 ? 100 : 10 : 1;
    return '$' + round(num * decs) / decs + ' ' + numberNames[i];
  }
  return 'Infinity';
}
