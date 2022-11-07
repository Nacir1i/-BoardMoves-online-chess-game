const Url = location.origin;
const token = localStorage.getItem("ACCESS_TOKEN");
const verifyToken = () => {
  return fetch(Url + "/getuser", {
    method: "POST",
    headers: {
      authorization: token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return (location.href = "/");
      }
      throw new Error("no token was found");
    })
    .catch((err) => console.log(err));
};

verifyToken();
