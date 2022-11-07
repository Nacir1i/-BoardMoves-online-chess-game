const canvis = document.querySelector("#unity-canvas");
const logo = document.querySelector(".logo");
const input = document.querySelector(".input");
const Joininput = document.querySelector(".join");
const creatGame = document.querySelector(".creatGame");
const joinGame = document.querySelector(".joinGame");
const btn = document.querySelector(".btn");
const popUp = document.querySelector(".endGamePopup");
const winPopup = document.querySelector(".winBanner");
const lostPopup = document.querySelector(".lostBanner");
const drawPopup = document.querySelector(".drawBanner");
const currentUrl = location.origin;

popUp.addEventListener("click", () => {
  console.log("clicked");
  popUp.classList.toggle("show");
  winPopup.classList.add("hide");
  lostPopup.classList.add("hide");
  drawPopup.classList.add("hide");
});

logo.addEventListener("click", () => {
  location.href = "/";
});

createUnityInstance(document.querySelector("#unity-canvas"), {
  dataUrl: "Build/webgl.data.unityweb",
  frameworkUrl: "Build/webgl.framework.js.unityweb",
  codeUrl: "Build/webgl.wasm.unityweb",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "DefaultCompany",
  productName: "BoardMoves_BetaTest",
  productVersion: "1.0",
  //matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
  //devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
})
  .then((unityInstance) => {
    unity = unityInstance;
  })
  .catch((err) => {
    alert(err);
  });

let unity, username, userID, MovedPiece, xPosition, yPosition;

function fetchRequest(gameId, result) {
  fetch(currentUrl + "/insertResult", {
    method: "POST",
    headers: {
      authorization: token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameId,
      userID,
      result,
    }),
  }).catch((err) => console.log(err));
}

function SendChatMessage() {
  const message = username + "," + input.value;
  if (message.length !== 0) {
    unity.SendMessage("WSClient", "SendChatMessage", message);
    input.value = null;
  }
  input.focus();
}

function disableChat() {
  input.disabled = true;
  btn.disabled = true;
}

btn.addEventListener("click", () => {
  SendChatMessage();
});

input.addEventListener("keypress", (e) => {
  if (e.code === "Enter") {
    SendChatMessage();
  }
});

creatGame.addEventListener("click", () => {
  console.log("clicked");
  unity.SendMessage("WSClient", "CreatGame");
});

joinGame.addEventListener("click", () => {
  const gameId = Joininput.value;
  unity.SendMessage("WSClient", "JoinGame", gameId);
  Joininput.value = null;
});

addEventListener("click", (event) => {
  if (event.target === canvis) {
    unity.SendMessage("WSClient", "SetFocusToGame");
  } else {
    unity.SendMessage("WSClient", "SetFocusToBrowser");
  }
});

window.addEventListener("beforeunload", function (e) {
  unity.SendMessage("WSClient", "QuitGame");
  unity.SendMessage("WSClient", "CloseConnection");
});
