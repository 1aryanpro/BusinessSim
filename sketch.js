let su; // size unit
let money = 4 / 1.07;
let businesses = [];
let stocks;
let dev = false;
let psave = 0;
let bonusLevel = -1;

function setup() {
  if (windowWidth > (windowHeight * 15) / 9)
    createCanvas((windowHeight - 40) / 9 * 15, windowHeight - 40, P2D);
  else createCanvas(windowWidth - 40, (windowWidth - 40) / 15 * 9, P2D);
  su = 20/1500 * width;

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

    bonusLevel = getItem('bonusLevel');
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

  if (dev) stocks.display();

  textAlign(CENTER, CENTER);
  textSize(su * 2.5);
  textFont('monospace');
  textStyle(NORMAL);
  fill(0);
  text(getNumberName(money), width / 2, su * 2.5);

  let time = millis();
  if (time > psave + 5000) {
    saveGame();
    psave = time - (time % 5000);
  }

  Stocks.unlocked = Stocks.unlocked ? true : businesses[4].count > 0;
}

function mousePressed() {
  businesses.forEach((biz) =>
    clickCheck(biz, mouseX, mouseY) ? biz.buy() : undefined
  );
  if (dev) stocks.pressed();
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
  storeItem('bonusLevel', bonusLevel);
  storeItem('gameSaved', true);
}

function checkBonuses() {
  let count = businesses[0].count;
  businesses.forEach((biz) => {
    if (biz.count < count) count = biz.count;
  });
  let bonus = [25, 50, 100, 200, 300, 400].indexOf(count);
  if (bonus > bonusLevel) {
    businesses.forEach((biz) => {
      biz.timerLen /= 2;
      biz.timer /= 2;
    });
    bonusLevel++;
  }
}

