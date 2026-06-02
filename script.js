let power = true;

let currentFloor = 1;
let cargoFloor = 1;

let playerInside = false;

let liftReady = true;

let moving = false;
let cargoMoving = false;

let moveInterval = null;
let cargoInterval = null;

updateDisplays();

function togglePower(){

    power = !power;

    if(!power){

        if(moveInterval)
            clearInterval(moveInterval);

        if(cargoInterval)
            clearInterval(cargoInterval);

        moving = false;
        cargoMoving = false;
        liftReady = false;

        document.getElementById("power").innerText =
            "Сеть: ВЫКЛ";

        document.getElementById("floorDisplay").innerText =
            " ";

        document.getElementById("cabinDisplay").innerText =
            " ";

        document.getElementById("cargoDisplay").innerText =
            " ";

        document.getElementById("status").innerText =
            "Питание отключено";

    }else{

        document.getElementById("power").innerText =
            "Сеть: ВКЛ";

        document.getElementById("floorDisplay").innerText =
            "--";

        document.getElementById("cabinDisplay").innerText =
            "--";

        document.getElementById("cargoDisplay").innerText =
            "--";

        document.getElementById("status").innerText =
            "Нажмите кнопку вызова";

        liftReady = false;
    }
}

function callLift(){

    if(!power){
        return;
    }

    if(!liftReady){

        document.getElementById("status").innerText =
            "Запуск лифта";

        setTimeout(() => {

            liftReady = true;

            updateDisplays();

            openDoors();

            document.getElementById("status").innerText =
                "Лифт готов";

        },1500);

        return;
    }

    openDoors();
}

function callCargoLift(){

    if(!power)
        return;

    document.getElementById("status").innerText =
        "Грузовой лифт вызван";
}

function goToFloor(targetFloor){

    if(!power)
        return;

    if(!playerInside)
        return;

    if(moving)
        return;

    if(targetFloor === currentFloor)
        return;

    moving = true;

    closeDoors();

    document.getElementById("status").innerText =
        "Закрытие дверей";

    let direction =
        targetFloor > currentFloor ? 1 : -1;

    setTimeout(() => {

        document.getElementById("status").innerText =
            "Лифт тронулся";

        setTimeout(() => {

            currentFloor += direction;

            updateDisplays(
                (direction > 0 ? "↑" : "↓") +
                currentFloor
            );

            moveInterval = setInterval(() => {

                if(currentFloor === targetFloor){

                    clearInterval(moveInterval);

                    moving = false;

                    updateDisplays(currentFloor);

                    openDoors();

                    document.getElementById("status").innerText =
                        "Прибыли на этаж " +
                        currentFloor;

                    return;
                }

                currentFloor += direction;

                updateDisplays(
                    (direction > 0 ? "↑" : "↓") +
                    currentFloor
                );

            },4000);

        },1000);

    },1000);
}

function manualUpPassenger(){

    if(moving)
        return;

    currentFloor += 0.5;

    updateDisplays(
        "↑" + currentFloor
    );
}

function manualDownPassenger(){

    if(moving)
        return;

    currentFloor -= 0.5;

    if(currentFloor < 1)
        currentFloor = 1;

    updateDisplays(
        "↓" + currentFloor
    );
}

function manualStopPassenger(){

    if(moveInterval)
        clearInterval(moveInterval);

    moving = false;

    document.getElementById("status").innerText =
        "Пассажирский лифт остановлен";
}

function manualUpCargo(){

    cargoFloor += 0.5;

    document.getElementById("cargoDisplay").innerText =
        "↑" + cargoFloor;
}

function manualDownCargo(){

    cargoFloor -= 0.5;

    if(cargoFloor < 1)
        cargoFloor = 1;

    document.getElementById("cargoDisplay").innerText =
        "↓" + cargoFloor;
}

function manualStopCargo(){

    document.getElementById("status").innerText =
        "Грузовой лифт остановлен";
}

function enterLift(){

    playerInside = true;

    document.getElementById("insidePanel").style.display =
        "block";
}

function exitLift(){

    playerInside = false;

    document.getElementById("insidePanel").style.display =
        "none";
}

function openDoors(){

    document.getElementById("doorLeft").style.left =
        "-100px";

    document.getElementById("doorRight").style.right =
        "-100px";
}

function closeDoors(){

    document.getElementById("doorLeft").style.left =
        "0px";

    document.getElementById("doorRight").style.right =
        "0px";
}

function updateDisplays(text = currentFloor){

    document.getElementById("floorDisplay").innerText =
        text;

    document.getElementById("cabinDisplay").innerText =
        text;

    const cargoDisplay =
        document.getElementById("cargoDisplay");

    if(cargoDisplay)
        cargoDisplay.innerText = cargoFloor;
}
