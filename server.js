require("dotenv").config();

const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], methods: ["OPTIONS", "POST", "GET", "DELETE"],
}))

app.use(express.json())

app.post('/kakao/login', (req, res) => {
  const authorizationCode = req.body.authorizationCode;
  axios.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({ grant_type: "authorization_code", client_id: process.env.KAKAO_CLIENT_ID, redirect_uri: redirectURI, code: authorizationCode, }), {headers: {"Content-Type" : "application/x-www-form-urlencoded;charset=utf-8",}, })
  .then((response) => res.send(response.data.access_token));
});

const redirectURI = process.env.REDIRECT_URI;
app.get("/auth/kakao", (req, res) => {
  const url = "https://kauth.kakao.com/oauth/authorize" + `?client_id=${process.env.KAKAO_CLIENT_ID}` +`&redirect_uri=${encodeURIComponent(redirectURI)}` + `&response_type=code`;
  res.redirect(url);
});

app.post("/kakao/userinfo", (req, res) => {
  const { kakaoAccessToken } = req.body;
  axios.get("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${kakaoAccessToken}`, "Content-type": "application/x-www-form-urlencoded;charset=utf-8", },
    })
    .then((response) => res.json(response.data.properties));
});

app.delete("/kakao/logout", (req, res) => {
  const { kakaoAccessToken } = req.body;
  axios.post("https://kapi.kakao.com/v1/user/logout", {}, { headers: { Authorization: `Bearer ${kakaoAccessToken}` }, })
  .then((response) => res.send("로그아웃 성공"));
});

app.get("/auth/naver", (req, res) => {
  const url = "https://nid.naver.com/oauth2.0/authorize" + `?client_id=${process.env.NAVER_CLIENT_ID}` + `&response_type=code` + `&redirect_uri=${encodeURIComponent(redirectURI)}` + `&state=naver`; 
  res.redirect(url);
});

app.post("/naver/login", (req, res) => {
  const authorizationCode = req.body.authorizationCode;
  const state = req.body.state;
  axios.post("https://nid.naver.com/oauth2.0/token", new URLSearchParams({ grant_type: "authorization_code", client_id: process.env.NAVER_CLIENT_ID, client_secret: process.env.NAVER_CLIENT_SECRET, code: authorizationCode, redirect_uri: redirectURI, state,
      }),
      { headers: { "Content-type": "application/x-www-form-urlencoded;charset=utf-8", }, }
    )
    .then((response) => res.send(response.data.access_token));
});

app.post("/naver/userinfo", (req, res) => {
  const { naverAccessToken } = req.body;
  axios.get("https://openapi.naver.com/v1/nid/me", { headers: { Authorization: `Bearer ${naverAccessToken}`, }, })
    .then((response) => res.json(response.data.response));
});

app.delete("/naver/logout", (req, res) => {
  const { naverAccessToken } = req.body;
  axios.post("https://nid.naver.com/oauth2.0/token", new URLSearchParams({ grant_type: "delete", client_id: process.env.NAVER_CLIENT_ID, client_secret: process.env.NAVER_CLIENT_SECRET, access_token: naverAccessToken, service_provider: "NAVER", })
    )
   .then((response) => res.send("로그아웃 성공"));
});

app.listen(3000, () => console.log('서버 열림!: http://localhost:3000'))
