let power = true;
let currentFloor = 1;
let playerInside = false;
let liftReady = true;
let moving = false;

updateDisplays();

function togglePower(){

    power = !power;

    const floorDisplay =
        document.getElementById("floorDisplay");

    const cabinDisplay =
        document.getElementById("cabinDisplay");

    if(!power){

        liftReady = false;
        moving = false;

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

    if(moving){
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
        "Лифт прибыл";

    openDoors();
}

function goToFloor(targetFloor){

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

    if(moving){
        return;
    }

    if(targetFloor === currentFloor){
        return;
    }

    moving = true;

    closeDoors();

    let direction =
        targetFloor > currentFloor ? 1 : -1;

    document.getElementById("status").innerText =
        "Лифт движется";

    let moveInterval = setInterval(() => {

        if(!power){

            clearInterval(moveInterval);

            moving = false;

            document.getElementById("status").innerText =
                "Аварийная остановка";

            return;
        }

        currentFloor += direction;

        updateDisplays();

        if(currentFloor === targetFloor){

            clearInterval(moveInterval);

            moving = false;

            document.getElementById("status").innerText =
                "Прибыли на этаж " + targetFloor;

            openDoors();
        }

    },4000);
}

function enterLift(){

    if(!liftReady){

        alert("Лифт не запущен");
        return;
    }

    if(moving){

        alert("Лифт движется");
        return;
    }

    playerInside = true;

    document.getElementById("insidePanel").style.display =
        "block";

    document.getElementById("status").innerText =
        "Вы внутри лифта";
}

function exitLift(){

    if(moving){

        alert("Нельзя выйти во время движения");
        return;
    }

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
