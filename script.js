/*
=========================
GAME UPGRADER
=========================
*/


const START_BALANCE = 1000;

const REWARD_AMOUNT = 100;

const REWARD_TIME =
  60 * 60 * 1000;


/*
=========================
ДАННЫЕ ИГРЫ
=========================
*/


let game = {

  balance: START_BALANCE,

  inventory: [],

  casesOpened: 0,

  lastReward: null,

  selectedItem: null

};


/*
=========================
ПРЕДМЕТЫ
=========================
*/


const items = [

  {
    name: "Деревянный меч",
    value: 100,
    icon: "🗡️",
    rarity: "Обычный"
  },

  {
    name: "Железный клинок",
    value: 250,
    icon: "⚔️",
    rarity: "Редкий"
  },

  {
    name: "Золотой топор",
    value: 500,
    icon: "🪓",
    rarity: "Редкий"
  },

  {
    name: "Магический посох",
    value: 1000,
    icon: "🔮",
    rarity: "Эпический"
  },

  {
    name: "Огненный меч",
    value: 2000,
    icon: "🔥",
    rarity: "Эпический"
  },

  {
    name: "Корона короля",
    value: 5000,
    icon: "👑",
    rarity: "Легендарный"
  },

  {
    name: "Драконий клинок",
    value: 10000,
    icon: "🐉",
    rarity: "Легендарный"
  }

];


/*
=========================
ЗАГРУЗКА
=========================
*/


function loadGame() {

  const savedGame =
    localStorage.getItem(
      "gameUpgrader"
    );


  if (savedGame) {

    game =
      JSON.parse(savedGame);

  }


  updateUI();

}


function saveGame() {

  localStorage.setItem(
    "gameUpgrader",
    JSON.stringify(game)
  );

}


/*
=========================
ИНТЕРФЕЙС
=========================
*/


function updateUI() {

  document
    .getElementById("balance")
    .textContent =
      game.balance;


  document
    .getElementById("statBalance")
    .textContent =
      game.balance;


  document
    .getElementById("itemCount")
    .textContent =
      game.inventory.length;


  document
    .getElementById("casesOpened")
    .textContent =
      game.casesOpened;


  updateInventory();

  updateReward();

}


/*
=========================
НАВИГАЦИЯ
=========================
*/


function showSection(section) {

  const pages =
    document.querySelectorAll(".page");


  pages.forEach(
    page => {

      page.classList.remove(
        "active"
      );

    }
  );


  document
    .getElementById(section)
    .classList.add(
      "active"
    );

}


/*
=========================
НАГРАДА
=========================
*/


function getReward() {

  const now = Date.now();


  if (
    !game.lastReward ||
    now - game.lastReward
    >= REWARD_TIME
  ) {

    game.balance +=
      REWARD_AMOUNT;


    game.lastReward =
      now;


    saveGame();

    updateUI();


    alert(
      "🎉 Ты получил +100 игровых ₽!"
    );

  }

  else {

    alert(
      "⏳ Награда пока недоступна!"
    );

  }

}


/*
=========================
ТАЙМЕР
=========================
*/


