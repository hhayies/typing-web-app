const home = document.getElementById("home");
const button = document.querySelectorAll("button");
const link = document.getElementById("link");
const local = document.getElementById("local");
const start = document.getElementById("start");
const alert = document.getElementsByClassName("alert");
const container = document.getElementById("container");
const timer = document.getElementById("timer");
const text = document.querySelectorAll(".text");
const correct = document.getElementsByClassName("correct");
const finish = document.getElementById("finish");
const result = document.getElementById("result");
const miss = document.getElementById("miss");
const typeing = document.getElementById("typeing");
const average = document.getElementById("average");
const accuracy = document.getElementById("accuracy");

const countSound = new Audio("../audio/Countdown.mp3");
const typeSound = new Audio("../audio/typing.mp3");
const clickSound = new Audio("../audio/click.mp3");
const hoverSound = new Audio("../audio/hover.mp3");
const missSound = new Audio("../audio/miss.mp3");
const finishSound = new Audio("../audio/finish.mp3");
const playSound = new Audio("../audio/playbgm.mp3");

/* csvファイルから取ってきたことわざのリストを作成する */
const TEXTLISTS = getCSV();

/* 配列 */
let textList = [];      // ランダムで選ばれたことわざを格納するリスト
let checkTexts = [];    // 入力判定用のリスト

/* 変数 */
const ORIGINTIME = 15;      //秒数
let correct_num = 0;        //正解数
let miss_typing = 0;        //ミスタイプ数
let correct_typeing = 0;    //正しいタイプ数
let average_typeing = 0;     //平均タイプ数
let accuracy_typeing = 0;     //正確なタイプ率

let startTime;          //現在の時刻
let count;              //カウント


/* 画面表示 */
home.style.display = "block";

// ローカルストレージにデータがあるかを確認する
link.addEventListener("click", (e) => {
    if(localStorage.getItem("userInfo") == null) {
        e.preventDefault();
        notLocal();
    } else {
        link.removeEventListener("click", (e) => {
            e.preventDefault();
        })
    }
})

// ボタン押下時の音をつける
for (let i = 0; i < button.length; i++){
    button[i].addEventListener("mouseover", () => {
        hoverSound.volume = 0.5;
        hoverSound.play();
        hoverSound.currentTime = 0;
    })
}

/* ゲーム画面表示までの処理 */
button[0].addEventListener("click", () => {

    clickSound.play();
    changeDisplay(home, start);

    //3秒のカウントダウン
    let n = 3;
    alert[0].innerText = n;
    countSound.volume = 0.5;
    countSound.play();

    let countdown = setInterval(() => {
        n--;
        alert[0].innerText = n;
        if (n <= 0) {
            clearInterval(countdown);
            startGeme();
        }
    }, 1000);
})

/* ホームに戻る */
button[1].addEventListener("click", () => {
    clickSound.play();
    changeDisplay(result, home);
    init();
})



/**************  関数  *****************/


/* 初期化処理 */
function init() {
    checkTexts = [];
    correct_num = 0;
    miss_typing = 0;
    correct_typeing = 0;
    average_typing = 0;
}

/* ゲーム開始の処理 */
function startGeme() {
    changeDisplay(start, container);
    playSound.volume = 0.3;
    playSound.play();
    createText();
    startTimer();
    document.addEventListener("keydown", judgeTypeing);
}

/* タイピング処理 */
function judgeTypeing(e) {
    if (!e.repeat) {
        if (e.key === checkTexts[0].textContent.toLowerCase()) {

            typeSound.volume = 0.2;
            typeSound.play();
            typeSound.currentTime = 0;

            checkTexts[0].className = "add-blue";
            correct_typeing++;
            checkTexts.shift();

            if (!checkTexts.length) {
                correct_num++;
                createText();
            }
        }
        else {
            missSound.volume = 0.2;
            missSound.play();
            missSound.currentTime = 0;
            miss_typing++;
        }
    }
};

/* 文章を表示する */
function createText() {

    let rnd = Math.floor(Math.random() * TEXTLISTS.length);

    for (let i = 0; i < text.length; i++) {
        text[i].textContent = "";
    }

    textList = TEXTLISTS[rnd];

    /* 日本語表示 */
    text[0].textContent = textList[0];

    /* ひらがな表示 */
    text[1].textContent = textList[1];

    /* ローマ字表示 */
    checkTexts = textList[2].split("").map((value) => {
        let span = document.createElement("span");

        span.textContent = value;
        text[2].appendChild(span);

        return span;
    });

    correct[0].innerText = "正解数: " + correct_num;
};

/* タイマー処理 */
function startTimer() {
    timer.innerText = ORIGINTIME;
    startTime = new Date();
    count = setInterval(() => {
        timer.innerText = ORIGINTIME - getTimerTime();
        if (timer.innerText <= 0) timeup();
    }, 1000);
}

/* １秒後の時刻を引くことで１秒をカウントする */
function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

/* タイマーが0になったときの処理 */
function timeup() {

    clearInterval(count);
    document.removeEventListener("keydown", judgeTypeing);

    playSound.pause();
    changeDisplay(container, finish);

    finish.volume = 0.5;
    finishSound.play();

    let timerId = setTimeout(() => {
        clearTimeout(timerId);
        changeDisplay(finish, result);
        announceResult();
    }, 1000);
}

/* 結果画面表示 */
function announceResult() {
    average_typeing = Math.round(((miss_typing + correct_typeing) / ORIGINTIME) * 10) / 10;
    accuracy_typeing = Math.round(100 * correct_typeing / (miss_typing + correct_typeing));
    correct[1].innerText = "正解数: " + correct_num;
    miss.innerText = "ミスタイプ数: " + miss_typing;
    typeing.innerText = "正しいタイプ数: " + correct_typeing;
    average.innerText = "平均タイプ数: " + average_typeing;
    accuracy.innerText = "正確なタイプ率: " + accuracy_typeing + "%";

    // ローカルストレージの保存
    saveStorage();
}

/* 画面の切り替えを行う */
function changeDisplay(hide, show) {
    hide.style.display = "none";
    show.style.display = "block";
}

/* csvファイルを読み込む */
function getCSV() {
    let str = new XMLHttpRequest();
    //取得するファイルの設定(同期処理)
    str.open("GET", "../tango.csv", false);

    //リクエストの要求送信
    try {
        str.send(null);
    } catch (err) {
        window.alert(err);
    }

    // リストを準備
    list = [];

    //レスポンスが返ってきたら配列に変換する
    str.onload = csvArray(str.responseText);

    return list;
}

/* csvファイルを配列に変換する */
function csvArray(str) {

    // 各行のテキスト配列を取得
    const rows = str.slice(str.indexOf("\n") + 1).split(/\n|\r\n|\r/);

    // 各行の配列をリストに追加
    const arr = rows.map((row) => {
        const values = row.split(",");
        list.push(values);
    })
    return list;
}

/* ローカルストレージに保存する */
function saveStorage() {
    //１単語あたりのタイプスピードを計算
    let typeSpeed = Math.round((1 / average_typeing) * 1000);

    let userInfo = {
        average: average_typeing,
        speed: typeSpeed,
        accuracy: accuracy_typeing,
    }
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

/* ローカルストレージにデータがないことの注意 */
function notLocal() {
    local.style.display = "block";
    let timerId = setTimeout(() => {
        local.style.display = "none";
        clearTimeout(timerId);
    }, 1500)
}

