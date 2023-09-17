const explain = document.getElementById("explain");
const log = document.getElementsByClassName("log");
const button = document.querySelectorAll("button");
const start = document.getElementById("start");
const alert = document.getElementsByClassName("alert");
const container = document.getElementById("container");
const text = document.querySelectorAll(".text");
const score = document.getElementById("score");
const circle = document.getElementsByClassName("circle");
const finish = document.getElementById("finish");
const result = document.getElementById("result");
const average = document.getElementById("average");
const accuracy = document.getElementById("accuracy");
const home = document.getElementById("home");
const save = document.getElementById("save");

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
let mycheckTexts = [];    // 自分の入力判定用のリスト
let comCheckTexts = [];    // comの入力判定用のリスト

/* 定数 */
const questions = 5;        //問題数

/* 変数 */
let miss_typing = 0;        //ミスタイプ数
let correct_typeing = 0;    //正しいタイプ数
let average_typing = 0;     //平均タイプ数
let my_score = 0;           //自分の得点
let enemy_score = 0;        //comの得点
let order = 0;              //得点をつける用の順番

let startTime, nowTime; //秒数
let enemyTyping;         //comのタイピング

/* ローカルストレージの情報を取得 */
const item = JSON.parse(localStorage.getItem("userInfo"));
const aveg = item["average"];        //平均タイプ数
const speed = item["speed"];        //タイピングスピード
const rate = item["accuracy"];      //正確さ

/* 得点用の丸を生成する */
for (let i = 0; i < questions; i++){
    const blocks = document.createElement("div");
    blocks.classList.add("circle");
    score.appendChild(blocks);
}

/* ホバー時の音付け */
for (let i = 0; i < button.length; i++){
    button[i].addEventListener("mouseover", () => {
        hoverSound.volume = 0.5;
        hoverSound.play();
        hoverSound.currentTime = 0;
    })
}

/* カウントダウン表示 */
explain.style.display = "block";

/* 現在の情報を表示 */
log[0].innerText = "平均タイプ数: " + aveg;
log[1].innerText = "正確なタイプ率: " + rate;

/* ゲーム画面表示までの処理 */
button[0].addEventListener("click", () => {

    clickSound.play();
    changeDisplay(explain, start);

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
            startGame();
        }
    }, 1000);
})

/* ホームに戻る */
home.addEventListener("click", () => {
    clickSound.play();
    changeDisplay(result, home);
    init();
})

/* 上書き保存 */
button[1].addEventListener("click", () => {
    clickSound.play();
    saveStorage();
    saveComp();
})



/**************  関数  *****************/


/* 初期化処理 */
function init() {
    mycheckTexts = [];
    miss_typing = 0;
    correct_typeing = 0;
    average_typing = 0;
    my_score = 0;
    enemy_score = 0;
    order = 0;
}

/* ゲーム開始の処理 */
function startGame() {

    //画面の切り替え
    changeDisplay(start, container);

    //スタート時刻設定
    startTime = new Date();

    //プレイ中の音楽再生
    playSound.volume = 0.3;
    playSound.play();
    playSound.currentTime = 0;

    //テキスト表示
    createText();
    //タイピング処理
    document.addEventListener("keydown", judgeTypeing);
}

/* 文章を表示する */
function createText() {

     //表示する前に終了判定を行う
    if ((my_score + enemy_score) >= questions) {
        nowTime = new Date();
        finishGame();
    }

    // 終了でなければ文字を表示する
    else {
        let rnd = Math.floor(Math.random() * TEXTLISTS.length);

        for (let i = 0; i < text.length; i++) {
            text[i].textContent = "";
        }

        textList = TEXTLISTS[rnd];

        /* 日本語表示 */
        text[0].textContent = textList[0];

        /* ひらがな表示 */
        text[1].textContent = textList[1];

        /* 自分用のチェックリストを作成する(ローマ字表示) */
        mycheckTexts = textList[2].split("").map((value) => {
            let span = document.createElement("span");

            // ローマ字の並びにspanタグをつけて表示する
            span.textContent = value;
            text[2].appendChild(span);

            return span;
        });

        /* com用のチェックリストを作成する */
        comCheckTexts = textList[2].split("").map((value) => {
            let span = document.createElement("span");

            // ローマ字の並びにspanタグをつけて表示する
            span.textContent = value;
            text[3].appendChild(span);

            return span;
        });

        comTyping(speed, rate);
    }
};