class Business {
  static i = 0;
  constructor(name, price, coef, time, revenue) {
    this.name = name;

    let i = Business.i;
    this.w = (width - su * 2) * 0.25;
    this.h = (height - su * 10) / 5;
    this.x = su + floor(i / 5) * (this.w + su);
    this.y = su * 5 + (i % 5) * (this.h + su);
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
    rect(x + su/2, y + su/2, w - su, h - su);

    fill('#1a8400');
    rect(x + su, y + h - su * 2.5, w - su * 2, su * 1.5, su * 0.75);

    fill('#1e9900');
    rect(x + su * 1.25, y + h - su * 2.25, w - su*2.5, su, su/2);

    fill('#49db41');
    let mps = this.timerLen < 30;
    let prop = mps ? 1 : 1 - this.timer / this.timerLen;
    rect(x + su * 1.25, y + h - su * 2.25, (w - su * 2.5) * prop, su, su/2);

    textSize(su);
    textStyle(BOLD);
    textFont('sans-serif');
    fill(0);

    textAlign(CENTER, CENTER);
    text(this.name, x + w / 2, y + su * 1.5);

    textAlign(RIGHT, TOP);
    text(getNumberName(this.price), x + w - su * 1.5, y + h - su * 4.5);

    textAlign(LEFT, TOP);
    text(this.count, x + su * 1.5, y + h - su * 4.5);

    let rev = this.revenue * this.count;
    if (mps) {
      textAlign(CENTER, TOP);
      text(
        `${getNumberName((rev / this.timerLen) * 1000)}/s`,
        x + w / 2,
        y + h - su * 2.25
      );
    } else if (this.count > 0) {
      textAlign(RIGHT, TOP);
      text(getNumberName(rev), x + w - su * 1.5, y + h - su * 2.25);
      textAlign(LEFT, TOP);
      text(getTimeStr(this.timer), x + su * 1.5, y + h - su * 2.25);
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
  static unlocked = false;

  constructor() {
    this.x = su + 2 * ((width - su * 2) * 0.25 + su);
    this.y = su * 5;
    this.w = width - this.x - su;
    this.h = height - this.y - su;

    this.reStock();

    this.storedMoney = 0;
    this.curStock = 0;

    this.buttons = [];
    let c1 = '#5073fc';
    let c2 = '#6d50fc';
    this.buttons.push(this.newBtn(0, 0, 3, 'Buy 10%', c1));
    this.buttons.push(this.newBtn(1, 0, 3, 'Buy 50%', c1));
    this.buttons.push(this.newBtn(2, 0, 3, 'Buy 100%', c1));
    this.buttons.push(this.newBtn(0, 1, 2, 'Wait', c2));
    this.buttons.push(this.newBtn(1, 1, 2, 'Sell', c2));

    this.buttons[3].disabled = true;
    this.buttons[4].disabled = true;
  }

  newBtn(x, y, s, text, color) {
    let btnw = (this.w - su * (s + 1)) / s;
    let btnh = (this.h / 2 - su * 6) / 2;
    let btnx = this.x + su + (btnw + su) * x;
    let btny = this.y + this.h / 2 + su * 4 + (btnh + su) * y;

    return new Button(btnx, btny, btnw, btnh, text, color);
  }

  display() {
    fill(51);
    rect(this.x, this.y, this.w, this.h);

    if (!Stocks.unlocked) {
      fill(255);
      textSize(su * 2.5);
      textAlign(CENTER, CENTER);
      text(
        'Stocks has not been\nunlocked yet.',
        this.x + this.w / 2,
        this.y + this.h / 2
      );
      return;
    }

    fill(35);
    rect(
      this.x + su,
      this.y + su,
      this.w - su * 2,
      this.h / 2 - su
    );

    stroke(255);
    let px = this.x + su;
    let py = (this.h / 4 - su / 2) * this.stockPrices[0] + this.y;
    for (let i = 1; i <= this.curStock; i++) {
      let price = this.stockPrices[i];
      let x =
        (i * (this.w - su * 2)) / (this.numStocks - 1) + this.x + su;
      let y = (this.h / 2 - su) * price + this.y;
      line(px, py, x, y);
      px = x;
      py = y;
    }
    line(
      this.x + su,
      this.y + this.h / 4 - su / 2,
      this.x + this.w - su,
      this.y + this.h / 4 - su / 2
    );
    noStroke();

    fill(255);
    textAlign(CENTER, TOP);
    textSize(su * 1.5);
    text(
      getNumberName(this.storedMoney),
      this.x + this.w / 4,
      this.h / 2 + this.y + su
    );
    text(
      'x' + this.stockPrices[this.curStock].toFixed(2),
      this.x + this.w * 0.75,
      this.h / 2 + this.y + su
    );

    this.buttons.forEach((btn) => btn.display());
  }

  reStock() {
    this.numStocks = 15;
    this.stockPrices = [];
    let seed = random(1000);
    for (let i = 0; i < this.numStocks; i++) {
      this.stockPrices.push(noise(seed + i * (2 / this.numStocks)));
    }
  }

  buy(i) {
    let prop;

    if (i == 0) prop = 0.1;
    if (i == 1) prop = 0.5;
    if (i == 2) prop = 1;

    this.storedMoney = money * prop;
    money -= this.storedMoney;

    this.buttons.forEach((btn) => (btn.disabled = !btn.disabled));
  }

  wait() {
    this.curStock++;
    if (this.curStock == this.numStocks - 1) this.buttons[3].disabled = true;
  }

  sell() {
    money += this.storedMoney * this.stockPrices[this.curStock];
    this.storedMoney = 0;

    this.buttons.forEach((btn, i) => {
      if (i < 3) btn.disabled = false;
      else btn.disabled = true;
    });

    this.reStock();
    this.curStock = 0;
  }

  pressed() {
    if (!Stocks.unlocked) return;
    this.buttons.forEach((btn, i) => {
      if (btn.disabled || !clickCheck(btn, mouseX, mouseY)) return;
      if (i < 3) this.buy(i);
      if (i == 3) this.wait();
      if (i == 4) this.sell();
    });
  }
}

class Button {
  constructor(x, y, w, h, text, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.color = color;
    this.disabled = false;
  }

  display() {
    this.disabled ? fill(100) : fill(this.color);
    rect(this.x, this.y, this.w, this.h);
    this.disabled ? fill(50) : fill(0);
    textAlign(CENTER, CENTER);
    textSize(su * 1.25);
    text(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }
}

function getTimeStr(ms) {
  let s = round(ms / 1000 + 0.4);
  let output = '';

  function timeUnit(name, len) {
    if (s > len) {
      let unit = floor(s / len);
      output += unit + name + ' ';
      s -= unit * len;
    }
  }

  timeUnit('h', 3600);
  timeUnit('m', 60);

  output += s + 's';
  return output;
}

let numberNames = [
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

    let decs = num < 100 ? (num < 10 ? 2 : 1) : 0;
    return (
      '$' + num.toFixed(decs) + (decs == 0 ? '.' : '') + ' ' + numberNames[i]
    );
  }
  return 'Infinity';
}
