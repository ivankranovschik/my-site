let passengerPower = true;
let cargoPower = true;

let passengerReady = true;
let cargoReady = true;

let passengerInspection = false;
let cargoInspection = false;

let playerInside = false;

let currentFloor = 1;
let cargoFloor = 1;

let passengerInterval = null;
let cargoInterval = null;

let passengerDirection = "";
let cargoDirection = "";

updateAll();

function updateAll(){

    updatePassengerDisplay();
    updateCargoDisplay();
    updateCameras();
}

function updatePassengerDisplay(){

    const text =
        passengerDirection + currentFloor;

    document.getElementById(
        "floorDisplay"
    ).innerText = text;

    document.getElementById(
        "cabinDisplay"
    ).innerText = text;
}

function updateCargoDisplay(){

    document.getElementById(
        "cargoDisplay"
    ).innerText =
        cargoDirection + cargoFloor;
}

function updateCameras(){

    const pFloor =
        document.getElementById(
            "cameraPassengerFloor"
        );

    const cFloor =
        document.getElementById(
            "cameraCargoFloor"
        );

    if(pFloor)
        pFloor.innerText =
            "Этаж: " + currentFloor;

    if(cFloor)
        cFloor.innerText =
            "Этаж: " + cargoFloor;
}

function togglePassengerPower(){

    passengerPower = !passengerPower;

    if(!passengerPower){

        passengerReady = false;

        manualStopPassenger();

        document.getElementById(
            "passengerPower"
        ).innerText =
            "Пассажирский: ВЫКЛ";

        document.getElementById(
            "floorDisplay"
        ).innerText = " ";

        document.getElementById(
            "cabinDisplay"
        ).innerText = " ";

    }else{

        passengerReady = false;

        document.getElementById(
            "passengerPower"
        ).innerText =
            "Пассажирский: ВКЛ";

        document.getElementById(
            "floorDisplay"
        ).innerText = "--";

        document.getElementById(
            "cabinDisplay"
        ).innerText = "--";
    }
}

function toggleCargoPower(){

    cargoPower = !cargoPower;

    if(!cargoPower){

        cargoReady = false;

        manualStopCargo();

        document.getElementById(
            "cargoPower"
        ).innerText =
            "Грузовой: ВЫКЛ";

        document.getElementById(
            "cargoDisplay"
        ).innerText = " ";

    }else{

        cargoReady = false;

        document.getElementById(
            "cargoPower"
        ).innerText =
            "Грузовой: ВКЛ";

        document.getElementById(
            "cargoDisplay"
        ).innerText = "--";
    }
}

function identifyPassenger(){

    if(!passengerPower)
        return;

    document.getElementById(
        "status"
    ).innerText =
        "Определение пассажирского";

    document.getElementById(
        "floorDisplay"
    ).innerText = "↓--";

    document.getElementById(
        "cabinDisplay"
    ).innerText = "↓--";

    setTimeout(() => {

        currentFloor = 1;

        document.getElementById(
            "floorDisplay"
        ).innerText = "↓1";

        document.getElementById(
            "cabinDisplay"
        ).innerText = "↓1";

        setTimeout(() => {

            passengerReady = true;

            passengerDirection = "";

            updatePassengerDisplay();

            document.getElementById(
                "status"
            ).innerText =
                "Пассажирский готов";

        },2000);

    },5000);
}

function identifyCargo(){

    if(!cargoPower)
        return;

    document.getElementById(
        "status"
    ).innerText =
        "Определение грузового";

    document.getElementById(
        "cargoDisplay"
    ).innerText = "↓--";

    setTimeout(() => {

        cargoFloor = 1;

        document.getElementById(
            "cargoDisplay"
        ).innerText = "↓1";

        setTimeout(() => {

            cargoReady = true;

            cargoDirection = "";

            updateCargoDisplay();

            document.getElementById(
                "status"
            ).innerText =
                "Грузовой готов";

        },2000);

    },5000);
}