function updateReward() {

  const timer =
    document.getElementById(
      "timer"
    );


  const button =
    document.getElementById(
      "rewardButton"
    );


  if (!game.lastReward) {

    timer.textContent =
      "Награда доступна!";


    button.disabled =
      false;


    return;

  }


  const now =
    Date.now();


  const passed =
    now - game.lastReward;


  const remaining =
    REWARD_TIME - passed;


  if (remaining <= 0) {

    timer.textContent =
      "Награда доступна!";


    button.disabled =
      false;


    return;

  }


  button.disabled =
    true;


  const hours =
    Math.floor(
      remaining / 3600000
    );


  const minutes =
    Math.floor(
      (remaining % 3600000)
      / 60000
    );


  const seconds =
    Math.floor(
      (remaining % 60000)
      / 1000
    );


  timer.textContent =
    `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

}


function formatTime(number) {

  return String(number)
    .padStart(2, "0");

}


setInterval(
  updateReward,
  1000
);


/*
=========================
КЕЙСЫ
=========================
*/


function openCase(type) {

  let price;


  if (type === "normal") {

    price = 250;

  }


  if (type === "rare") {

    price = 500;

  }


  if (type === "epic") {

    price = 1000;

  }


  if (
    game.balance < price
  ) {

    alert(
      "❌ Недостаточно игровых ₽!"
    );


    return;

  }


  game.balance -=
    price;


  let possibleItems;


  if (
    type === "normal"
  ) {

    possibleItems =
      items.slice(0, 3);

  }


  if (
    type === "rare"
  ) {

    possibleItems =
      items.slice(1, 5);

  }


  if (
    type === "epic"
  ) {

    possibleItems =
      items.slice(3);

  }


  const randomItem =
    possibleItems[
      Math.floor(
        Math.random()
        *
        possibleItems.length
      )
    ];


  const newItem = {

    ...randomItem,

    id:
      Date.now()
      +
      Math.random()

  };


  game.inventory.push(
    newItem
  );


  game.casesOpened++;


  saveGame();

  updateUI();


  showCaseResult(
    newItem
  );

}


/*
=========================
РЕЗУЛЬТАТ КЕЙСА
=========================
*/


function showCaseResult(item) {

  const result =
    document.getElementById(
      "caseResult"
    );


  result.innerHTML = `

    🎉 Тебе выпало!

    <br><br>

    <strong>

      ${item.icon}
      ${item.name}

    </strong>

    <br>

    💰 ${item.value} ₽

  `;

}


/*
=========================
ИНВЕНТАРЬ
=========================
*/


function updateInventory() {

  const inventory =
    document.getElementById(
      "inventoryList"
    );


  inventory.innerHTML = "";


  if (
    game.inventory.length === 0
  ) {

    inventory.innerHTML = `

      <p class="empty">

        🎒 Инвентарь пуст

      </p>

    `;


    return;

  }


  game.inventory.forEach(
    item => {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "inventory-item";


      element.innerHTML = `

        <div class="item-icon">

          ${item.icon}

        </div>


        <div class="item-name">

          ${item.name}

        </div>


        <div>

          ${item.rarity}

        </div>


        <div class="item-value">

          💰 ${item.value} ₽

        </div>


        <button
          onclick="selectForUpgrade('${item.id}')"
        >

          ⬆️ Апгрейд

        </button>

      `;


      inventory.appendChild(
        element
      );

    }
  );

}


/*
=========================
ВЫБОР ПРЕДМЕТА
=========================
*/


function selectForUpgrade(id) {

  const item =
    game.inventory.find(
      item =>
        String(item.id)
        ===
        String(id)
    );


  if (!item) {

    return;

  }


  game.selectedItem =
    item;


  document
    .getElementById(
      "upgradeItem"
    )
    .innerHTML = `

      <div>

        <div
          style="font-size:50px"
        >

          ${item.icon}

        </div>

        <h3>

          ${item.name}

        </h3>

        <p>

          💰 ${item.value} ₽

        </p>

      </div>

    `;


  updateUpgradeTarget();


  showSection(
    "upgrade"
  );

}


/*
=========================
ЦЕЛЬ АПГРЕЙДА
=========================
*/


function updateUpgradeTarget() {

  const item =
    game.selectedItem;


  if (!item) {

    return;

  }


  const betterItems =
    items.filter(
      target =>
        target.value
        >
        item.value
    );


  if (
    betterItems.length === 0
  ) {

    document
      .getElementById(
        "upgradeTarget"
      )
      .textContent =
        "Максимальный предмет";


    return;

  }


  const target =
    betterItems[
      Math.floor(
        Math.random()
        *
        betterItems.length
      )
    ];


  game.upgradeTarget =
    target;


  document
    .getElementById(
      "upgradeTarget"
    )
    .innerHTML = `

      <div>

        <div
          style="font-size:50px"
        >

          ${target.icon}

        </div>

        <h3>

          ${target.name}

        </h3>

        <p>

          💰 ${target.value} ₽

        </p>

      </div>

    `;


  let chance =
    Math.floor(

      (
        item.value
        /
        target.value
      )
      *
      75

    );


  if (chance < 5) {

    chance = 5;

  }


  if (chance > 80) {

    chance = 80;

  }


  game.upgradeChance =
    chance;


  document
    .getElementById(
      "upgradeChance"
    )
    .textContent =
      chance + "%";

}


/*
=========================
АПГРЕЙД
=========================
*/


function upgradeItem() {

  const item =
    game.selectedItem;


  const target =
    game.upgradeTarget;


  if (
    !item ||
    !target
  ) {

    alert(
      "Выбери предмет!"
    );


    return;

  }


  const random =
    Math.random() * 100;


  if (
    random
    <=
    game.upgradeChance
  ) {

    const index =
      game.inventory.findIndex(
        inventoryItem =>
          inventoryItem.id
          ===
          item.id
      );


    game.inventory.splice(
      index,
      1
    );


    const newItem = {

      ...target,

      id:
        Date.now()
        +
        Math.random()

    };


    game.inventory.push(
      newItem
    );


    alert(

      `🎉 УСПЕХ!

${item.name}

⬇️

${newItem.name}`

    );


    game.selectedItem =
      null;


    game.upgradeTarget =
      null;


    saveGame();

    updateUI();


    document
      .getElementById(
        "upgradeItem"
      )
      .textContent =
        "Выбери предмет из инвентаря";


    document
      .getElementById(
        "upgradeTarget"
      )
      .textContent =
        "Выбери предмет";


    document
      .getElementById(
        "upgradeChance"
      )
      .textContent =
        "0%";

  }


  else {

    const index =
      game.inventory.findIndex(
        inventoryItem =>
          inventoryItem.id
          ===
          item.id
      );


    game.inventory.splice(
      index,
      1
    );


    alert(
      "💥 Неудача! Предмет потерян."
    );


    game.selectedItem =
      null;


    game.upgradeTarget =
      null;


    saveGame();

    updateUI();


    document
      .getElementById(
        "upgradeItem"
      )
      .textContent =
        "Выбери предмет из инвентаря";


    document
      .getElementById(
        "upgradeTarget"
      )
      .textContent =
        "Выбери предмет";


    document
      .getElementById(
        "upgradeChance"
      )
      .textContent =
        "0%";

  }

}


/*
=========================
СБРОС ИГРЫ
=========================
*/


function resetGame() {

  const confirmation =
    confirm(
      "Ты точно хочешь сбросить игру?"
    );


  if (!confirmation) {

    return;

  }


  localStorage.removeItem(
    "gameUpgrader"
  );


  game = {

    balance: START_BALANCE,

    inventory: [],

    casesOpened: 0,

    lastReward: null,

    selectedItem: null

  };


  updateUI();


  alert(
    "🔄 Игра сброшена!"
  );

}


/*
=========================
СТАРТ
=========================
*/


loadGame();
