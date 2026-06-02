let passengerPower = true;
let cargoPower = true;

let passengerReady = true;
let cargoReady = true;

let passengerInspection = false;
let cargoInspection = false;

let currentFloor = 1;
let cargoFloor = 1;

let passengerInterval = null;
let cargoInterval = null;

updateDisplays();

function updateDisplays(text = currentFloor){

    document.getElementById("floorDisplay").innerText = text;
    document.getElementById("cabinDisplay").innerText = text;
    document.getElementById("cargoDisplay").innerText = cargoFloor;
}

function togglePassengerPower(){

    passengerPower = !passengerPower;

    if(!passengerPower){

        manualStopPassenger();

        passengerReady = false;

        document.getElementById("passengerPower").innerText =
            "Пассажирский: ВЫКЛ";

        document.getElementById("floorDisplay").innerText =
            " ";

        document.getElementById("cabinDisplay").innerText =
            " ";

    }else{

        passengerReady = false;

        document.getElementById("passengerPower").innerText =
            "Пассажирский: ВКЛ";

        document.getElementById("floorDisplay").innerText =
            "--";

        document.getElementById("cabinDisplay").innerText =
            "--";
    }
}

function toggleCargoPower(){

    cargoPower = !cargoPower;

    if(!cargoPower){

        manualStopCargo();

        cargoReady = false;

        document.getElementById("cargoPower").innerText =
            "Грузовой: ВЫКЛ";

        document.getElementById("cargoDisplay").innerText =
            " ";

    }else{

        cargoReady = false;

        document.getElementById("cargoPower").innerText =
            "Грузовой: ВКЛ";

        document.getElementById("cargoDisplay").innerText =
            "--";
    }
}

function identifyPassenger(){

    if(!passengerPower) return;

    document.getElementById("floorDisplay").innerText =
        "↓--";

    document.getElementById("cabinDisplay").innerText =
        "↓--";

    document.getElementById("status").innerText =
        "Определение пассажирского лифта";

    setTimeout(() => {

        currentFloor = 1;

        document.getElementById("floorDisplay").innerText =
            "↓1";

        document.getElementById("cabinDisplay").innerText =
            "↓1";

        setTimeout(() => {

            passengerReady = true;

            updateDisplays(1);

        },2000);

    },5000);
}

function identifyCargo(){

    if(!cargoPower) return;

    document.getElementById("cargoDisplay").innerText =
        "↓--";

    document.getElementById("status").innerText =
        "Определение грузового лифта";

    setTimeout(() => {

        cargoFloor = 1;

        document.getElementById("cargoDisplay").innerText =
            "↓1";

        setTimeout(() => {

            cargoReady = true;

            document.getElementById("cargoDisplay").innerText =
                "1";

        },2000);

    },5000);
}

function togglePassengerInspection(){

    passengerInspection = !passengerInspection;

    document.getElementById("status").innerText =
        passengerInspection
        ? "Ревизия пассажирского ВКЛ"
        : "Ревизия пассажирского ВЫКЛ";
}

function toggleCargoInspection(){

    cargoInspection = !cargoInspection;

    document.getElementById("status").innerText =
        cargoInspection
        ? "Ревизия грузового ВКЛ"
        : "Ревизия грузового ВЫКЛ";
}

function goToFloor(targetFloor){

    if(!passengerPower) return;
    if(!passengerReady) return;

    closeDoors();

    let direction =
        targetFloor > currentFloor ? 1 : -1;

    passengerInterval = setInterval(() => {

        if(currentFloor === targetFloor){

            clearInterval(passengerInterval);

            openDoors();

            return;
        }

        currentFloor += direction;

        updateDisplays(
            (direction > 0 ? "↑" : "↓") +
            currentFloor
        );

    },4000);
}

function manualUpPassenger(){

    if(!passengerInspection) return;

    clearInterval(passengerInterval);

    passengerInterval = setInterval(() => {

        if(currentFloor < 16){

            currentFloor++;

            updateDisplays(currentFloor);
        }

    },6000);
}

function manualDownPassenger(){

    if(!passengerInspection) return;

    clearInterval(passengerInterval);

    passengerInterval = setInterval(() => {

        if(currentFloor > 1){

            currentFloor--;

            updateDisplays(currentFloor);
        }

    },6000);
}

function manualStopPassenger(){

    clearInterval(passengerInterval);
}

function manualUpCargo(){

    if(!cargoInspection) return;

    clearInterval(cargoInterval);

    cargoInterval = setInterval(() => {

        if(cargoFloor < 16){

            cargoFloor++;

            document.getElementById("cargoDisplay").innerText =
                cargoFloor;
        }

    },6000);
}

function manualDownCargo(){

    if(!cargoInspection) return;

    clearInterval(cargoInterval);

    cargoInterval = setInterval(() => {

        if(cargoFloor > 1){

            cargoFloor--;

            document.getElementById("cargoDisplay").innerText =
                cargoFloor;
        }

    },6000);
}

function manualStopCargo(){

    clearInterval(cargoInterval);
}

function callLift(){

    if(passengerReady)
        openDoors();
}

function callCargoLift(){

    document.getElementById("status").innerText =
        "Грузовой вызван";
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
