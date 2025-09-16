const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const userImg = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let currentOAuthService = "";

const kakaoClientId = "5b9e6182763e6d020f610962a24b7d35";
const redirectUrl = "http://127.0.0.1:5500";
let kakaoAccessToken = "";

const naverClientId = "PU6m1cWdW6VCYuHIX8Am";
const naverClientSecret = "IGcTs02lcv";
const naverSecret = "it_is_me";
let naverAccessToken = "";

function renderUserInfo(imgUrl, name) {
  (userImg.src = imgUrl), (userName.textContent = name);
}

kakaoLoginButton.onclick = () => {
  location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectUrl}&response_type=code`;
};

naverLoginButton.onclick = () => {
  location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${naverClientId}&response_type=code&redirect_uri=${redirectUrl}&state=${naverSecret}`;
};

window.onload = () => {
  const url = new URL(location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get("code");
  const naverState = urlParams.get("state");

  if (authorizationCode) {
    if (naverState) {
      axios.post("http://localhost:3000/naver/login", { authorizationCode })
        .then((res) => {
          naverAccessToken = res.data;
          return axios.post("http://localhost:3000/naver/userinfo", {
              naverAccessToken,
            })
            .then((res) => {
              renderUserInfo(res.data.profile_image, res.data.name);
              currentOAuthService = "naver";
            });
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
  }
};

logoutButton.onclick = () => {
  if (currentOAuthService === "kakao") {
    axios.delete("http://localhost:3000/kakao/logout", {
        data: { kakaoAccessToken },
      })
      .then((res) => {
        console.log(res.data);
        renderUserInfo("", "");
      });
  } else if (currentOAuthService === "naver") {
    axios.delete("http://localhost:3000/naver/logout", {
        data: { naverAccessToken },
      })
      .then((res) => {
        console.log(res.data);
        renderUserInfo("", "");
      });
  }
};