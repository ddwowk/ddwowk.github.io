const message = [
    "ไม่เอาจริงดิ๊?",
    "คิดดีๆ ก่อนนะ...",
    "ขอร้องงงน้าาา",
    "ตอบ 'ตกลง' เถอะะ",
    "อย่าใจร้ายกับเค้านะะ",
    "ให้โอกาสอีกทีก็ได้",
    "ลองกด 'ตกลง' ดู...",
    "อย่าทำแบบนี้เลย!",
    "ใจเย็นๆ นะตัวเอง...",
    "นะ... นะ... นะ...",
    "ตอบ 'ตกลง' นะค้าบบ",
    "พลีสสสสสสส",
    "ขอวอนนนนนนน",
    "อย่าปฏิเสธเค้านะะ",
    "เค้าเศร้าน้าาา",
    "ฮืออออออออ",
    "ตกลงเถอะน่าาา",
    "ให้เค้าหน่อยน้าาา",
    "วาเลนไทน์นี้นะะะ",
    "นะ นะ นะ ตกลงนะ",
];
let messageIndex = 0;

function handleNoClick() {
    console.log("handleNoClick() function is called!");
    const noButton = document.querySelector(".no");
    const yesButton = document.querySelector(".yes");
    const imageElement = document.querySelector(".image img");
    const buttonsContainer = document.querySelector(".buttons");

    const randomIndex = Math.floor(Math.random() * message.length);
    noButton.textContent = message[randomIndex];
    imageElement.src = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmRrb285Zm04dHNhemxzbnUyc3FzYWNybzA0eDYyZDJyNDN2bm9pOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/QlQdLBS70XJcZY1fLF/giphy.gif";
    const currentSize = parseFloat(window.getComputedStyle(yesButton).fontSize);
    const newSize = currentSize * 1.5;

    if (newSize > 15000) {
        newSize = 15000;
    }
    yesButton.style.fontSize = `${newSize}px`;

    const yesButtonRect = yesButton.getBoundingClientRect();
    const yesButtonWidth = yesButtonRect.width;

    const screenWidth = window.innerWidth;
    const thresholdWidth = screenWidth * 0.8;

    console.log("Current Yes button width:", yesButtonWidth);
    console.log("Threshold width (80% of screen):", thresholdWidth);


    if (yesButtonWidth >= 10000) {
        noButton.style.display = 'none';
    }

    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.alignItems = 'center';
}
function handleYesClick() {
    window.location.href = "yes.html"
}

document.addEventListener('DOMContentLoaded', function() {
    const noButton = document.querySelector(".no");
    noButton.addEventListener("click", handleNoClick);

    const yesButton = document.querySelector(".yes");
    yesButton.addEventListener("click", handleYesClick);
});