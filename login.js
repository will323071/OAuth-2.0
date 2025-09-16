const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const userImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let currentOAuthService = "";
let kakaoAccessToken = "";
let naverAccessToken = "";

function renderUserInfo(imgURL, name) {
  userImage.src = imgURL;
  userName.textContent = name;
}

kakaoLoginButton.onclick = () => {
  location.href = "http://localhost:3000/auth/kakao";
};

naverLoginButton.onclick = () => {
  location.href = "http://localhost:3000/auth/naver";
};

window.onload = () => {
  const url = new URL(location.href);
  const authorizationCode = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!authorizationCode) return;

  else if (state) {
    axios.post("http://localhost:3000/naver/login", {authorizationCode, state: state,})
      .then((res) => {
        naverAccessToken = res.data;
        return axios.post("http://localhost:3000/naver/userinfo", {naverAccessToken,});
      })
      .then((res) => { 
        renderUserInfo(res.data.profile_image, res.data.name); 
        currentOAuthService = "naver";
      });
  } else {
    axios.post("http://localhost:3000/kakao/login", { authorizationCode })
      .then((res) => {
        kakaoAccessToken = res.data;
        return axios.post("http://localhost:3000/kakao/userinfo", {
          kakaoAccessToken,
        });
      })
      .then((res) => {
        renderUserInfo(res.data.profile_image, res.data.nickname);
        currentOAuthService = "kakao";
      });
  }
};

logoutButton.onclick = () => {
  if (currentOAuthService === "kakao") {
    axios.delete("http://localhost:3000/kakao/logout", {
        data: { kakaoAccessToken },
      })
      .then((res) => {
        {
          console.log(res.data);
          renderUserInfo("", "");
        }
      });
  } else if (currentOAuthService === "naver") {
    axios.delete("http://localhost:3000/naver/logout", {
        data: { naverAccessToken },
      })
      .then((res) => {
        {
          console.log(res.data);
          renderUserInfo("", "");
        }
      });
    }}
