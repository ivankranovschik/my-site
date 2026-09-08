// ==========================
// ДАННЫЕ
// ==========================

let balance = 5000;

let inventory = [];

let selectedItem = null;

let targetItem = null;


// ==========================
// ПРЕДМЕТЫ
// ==========================

const items = [

  {
    name: "Деревянный меч",
    value: 200,
    icon: "🗡️",
    rarity: "Обычный"
  },

  {
    name: "Железный меч",
    value: 500,
    icon: "⚔️",
    rarity: "Редкий"
  },

  {
    name: "Золотой меч",
    value: 1000,
    icon: "✨",
    rarity: "Редкий"
  },

  {
    name: "Огненный меч",
    value: 2500,
    icon: "🔥",
    rarity: "Эпический"
  },

  {
    name: "Ледяной меч",
    value: 5000,
    icon: "❄️",
    rarity: "Эпический"
  },

  {
    name: "Меч дракона",
    value: 10000,
    icon: "🐉",
    rarity: "Легендарный"
  }

];


// ==========================
// ЗАГРУЗКА СОХРАНЕНИЯ
// ==========================

function loadGame() {

  const saved =
    localStorage.getItem("caseUpgrader");


  if (saved) {

    const data =
      JSON.parse(saved);


    balance =
      data.balance;


    inventory =
      data.inventory || [];

  }


  updateBalance();

  renderInventory();

}


// ==========================
// СОХРАНЕНИЕ
// ==========================

function saveGame() {

  const data = {

    balance: balance,

    inventory: inventory

  };


  localStorage.setItem(

    "caseUpgrader",

    JSON.stringify(data)

  );

}


// ==========================
// БАЛАНС
// ==========================

function updateBalance() {

  document
    .getElementById("balance")
    .textContent =
    balance;

}


// ==========================
// СТРАНИЦЫ
// ==========================

function showPage(pageId) {

  const pages =
    document.querySelectorAll(".page");


  pages.forEach(function(page) {

    page.classList.remove("active");

  });


  document
    .getElementById(pageId)
    .classList.add("active");

}


// ==========================
// ОТКРЫТИЕ КЕЙСА
// ==========================

function openCase(price, type) {

  if (balance < price) {

    alert(
      "Недостаточно игровых рублей!"
    );

    return;

  }


  balance =
    balance - price;


  let possibleItems = [];


  if (type === "normal") {

    possibleItems =
      items.slice(0, 3);

  }


  if (type === "rare") {

    possibleItems =
      items.slice(1, 5);

  }


  if (type === "epic") {

    possibleItems =
      items.slice(3, 6);

  }


  const randomIndex =
    Math.floor(

      Math.random()
      *
      possibleItems.length

    );


  const item =
    possibleItems[randomIndex];


  const newItem = {

    id:
      Date.now()
      +
      Math.random(),

    name:
      item.name,

    value:
      item.value,

    icon:
      item.icon,

    rarity:
      item.rarity

  };


  inventory.push(
    newItem
  );


  updateBalance();

  renderInventory();

  saveGame();


  document
    .getElementById("result")
    .innerHTML =

    `
    🎉 Тебе выпало!

    <br><br>

    <strong>

      ${newItem.icon}
      ${newItem.name}

    </strong>

    <br><br>

    💰 Цена: ${newItem.value} ₽
    `;

}


// ==========================
// ИНВЕНТАРЬ
// ==========================

function renderInventory() {

  const container =
    document.getElementById(
      "inventoryList"
    );


  container.innerHTML = "";


  if (inventory.length === 0) {

    container.innerHTML =
      "<p>Инвентарь пуст</p>";

    return;

  }


  inventory.forEach(function(item) {

    const div =
      document.createElement("div");


    div.className =
      "item";


    div.innerHTML =

      `
      <div class="item-icon">

        ${item.icon}

      </div>

      <h3>

        ${item.name}

      </h3>

      <p>

        ${item.rarity}

      </p>

      <p>

        💰 ${item.value} ₽

      </p>

      <button>

        ⬆️ Апгрейд

      </button>
      `;


    const button =
      div.querySelector("button");


    button.onclick =
      function() {

        selectItem(item.id);

      };


    container.appendChild(div);

  });

}


// ==========================
// ВЫБОР ПРЕДМЕТА
// ==========================

function selectItem(id) {

  selectedItem =
    inventory.find(function(item) {

      return String(item.id)
        === String(id);

    });


  if (!selectedItem) {

    return;

  }


  document
    .getElementById("selectedItem")
    .innerHTML =

    `
    <div>

      <div style="font-size:50px">

        ${selectedItem.icon}

      </div>

      <h3>

        ${selectedItem.name}

      </h3>

      <p>

        💰 ${selectedItem.value} ₽

      </p>

    </div>
    `;


  createTarget();


  showPage("upgrade");

}


// ==========================
// СОЗДАНИЕ ЦЕЛИ
// ==========================

function createTarget() {

  const betterItems =
    items.filter(function(item) {

      return item.value
        > selectedItem.value;

    });


  if (betterItems.length === 0) {

    document
      .getElementById("targetItem")
      .innerHTML =

      "Это максимальный предмет!";


    return;

  }


  targetItem =
    betterItems[
      Math.floor(

        Math.random()
        *
        betterItems.length

      )
    ];


  document
    .getElementById("targetItem")
    .innerHTML =

    `
    <div>

      <div style="font-size:50px">

        ${targetItem.icon}

      </div>

      <h3>

        ${targetItem.name}

      </h3>

      <p>

        💰 ${targetItem.value} ₽

      </p>

    </div>
    `;


  let chance =

    Math.floor(

      (
        selectedItem.value
        /
        targetItem.value
      )
      *
      80

    );


  if (chance < 5) {

    chance = 5;

  }


  if (chance > 80) {

    chance = 80;

  }


  document
    .getElementById("chance")
    .textContent =

    chance + "%";

}


// ==========================
// АПГРЕЙД
// ==========================

function upgradeItem() {

  if (
    !selectedItem ||
    !targetItem
  ) {

    alert(
      "Сначала выбери предмет из инвентаря!"
    );

    return;

  }


  const chanceText =
    document
      .getElementById("chance")
      .textContent;


  const chance =
    Number(
      chanceText.replace("%", "")
    );


  const random =
    Math.random() * 100;


  const index =
    inventory.findIndex(function(item) {

      return item.id
        === selectedItem.id;

    });


  // Удаляем старый предмет

  inventory.splice(
    index,
    1
  );


  if (random <= chance) {

    const newItem = {

      id:
        Date.now()
        +
        Math.random(),

      name:
        targetItem.name,

      value:
        targetItem.value,

      icon:
        targetItem.icon,

      rarity:
        targetItem.rarity

    };


    inventory.push(
      newItem
    );


    document
      .getElementById("upgradeResult")
      .innerHTML =

      `
      🎉 УСПЕХ!

      <br><br>

      Ты получил:

      <br>

      ${newItem.icon}
      <strong>
        ${newItem.name}
      </strong>
      `;

  }

  else {

    document
      .getElementById("upgradeResult")
      .innerHTML =

      `
      💥 НЕУДАЧА!

      <br><br>

      Предмет потерян.
      `;

  }


  selectedItem = null;

  targetItem = null;


  document
    .getElementById("selectedItem")
    .textContent =

    "Ничего не выбрано";


  document
    .getElementById("targetItem")
    .textContent =

    "Выбери предмет";


  document
    .getElementById("chance")
    .textContent =

    "0%";


  renderInventory();

  saveGame();

}


// ==========================
// СТАРТ
// ==========================

loadGame();
