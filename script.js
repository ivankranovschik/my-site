let power = true;
let currentFloor = 1;
let playerInside = false;
let liftReady = true;

updateDisplays();

function togglePower(){

    power = !power;

    const floorDisplay =
        document.getElementById("floorDisplay");

    const cabinDisplay =
        document.getElementById("cabinDisplay");

    if(!power){

        liftReady = false;

        document.getElementById("power").innerText =
            "Сеть: ВЫКЛ";

        floorDisplay.innerText = "";
        cabinDisplay.innerText = "";

        document.getElementById("status").innerText =
            "Питание отключено";

        closeDoors();

    }else{

        document.getElementById("power").innerText =
            "Сеть: ВКЛ";

        floorDisplay.innerText = "--";
        cabinDisplay.innerText = "--";

        document.getElementById("status").innerText =
            "Нажмите кнопку вызова";

        liftReady = false;
    }
}

function callLift(){

    if(!power){

        alert("Нет питания");
        return;
    }

    if(!liftReady){

        document.getElementById("status").innerText =
            "Запуск лифта...";

        setTimeout(() => {

            liftReady = true;

            updateDisplays();

            document.getElementById("status").innerText =
                "Лифт готов к работе";

            openDoors();

        },1500);

        return;
    }

    document.getElementById("status").innerText =
        "Лифт едет...";

    closeDoors();

    setTimeout(() => {

        currentFloor = 1;

        updateDisplays();

        document.getElementById("status").innerText =
            "Лифт прибыл";

        openDoors();

    },3000);
}

function goToFloor(floor){

    if(!power){

        alert("Нет питания");
        return;
    }

    if(!liftReady){

        alert("Сначала вызовите лифт");
        return;
    }

    if(!playerInside){

        alert("Сначала войдите в лифт");
        return;
    }

    closeDoors();

    document.getElementById("status").innerText =
        "Едем на этаж " + floor;

    setTimeout(() => {

        currentFloor = floor;

        updateDisplays();

        document.getElementById("status").innerText =
            "Прибыли на этаж " + floor;

        openDoors();

    },3000);
}

function enterLift(){

    if(!liftReady){

        alert("Лифт ещё не запущен");
        return;
    }

    playerInside = true;

    document.getElementById("insidePanel").style.display =
        "block";

    document.getElementById("status").innerText =
        "Вы внутри лифта";
}

function exitLift(){

    playerInside = false;

    document.getElementById("insidePanel").style.display =
        "none";

    document.getElementById("status").innerText =
        "Вы вышли из лифта";
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

function updateDisplays(){

    document.getElementById("floorDisplay").innerText =
        currentFloor;

    document.getElementById("cabinDisplay").innerText =
        currentFloor;
}
