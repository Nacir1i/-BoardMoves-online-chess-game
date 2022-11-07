const firstName = document.querySelector("#sFirstName");
const lastName = document.querySelector("#sLastName");
const signUpSubmit = document.querySelector(".submit");
const usernameInput = document.querySelector("#sUserName");
const passwordInput = document.querySelector("#sPassword");
const firstnameError = document.querySelector(".firstnameError");
const lastnameError = document.querySelector(".lastnameError");
const usernameError = document.querySelector(".usernameError");
const usernameSucc = document.querySelector(".usernameSucc");
const passwordError = document.querySelector(".passwordError");
const toggelPassword = document.querySelector(".fa-eye-slash");

toggelPassword.addEventListener("click", () => {
  if (toggelPassword.classList.contains("fa-eye-slash")) {
    toggelPassword.classList.remove("fa-eye-slash");
    toggelPassword.classList.add("fa-eye");

    passwordInput.type = "text";
  } else {
    toggelPassword.classList.add("fa-eye-slash");
    toggelPassword.classList.remove("fa-eye");

    passwordInput.type = "password";
  }
});

function verifyUserName(url, userName) {
  return fetch(url, {
    method: "post",
    body: JSON.stringify({
      userName: userName,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((result) => result.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.log(error));
}

signUpSubmit.addEventListener("click", () => {
  const newFirstName = firstName.value;
  const newLastName = lastName.value;
  const newUsername = usernameInput.value;
  const newPassword = passwordInput.value;

  firstnameError.innerText = "";
  lastnameError.innerText = "";
  usernameError.innerText = "";
  passwordError.innerText = "";
  usernameSucc.innerText = "";

  if (newFirstName.length > 15 || newFirstName.length < 5) {
    firstnameError.innerText = "🆘 First name is either too short or too long";
    return;
  }
  if (newLastName.length > 15 || newLastName.length < 5) {
    lastnameError.innerText = "🆘 Last name is either too short or too long";
    return;
  }
  if (newUsername.length > 15 || newUsername.length < 5) {
    usernameError.innerText = "🆘 username is either too short or too long";
    return;
  }
  if (newPassword.length > 20 || newPassword.length < 8) {
    passwordError.innerText = "🆘 password is either too short or too long";
    return;
  }

  fetch(currentUrl + "/insertUser", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: newFirstName,
      lastName: newLastName,
      username: newUsername,
      password: newPassword,
    }),
  })
    .then((response) => {
      if (response.status === 406) {
        usernameError.innerText = "🆘 username already used";
        throw new Error("username not available");
      } else if (response.status === 200) {
        console.log("username available");
        usernameSucc.innerText = "✅ username is available";
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("ACCESS_TOKEN", data);
      location.href = "/";
    })
    .catch((err) => console.log(err));
});
