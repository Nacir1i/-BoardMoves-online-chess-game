const user = document.querySelector(".username");
const firstname = document.querySelector(".firstname");
const date = document.querySelector(".date");
const gamesPlayed = document.querySelector(".gamesPlayed");
const gamesWon = document.querySelector(".gamesWon");
const rating = document.querySelector(".rating");
const winrate = document.querySelector(".winrate");
const firstnameInput = document.querySelector("#firstname");
const lastnameInput = document.querySelector("#lastname");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const matchesDiv = document.querySelector(".matchesDiv");

async function laodProfileUi() {
  const userInfo = await verifyToken();
  const fetchMatchHistory = await fetch(currentUrl + "/getMatchHistory", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID }),
  });
  const fetchMatches = await fetch(currentUrl + "/getMatchesPlayed", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID }),
  });

  const matchesData = await fetchMatches.json();
  const matchHistory = await fetchMatchHistory.json();
  const wins = matchesData.filter((game) => game.result === 1);
  const win_rate = Math.floor((wins.length / matchesData.length) * 100);
  const uniqueMatches = [...new Set(matchHistory.map((item) => item.matchID))];
  const matchHistoryMap = uniqueMatches.map((key) => [key]);

  for (let i = 0; i < matchHistory.length; i++) {
    for (let y = 0; y < matchHistoryMap.length; y++) {
      if (matchHistoryMap[y][0] === matchHistory[i].matchID) {
        matchHistoryMap[y].push(matchHistory[i]);
      }
    }
  }
  for (let i = 0; i < matchHistoryMap.length; i++) {
    const newMatche = document.createElement("div");
    const macthPlayers = document.createElement("div");
    const versusImg = document.createElement("img");
    const player1 = document.createElement("span");
    const player2 = document.createElement("span");
    const resultImg = document.createElement("img");
    const result = document.createElement("div");
    const myResult = matchHistoryMap[i].filter(
      (results) => results.username === username
    );

    player1.innerText = matchHistoryMap[i][1].username;
    player2.innerText = matchHistoryMap[i][2].username;

    versusImg.src = "sourcs/versus.png";
    versusImg.classList.add("vs");
    macthPlayers.classList.add("macthPlayers");
    macthPlayers.classList.add("flexCenter");
    result.classList.add("result");
    result.classList.add("flexCenter");
    newMatche.classList.add("newMatch");
    newMatche.classList.add("flexCenter");
    resultImg.classList.add("res");
    if (myResult[0].result === 1) {
      resultImg.src = "sourcs/check.png";
    } else {
      resultImg.src = "sourcs/minus.png";
    }
    if (matchHistoryMap[i][1].result === matchHistoryMap[i][2].result) {
      resultImg.src = "sourcs/equal.png";
    }

    macthPlayers.appendChild(player1);
    macthPlayers.appendChild(versusImg);
    macthPlayers.appendChild(player2);
    result.appendChild(resultImg);
    newMatche.appendChild(macthPlayers);
    newMatche.appendChild(result);
    matchesDiv.appendChild(newMatche);
  }

  date.innerText = userInfo.date;
  user.innerText = userInfo.username;
  firstname.innerText = userInfo.firstname;
  gamesPlayed.innerText = matchesData.length;
  gamesWon.innerText = wins.length;
  winrate.innerText = `${win_rate}%`;
  firstnameInput.value = userInfo.firstname;
  lastnameInput.value = userInfo.lastname;
  passwordInput.value = "***************";
}

laodProfileUi();
