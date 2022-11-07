const navBtn = document.querySelector(".fa-bars");
const logo = document.querySelector(".logo");
const navContent = document.querySelector(".navContent");
const navUl = document.querySelector(".navUl");
const aboutbtn = document.querySelector(".about");
const seachPlayer = document.querySelector(".seachPlayer");
const signUpBtn = document.querySelector(".signUp");
const signUpBtnHiden = document.querySelector(".signUp3");
const signUpBtn2 = document.querySelector(".signUp2");
const bot = document.querySelector(".bot");
const pvp = document.querySelector(".pvp");
const currentUrl = location.origin;

function fetchUsersCount() {
  const usersCount = document.querySelector(".usersCount");
  fetch(currentUrl + "/usersCount")
    .then((response) => response.json())
    .then((data) => {
      if (usersCount != null) {
        usersCount.innerText = data.users;
      }
    });
}

fetchUsersCount();

navBtn.addEventListener("click", () => {
  navContent.classList.toggle("hide");
});

addEventListener("click", (e) => {
  if (
    e.target != navContent &&
    e.target != aboutbtn &&
    e.target != seachPlayer &&
    e.target != signUpBtn &&
    e.target != navBtn &&
    e.target != navUl
  ) {
    navContent.classList.add("hide");
  }

  if (
    e.target === signUpBtn ||
    e.target === signUpBtn2 ||
    e.target === signUpBtnHiden
  ) {
    location.href = "signup";
  }

  if (e.target === logo) {
    location.href = "/";
  }
});
