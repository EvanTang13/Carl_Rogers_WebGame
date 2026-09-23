const screens = {
  page: document.getElementById("screen-page"),
  question: document.getElementById("screen-question"),
  bad: document.getElementById("screen-bad")
};

let currentScene = 0; // 目前題號（0 起算），回上一題不需要歷史紀錄

function setBg(id, url) {
  document.getElementById(id).style.backgroundImage = url ? `url("${url}")` : "";
}

// 切換畫面；theme: "light"（白字，預設）或 "dark"（深色字，用在淺色背景）
function show(name, theme = "light") {
  for (const key in screens) screens[key].hidden = key !== name;
  const screen = screens[name];
  screen.dataset.theme = theme;
  screen.classList.remove("enter");
  void screen.offsetWidth; // 重新觸發進場動畫
  screen.classList.add("enter");
  window.scrollTo(0, 0);
}

// 顯示一個通用頁面（開場／結尾），按鈕按下後執行 onNext
function showPage(page, onNext) {
  const title = document.getElementById("page-title");
  title.textContent = page.title;
  title.hidden = !page.title;
  document.getElementById("page-text").textContent = page.text;
  const btn = document.getElementById("btn-page");
  btn.textContent = page.button;
  btn.onclick = onNext;
  setBg("bg-page", page.bg);
  show("page", page.theme);
}

function showIntro(i = 0) {
  const isLast = i === story.intro.length - 1;
  showPage(story.intro[i], () => {
    if (isLast) {
      currentScene = 0;
      showQuestion();
    } else {
      showIntro(i + 1);
    }
  });
}

function showOutro(i = 0) {
  const isLast = i === story.outro.length - 1;
  showPage(story.outro[i], () => (isLast ? showIntro(0) : showOutro(i + 1)));
}

function showQuestion() {
  const scene = story.scenes[currentScene];
  const narration = document.getElementById("narration");
  narration.textContent = scene.narration;
  narration.hidden = !scene.narration;
  document.getElementById("question-text").textContent = "小宇：\n" + scene.text;
  setBg("bg-question", scene.bg);

  const box = document.getElementById("choices");
  box.replaceChildren();
  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => choose(choice, btn));
    box.appendChild(btn);
  });
  show("question", scene.theme);
}

// 先給按鈕一點回饋（對＝綠、錯＝紅並震動），稍後再換畫面
function choose(choice, btn) {
  const all = document.querySelectorAll("#choices button");
  all.forEach(b => (b.disabled = true));
  btn.classList.add(choice.correct ? "right" : "wrong");
  setTimeout(() => {
    if (choice.correct) {
      currentScene++;
      if (currentScene >= story.scenes.length) showOutro(0);
      else showQuestion();
    } else {
      showBad();
    }
  }, choice.correct ? 450 : 600);
}

function showBad() {
  document.getElementById("bad-title").textContent = story.bad.title;
  document.getElementById("bad-text").textContent = story.bad.text;
  document.getElementById("btn-back").textContent = story.bad.button;
  setBg("bg-bad", story.bad.bg);
  show("bad", "light");
}

document.getElementById("btn-back").addEventListener("click", showQuestion);

showIntro(0);
