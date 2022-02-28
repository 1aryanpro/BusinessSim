let su; // size unit
let dev = false;
let version = 2;

let money = 4 / 1.07;
let businesses = [];
let stocks;
let psave = 0;
let bonusLevel = -1;

function setup() {
  if (windowWidth > (windowHeight * 15) / 9)
    createCanvas(((windowHeight - 40) / 9) * 15, windowHeight - 40, P2D);
  else createCanvas(windowWidth - 40, ((windowWidth - 40) / 15) * 9, P2D);
  su = (20 / 1500) * width;

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

  stocks = new Stocks();

  let saveVersion = getItem('version');
  if (getItem('gameSaved') == true && saveVersion >= 1) {
    let bizData = getItem('biz');
    bizData.forEach((data, i) => {
      let biz = businesses[i];
      biz.buy(data.count, true);
      biz.timer = data.timer * biz.timerLen;
      if (biz.timer > biz.timerLen) biz.timer = biz.timerLen;
    });

    money = getItem('money');
  } else businesses[0].buy();
}

function draw() {
  background(200);
  Stocks.unlocked = Stocks.unlocked ? true : businesses[7].count > 0;

  let check = false;
  businesses.forEach((biz) => {
    biz.run(deltaTime);
    if (check) return;
    check = biz.count == 0;
    biz.display();
  });

  stocks.display();

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
}

function mousePressed() {
  businesses.forEach((biz) =>
    clickCheck(biz, mouseX, mouseY) ? biz.buy() : undefined
  );
  stocks.pressed();
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
  storeItem('version', version);
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
    rect(x + su / 2, y + su / 2, w - su, h - su);

    fill('#1a8400');
    rect(x + su, y + h - su * 2.5, w - su * 2, su * 1.5, su * 0.75);

    fill('#1e9900');
    rect(x + su * 1.25, y + h - su * 2.25, w - su * 2.5, su, su / 2);

    fill('#49db41');
    let mps = this.timerLen < 30;
    let prop = mps ? 1 : 1 - this.timer / this.timerLen;
    rect(x + su * 1.25, y + h - su * 2.25, (w - su * 2.5) * prop, su, su / 2);

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

  buy(amt = 1, override = false) {
    for (let i = 0; i < amt; i++) {
      if (!override && money < this.price) return;
      this.count++;
      if ([25, 50, 100, 200, 300, 400].indexOf(this.count) != -1) {
        this.timerLen /= 2;
        this.timer /= 2;
      }

      if (!override) money -= this.price;
      this.price *= this.coef;
      checkBonuses();
    }
  }

  getData() {
    return {
      count: this.count,
      timer: this.timer / this.timerLen,
    };
  }
}

function getProp(x) {
  return pow(100, 2 * x - 1).toFixed(2);
}

class Stocks {
  static unlocked = false;

  constructor() {
    this.x = su + 2 * ((width - su * 2) * 0.25 + su);
    this.y = su * 5;
    this.w = width - this.x - su;
    this.h = height - this.y - su;

    this.numStocks = 15;
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
    rect(this.x + su * 2, this.y + su, this.w - su * 3, this.h / 2 - su);

    const calcx = (i) =>
      map(i, 0, this.numStocks - 1, this.x + su * 2, this.x + this.w - su);
    const calcy = (p) => map(p, 0, 1, this.h / 2 + this.y, this.y + su);

    const hline = (y) =>
      line(calcx(0), calcy(y), calcx(this.numStocks - 1), calcy(y));
    const vline = (x) => line(calcx(x), calcy(0), calcx(x), calcy(1));

    // 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100
    let hs = [0, 0.08, 0.12, 0.152, 0.175, 0.25, 0.325, 0.37, 0.4, 0.425, 0.5];

    hs.forEach((h, i) => {
      let v = i % 5;
      stroke(map(v, 0, 4, 125, 100));
      strokeWeight(map(v, 0, 4, 2, 1));
      hline(0.5 + h);
      hline(0.5 - h);
    });

    noStroke();
    textAlign(CENTER, CENTER);
    textSize(su * 0.75);

    fill(200);
    text('100', this.x + su, calcy(1) + su * 0.325);
    text('10', this.x + su, calcy(0.75));
    text('1', this.x + su, calcy(0.5));
    text('.1', this.x + su, calcy(0.25));
    text('.01', this.x + su, calcy(0) - su * 0.325);

    fill(150);
    text('50', this.x + su, calcy(0.925));
    text('5', this.x + su, calcy(0.675));
    text('.5', this.x + su, calcy(0.325));
    text('.05', this.x + su, calcy(0.075));

    let px = calcx(0);
    let py = calcy(this.stockPrices[0]);
    for (let i = 0; i < this.numStocks; i++) {
      stroke(200);
      strokeWeight(1);
      vline(i);
      if (i > this.curStock) continue;

      let price = this.stockPrices[i];
      let x = calcx(i);
      let y = calcy(price);

      if (py < y) stroke(230, 0, 0);
      else stroke(0, 230, 0);
      strokeWeight(2.5);

      line(px, py, x, y);
      noFill();
      circle(x, y, 10);

      px = x;
      py = y;
    }

    noStroke();

    fill(255);
    textSize(su * 1.5);

    text(
      getNumberName(this.storedMoney),
      this.x + this.w * 0.2,
      this.h / 2 + this.y + su * 2
    );

    let prop = getProp(this.stockPrices[this.curStock]);
    text(
      getNumberName(this.storedMoney * prop),
      this.x + this.w * 0.8,
      this.h / 2 + this.y + su * 2
    );

    if (prop >= 1) fill(0, 230, 0);
    else fill(230, 0, 0);
    text('x' + prop, this.x + this.w * 0.5, this.h / 2 + this.y + su * 2);

    this.buttons.forEach((btn) => btn.display());
  }

  reStock() {
    let seed = random(1000);
    let genNoise = (i) => noise(seed + i * (1.5 / this.numStocks)) - noise(seed) + 0.5;

    this.stockPrices = [];
    for (let i = 0; i < this.numStocks; i++) {
      this.stockPrices.push(genNoise(i));
    }
  }

  buy(i) {
    this.reStock();
    this.curStock = 0;
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
    money += this.storedMoney * getProp(this.stockPrices[this.curStock]);
    this.storedMoney = 0;

    this.buttons.forEach((btn, i) => {
      if (i < 3) btn.disabled = false;
      else btn.disabled = true;
    });
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
  'Quatturotrigintillion',
  'Quinquatrigintillion',
  'Sestrigintillion',
  'Septentrigintillion',
  'Octotrigintillion',
  'Noventrigintillion',
  'Quadragintillion',
  'Unquadragintillion',
  'Duoquadragintillion',
  'Trequadragintillion',
  'Quattorquadragintillion',
  'Quinquaquadragintillion',
  'Sesquadragintillion',
  'Septquadragintillion',
  'Octoquadragintillion',
  'Novequadragintillion',
  'Quinquagintillion',
  'Unquinquagintillion',
  'Duoquinquagintillion',
  'Trequinquagintillion',
  'Quattorquinquagintillion',
  'Quinquaquinquagintillion',
  'Sesquinquagintillion',
  'Septequinquagintillion',
  'Octoquinquagintillion',
  'Novequinquagintillion',
  'Sexagintillion',
  'Unsexagintillion',
  'Duosexagintillion',
  'Tresexagintillion',
  'Quattorsexagintillion',
  'Quinquasexagintillion',
  'Sesexagintillion',
  'Septesexagintillion',
  'Octosexagintillion',
  'Novesexagintillion',
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
