let passengerPower = true;
let cargoPower = true;

let currentFloor = 1;
let cargoFloor = 1;

let playerInside = false;

let passengerMoving = false;
let cargoMoving = false;

let passengerManualInterval = null;
let cargoManualInterval = null;
let passengerAutoInterval = null;

updateDisplays();

function updateDisplays(text = currentFloor){

    document.getElementById("floorDisplay").innerText =
        text;

    document.getElementById("cabinDisplay").innerText =
        text;

    document.getElementById("cargoDisplay").innerText =
        cargoFloor;
}

function togglePassengerPower(){

    passengerPower = !passengerPower;

    if(passengerPower){

        document.getElementById("passengerPower").innerText =
            "Пассажирский: ВКЛ";

        document.getElementById("floorDisplay").innerText =
            currentFloor;

        document.getElementById("cabinDisplay").innerText =
            currentFloor;

    }else{

        manualStopPassenger();

        document.getElementById("passengerPower").innerText =
            "Пассажирский: ВЫКЛ";

        document.getElementById("floorDisplay").innerText =
            " ";

        document.getElementById("cabinDisplay").innerText =
            " ";
    }
}

function toggleCargoPower(){

    cargoPower = !cargoPower;

    if(cargoPower){

        document.getElementById("cargoPower").innerText =
            "Грузовой: ВКЛ";

        document.getElementById("cargoDisplay").innerText =
            cargoFloor;

    }else{

        manualStopCargo();

        document.getElementById("cargoPower").innerText =
            "Грузовой: ВЫКЛ";

        document.getElementById("cargoDisplay").innerText =
            " ";
    }
}

function callLift(){

    if(!passengerPower)
        return;

    openDoors();

    document.getElementById("status").innerText =
        "Пассажирский лифт вызван";
}

function callCargoLift(){

    if(!cargoPower)
        return;

    document.getElementById("status").innerText =
        "Грузовой лифт вызван";
}

function goToFloor(targetFloor){

    if(!passengerPower)
        return;

    if(passengerMoving)
        return;

    if(targetFloor === currentFloor)
        return;

    passengerMoving = true;

    closeDoors();

    document.getElementById("status").innerText =
        "Закрытие дверей";

    const direction =
        targetFloor > currentFloor ? 1 : -1;

    setTimeout(() => {

        document.getElementById("status").innerText =
            "Лифт тронулся";

        passengerAutoInterval = setInterval(() => {

            if(!passengerPower){

                clearInterval(passengerAutoInterval);

                passengerMoving = false;

                return;
            }

            currentFloor += direction;

            updateDisplays(
                currentFloor
            );

            if(currentFloor === targetFloor){

                clearInterval(passengerAutoInterval);

                passengerMoving = false;

                openDoors();

                document.getElementById("status").innerText =
                    "Прибыли на этаж " +
                    currentFloor;
            }

        },4000);

    },2000);
}

function manualUpPassenger(){

    if(!passengerPower)
        return;

    manualStopPassenger();

    passengerMoving = true;

    document.getElementById("status").innerText =
        "Пассажирский лифт вверх";

    let timer = 0;

    passengerManualInterval = setInterval(() => {

        timer++;

        if(timer >= 6){

            timer = 0;

            if(currentFloor < 16){

                currentFloor++;

                updateDisplays(currentFloor);
            }
        }

    },1000);
}

function manualDownPassenger(){

    if(!passengerPower)
        return;

    manualStopPassenger();

    passengerMoving = true;

    document.getElementById("status").innerText =
        "Пассажирский лифт вниз";

    let timer = 0;

    passengerManualInterval = setInterval(() => {

        timer++;

        if(timer >= 6){

            timer = 0;

            if(currentFloor > 1){

                currentFloor--;

                updateDisplays(currentFloor);
            }
        }

    },1000);
}

function manualStopPassenger(){

    clearInterval(passengerManualInterval);
    clearInterval(passengerAutoInterval);

    passengerMoving = false;

    document.getElementById("status").innerText =
        "Пассажирский лифт остановлен";
}

function manualUpCargo(){

    if(!cargoPower)
        return;

    manualStopCargo();

    cargoMoving = true;

    document.getElementById("status").innerText =
        "Грузовой лифт вверх";

    let timer = 0;

    cargoManualInterval = setInterval(() => {

        timer++;

        if(timer >= 6){

            timer = 0;

            if(cargoFloor < 16){

                cargoFloor++;

                document.getElementById(
                    "cargoDisplay"
                ).innerText = cargoFloor;
            }
        }

    },1000);
}

function manualDownCargo(){

    if(!cargoPower)
        return;

    manualStopCargo();

    cargoMoving = true;

    document.getElementById("status").innerText =
        "Грузовой лифт вниз";

    let timer = 0;

    cargoManualInterval = setInterval(() => {

        timer++;

        if(timer >= 6){

            timer = 0;

            if(cargoFloor > 1){

                cargoFloor--;

                document.getElementById(
                    "cargoDisplay"
                ).innerText = cargoFloor;
            }
        }

    },1000);
}

function manualStopCargo(){

    clearInterval(cargoManualInterval);

    cargoMoving = false;

    document.getElementById("status").innerText =
        "Грузовой лифт остановлен";
}

function enterLift(){

    playerInside = true;

    document.getElementById("status").innerText =
        "Вы вошли в лифт";
}

function exitLift(){

    playerInside = false;

    document.getElementById("status").innerText =
        "Вы вышли из лифта";
}

function openDoors(){

    document.getElementById("doorLeft").style.left =
        "-110px";

    document.getElementById("doorRight").style.right =
        "-110px";
}

function closeDoors(){

    document.getElementById("doorLeft").style.left =
        "0px";

    document.getElementById("doorRight").style.right =
        "0px";
}
