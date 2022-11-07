const avatarName = document.querySelector(".name");
const avataDiv = document.querySelector(".userAvatar");
const logout = document.querySelector(".logOutDiv");

const token = localStorage.getItem("ACCESS_TOKEN");
const verifyToken = () => {
  return fetch(currentUrl + "/getuser", {
    method: "POST",
    headers: {
      authorization: token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 403 || response.status === 404) {
        throw new Error();
      }
      return response.json();
    })
    .catch((err) => (location.href = "/home"));
};

const LoadUi = verifyToken().then((userInfos) => {
  userID = userInfos.userID;
  username = userInfos.username;
  avatarName.innerText = username;
});

avataDiv.addEventListener("click", () => {
  location.href = "/profile";
});

logout.addEventListener("click", () => {
  localStorage.clear();
  location.href = "/home"
})
