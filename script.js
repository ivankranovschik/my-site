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

    passengerReady = false;

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

    closeDoors();

    const floorsToGo =
        currentFloor - 1;

    if(floorsToGo <= 0){

        setTimeout(() => {

            document.getElementById(
                "floorDisplay"
            ).innerText = "--";

            document.getElementById(
                "cabinDisplay"
            ).innerText = "--";

            setTimeout(() => {

                currentFloor = 1;

                updatePassengerDisplay();

                setTimeout(() => {

                    openDoors();

                    passengerReady = true;

                    document.getElementById(
                        "status"
                    ).innerText =
                        "Пассажирский готов";

                },1000);

            },1000);

        },1000);

        return;
    }

    let identifyInterval =
        setInterval(() => {

        if(currentFloor > 1){

            currentFloor--;

            updateCameras();
        }

        if(currentFloor <= 1){

            clearInterval(
                identifyInterval
            );

            currentFloor = 1;

            document.getElementById(
                "floorDisplay"
            ).innerText = "--";

            document.getElementById(
                "cabinDisplay"
            ).innerText = "--";

            setTimeout(() => {

                updatePassengerDisplay();

                setTimeout(() => {

                    openDoors();

                    passengerReady = true;

                    document.getElementById(
                        "status"
                    ).innerText =
                        "Пассажирский готов";

                },1000);

            },1000);
        }

    },4000);
}
function identifyCargo(){

    if(!cargoPower)
        return;

    cargoReady = false;

    document.getElementById(
        "status"
    ).innerText =
        "Определение грузового";

    document.getElementById(
        "cargoDisplay"
    ).innerText = "↓--";

    const floorsToGo =
        cargoFloor - 1;

    if(floorsToGo <= 0){

        setTimeout(() => {

            document.getElementById(
                "cargoDisplay"
            ).innerText = "--";

            setTimeout(() => {

                cargoFloor = 1;

                updateCargoDisplay();

                cargoReady = true;

                document.getElementById(
                    "status"
                ).innerText =
                    "Грузовой готов";

            },1000);

        },1000);

        return;
    }

    let identifyInterval =
        setInterval(() => {

        if(cargoFloor > 1){

            cargoFloor--;

            updateCameras();
        }

        if(cargoFloor <= 1){

            clearInterval(
                identifyInterval
            );

            cargoFloor = 1;

            document.getElementById(
                "cargoDisplay"
            ).innerText = "--";

            setTimeout(() => {

                updateCargoDisplay();

                cargoReady = true;

                document.getElementById(
                    "status"
                ).innerText =
                    "Грузовой готов";

            },1000);
        }

    },4000);
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

    if(!cargoPower)
        return;

    if(!cargoReady)
        return;

    openCargoDoors();

    document.getElementById(
        "status"
    ).innerText =
        "Грузовой вызван";

    const cam =
        document.getElementById(
            "cameraCargoDoors"
        );

    if(cam)
        cam.innerText =
            "Двери: Открыты";
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
