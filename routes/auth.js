const express = require("express");
const router = express.Router();
const svgCaptcha = require("svg-captcha");

// Mostrar el formulario de login
router.get("/", (req, res) => {
  res.render("login", {
    error: null,
    captchaSvg: req.session.captchaSvg || null,
  });
});

// Endpoint que genera el captcha
router.get("/captcha", (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
    background: "#ccf2ff",
  });
  req.session.captcha = captcha.text;
  req.session.captchaSvg = captcha.data;
  res.type("svg");
  res.status(200).send(captcha.data);
});

// Procesar el login
router.post("/login", (req, res) => {
  const { username, password, captcha } = req.body;
  const captchaOk =
    captcha &&
    req.session.captcha &&
    captcha.toLowerCase() === req.session.captcha.toLowerCase();
  // Limpia el captcha para que no pueda reutilizarse
  req.session.captcha = null;
  req.session.captchaSvg = null;
  if (!captchaOk) {
    // Genera un nuevo captcha para mostrar en el formulario
    const newCaptcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: "#ccf2ff",
    });
    req.session.captcha = newCaptcha.text;
    req.session.captchaSvg = newCaptcha.data;
    return res.render("login", {
      error: "Captcha incorrecto. Inténtalo de nuevo.",
      captchaSvg: newCaptcha.data,
    });
  }
  // Lógica de autenticación real (aquí ejemplo fijo)
  if (username === "admin" && password === "123456") {
    req.session.authenticated = true;
    return res.render("confirmacion");
  } else {
    // Genera un nuevo captcha para mostrar en el formulario
    const newCaptcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: "#ccf2ff",
    });
    req.session.captcha = newCaptcha.text;
    req.session.captchaSvg = newCaptcha.data;
    return res.render("login", {
      error: "Usuario o contraseña incorrectos.",
      captchaSvg: newCaptcha.data,
    });
  }
});
module.exports = router;