const userName = document.querySelector(".userName");
const Password = document.querySelector(".Password");
const loginPopUp = document.querySelector(".loginPopUp");
const loginDiv = document.querySelector(".loginDiv");
const loginBtn = document.querySelector(".login");
const logingBtn2 = document.querySelector(".logingBtn");
const loginBtnHiden = document.querySelector(".login2");
const usernameErrorLogin = document.querySelector(".usernameErrorLogin");
const passwordErrorLogin = document.querySelector(".passwordErrorLogin");

addEventListener("mousedown", (e) => {
  if (
    e.target === loginBtn ||
    e.target === userName ||
    e.target === Password ||
    e.target === loginDiv ||
    e.target === logingBtn2 ||
    e.target === loginBtnHiden ||
    e.target === pvp
  ) {
    loginPopUp.classList.remove("hide");
  } else {
    loginPopUp.classList.add("hide");
  }
});

logingBtn2.addEventListener("click", () => {
  const username = userName.value;
  const password = Password.value;

  usernameErrorLogin.innerText = "";
  passwordErrorLogin.innerText = "";

  if (username.length === 0) {
    usernameErrorLogin.innerText = "🆘please enter a valide username";
    return;
  }

  if (password.length === 0) {
    passwordErrorLogin.innerText = "🆘please enter a valide password";
    return;
  }

  fetch(currentUrl + "/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((response) => {
      if (response.status === 404) {
        usernameErrorLogin.innerText = "🆘Username not found";
        throw new Error("user not found");
      } else if (response.status === 403) {
        passwordErrorLogin.innerText = "🆘Wrong password";
        throw new Error("wrong password");
      } else if (response.status === 500) {
        throw new Error("internal server error");
      }
      return response.json();
    })
    .then((token) => {
      localStorage.setItem("ACCESS_TOKEN", token);
      location.href = "/";
    })
    .catch((err) => console.log(err));
});