/* タイピング処理 */
function judgeTypeing(e) {
    if (!e.repeat) {
        if (e.key === mycheckTexts[0].textContent.toLowerCase()) {

            typeSound.volume = 0.2;
            typeSound.play();
            typeSound.currentTime = 0;

            mycheckTexts[0].className = "add-blue";
            correct_typeing++;
            mycheckTexts.shift();

            if (!mycheckTexts.length) {
                clearInterval(enemyTyping);
                my_score++;
                circle[order].classList.add("mypoint");
                order++;
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

/* 終了処理 */
function finishGame() {

    // キー処理のイベントを外す
    document.removeEventListener("keydown", judgeTypeing);

    // comのタイピングを停止する
    clearInterval(enemyTyping);

    //音楽を止める
    playSound.pause();

    // 勝利判定
    judgeWinner();

    changeDisplay(container, finish);

    finish.volume = 0.5;
    finishSound.play();

    // 終了を2秒間表示
    let timerId = setTimeout(() => {
        clearTimeout(timerId);
        changeDisplay(finish, result);
        announceResult();
    }, 2000);
}

/* 結果画面表示 */
function announceResult() {

    // 秒数を計算
    let elapsedTime = Math.floor((nowTime - startTime) / 1000);
    // 平均のタイピング数を計算
    average_typing = Math.round(((miss_typing + correct_typeing) / elapsedTime ) * 10) / 10;
    // 正確さを計算
    accuracy_typeing = Math.round(100 * correct_typeing / (miss_typing + correct_typeing));
    //前回からの成長率を計算
    let improve = compareResult(average_typing, accuracy_typeing);

    average.innerText = "平均タイプ数: " + average_typing + "  (" + improve[0] + ")";
    accuracy.innerText = "正確なタイプ率: " + accuracy_typeing + "%" + "  (" + improve[1] + ")";
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

/* com側の処理 */
function comTyping(speed, rate) {

    let i = 0;

    enemyTyping = setInterval(() => {

        //正確さに基づいてミスが発生する
        let miss = Math.floor(Math.random() * 101);
        if (miss > (100 - rate)) {
            comCheckTexts[i].className = "add-color";
            i++;

            // com側が全てタイピングを終えたときの処理
            if (i === comCheckTexts.length) {
                enemy_score++;
                clearInterval(enemyTyping);
                circle[order].classList.add("enempoint");
                order++;
                createText();
            }
        }
    }, speed);
}

// 勝敗に応じてメッセージを表示する
function judgeWinner() {
    const board = document.getElementById('backboard');
    if (my_score > enemy_score) {
        alert[1].innerText = "You Win!";
        board.style.backgroundColor = "aqua";
    }
    else if (my_score === enemy_score) {
        alert[1].innerText = "Draw";
        board.style.backgroundColor = "rgb(239, 236, 29)";
    }
    else {
        alert[1].innerText = "You Lose";
    board.style.backgroundColor = "rgb(89, 248, 158)";
    }
}

/* ローカルストレージに保存する */
function saveStorage() {
    //１秒当たりのタイプスピードを計算
    let typeSpeed = Math.round((1 / average_typing) * 1000);

    let userInfo = {
        average: average_typing,
        speed: typeSpeed,
        accuracy: accuracy_typeing,
    }
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

function compareResult(avg, acc) {
    let spe = Math.round((avg - aveg) * 10) / 10;
    let rat = acc - rate;
    let deg = []

    // 速さの正負の判定
    if (spe > 0) {
        deg[0] = "+" + spe;
    } else deg[0] = spe;

    // 正確さの正負の判定
    if (rat > 0) {
        deg[1] = "+" + rat;
    } else deg[1] = rat;

    console.log(deg);

    return deg;
}

/* 上書き保存完了報告 */
function saveComp() {
    save.style.display = "block";
    let timerId = setTimeout(() => {
        save.style.display = "none";
        clearTimeout(timerId);
    }, 1500)
}