function togglePassengerInspection(){

    passengerInspection =
        !passengerInspection;

    document.getElementById(
        "status"
    ).innerText =
        passengerInspection
        ? "Ревизия ПЛ ВКЛ"
        : "Ревизия ПЛ ВЫКЛ";
}

function toggleCargoInspection(){

    cargoInspection =
        !cargoInspection;

    document.getElementById(
        "status"
    ).innerText =
        cargoInspection
        ? "Ревизия ГЛ ВКЛ"
        : "Ревизия ГЛ ВЫКЛ";
}

function callLift(){

    if(!passengerReady)
        return;

    openDoors();

    document.getElementById(
        "status"
    ).innerText =
        "Пассажирский вызван";
}

function callCargoLift(){

    if(!cargoReady)
        return;

    document.getElementById(
        "status"
    ).innerText =
        "Грузовой вызван";
}

function goToFloor(targetFloor){

    if(!passengerReady)
        return;

    clearInterval(passengerInterval);

    closeDoors();

    const direction =
        targetFloor > currentFloor
        ? 1
        : -1;

    passengerDirection =
        direction > 0 ? "↑" : "↓";

    passengerInterval =
        setInterval(() => {

        if(currentFloor === targetFloor){

            clearInterval(
                passengerInterval
            );

            passengerDirection = "";

            updatePassengerDisplay();

            openDoors();

            document.getElementById(
                "status"
            ).innerText =
                "Прибыли";

            return;
        }

        currentFloor += direction;

        updatePassengerDisplay();
        updateCameras();

    },4000);
}

function manualUpPassenger(){

    if(!passengerInspection)
        return;

    clearInterval(passengerInterval);

    passengerInterval =
        setInterval(() => {

        if(currentFloor < 16){

            currentFloor++;

            passengerDirection = "";

            updatePassengerDisplay();
            updateCameras();
        }

    },6000);
}

function manualDownPassenger(){

    if(!passengerInspection)
        return;

    clearInterval(passengerInterval);

    passengerInterval =
        setInterval(() => {

        if(currentFloor > 1){

            currentFloor--;

            passengerDirection = "";

            updatePassengerDisplay();
            updateCameras();
        }

    },6000);
}

function manualStopPassenger(){

    clearInterval(passengerInterval);
}

function manualUpCargo(){

    if(!cargoInspection)
        return;

    clearInterval(cargoInterval);

    cargoInterval =
        setInterval(() => {

        if(cargoFloor < 16){

            cargoFloor++;

            cargoDirection = "";

            updateCargoDisplay();
            updateCameras();
        }

    },6000);
}

function manualDownCargo(){

    if(!cargoInspection)
        return;

    clearInterval(cargoInterval);

    cargoInterval =
        setInterval(() => {

        if(cargoFloor > 1){

            cargoFloor--;

            cargoDirection = "";

            updateCargoDisplay();
            updateCameras();
        }

    },6000);
}

function manualStopCargo(){

    clearInterval(cargoInterval);
}

function enterLift(){

    playerInside = true;

    document.getElementById(
        "status"
    ).innerText =
        "Вы вошли в лифт";
}

function exitLift(){

    playerInside = false;

    document.getElementById(
        "status"
    ).innerText =
        "Вы вышли из лифта";
}

function openDoors(){

    document.getElementById(
        "doorLeft"
    ).style.left = "-110px";

    document.getElementById(
        "doorRight"
    ).style.right = "-110px";

    const cam =
        document.getElementById(
            "cameraPassengerDoors"
        );

    if(cam)
        cam.innerText =
            "Двери: Открыты";
}

function closeDoors(){

    document.getElementById(
        "doorLeft"
    ).style.left = "0px";

    document.getElementById(
        "doorRight"
    ).style.right = "0px";

    const cam =
        document.getElementById(
            "cameraPassengerDoors"
        );

    if(cam)
        cam.innerText =
            "Двери: Закрыты";
}
