let power = true;
let currentFloor = 1;
let playerInside = false;

function togglePower(){

    power = !power;

    document.getElementById("power").innerText =
        "Сеть: " + (power ? "ВКЛ" : "ВЫКЛ");
}

function callLift(){

    if(!power){
        alert("Лифт отключён");
        return;
    }

    document.getElementById("status").innerText =
        "Лифт едет...";

    closeDoors();

    setTimeout(() => {

        currentFloor = 1;

        document.getElementById("status").innerText =
            "Лифт прибыл";

        openDoors();

    },3000);
}

function goToFloor(floor){

    if(!playerInside){
        alert("Сначала войдите в лифт");
        return;
    }

    closeDoors();

    document.getElementById("status").innerText =
        "Едем на этаж " + floor;

    setTimeout(() => {

        currentFloor = floor;

        document.getElementById("status").innerText =
            "Прибыли на этаж " + floor;

        openDoors();

    },3000);
}

function enterLift(){

    if(currentFloor !== 1){
        alert("Лифт не на этаже");
        return;
    }

    playerInside = true;

    document.getElementById("insidePanel").style.display =
        "block";

    document.getElementById("status").innerText =
        "Вы внутри лифта";
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
