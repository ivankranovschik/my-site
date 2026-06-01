let power = true;
let floor = 1;

function togglePower() {
    power = !power;

    document.getElementById("power").innerText =
        "Сеть: " + (power ? "ВКЛ" : "ВЫКЛ");
}

function goToFloor(targetFloor) {

    if (!power) {
        alert("Нет питания!");
        return;
    }

    floor = targetFloor;

    document.getElementById("floorText").innerText =
        "Этаж: " + floor;

    let lift = document.getElementById("lift");

    lift.style.transform =
        `translateY(${-floor * 20}px)`;
}
