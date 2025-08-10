const express = require("express");
const router = express.Router();
const svgCaptcha = require("svg-captcha");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// Mostrar formulario de login
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

// Procesar login (paso 1: captcha + credenciales)
router.post("/login", async (req, res) => {
  const { username, password, captcha } = req.body;

  // Validar captcha
  const captchaOk =
    captcha &&
    req.session.captcha &&
    captcha.toLowerCase() === req.session.captcha.toLowerCase();

  req.session.captcha = null;
  req.session.captchaSvg = null;

  if (!captchaOk) {
    const newCaptcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: "#ccf2ff"
    });
    req.session.captcha = newCaptcha.text;
    req.session.captchaSvg = newCaptcha.data;
    return res.render("login", {
      error: "Captcha incorrecto. Inténtalo de nuevo.",
      captchaSvg: newCaptcha.data,
    });
  }

  // Validar credenciales (ejemplo fijo)
  if (username === "admin" && password === "123456") {
    // Si ya tiene secret guardado en sesión, no volver a generar QR
    if (!req.session.twoFactorSecret) {
      const secret = speakeasy.generateSecret({ name: "MiAppSegura" });
      req.session.twoFactorSecret = secret.base32;

      // Generar QR solo la primera vez
      const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      return res.render("2fa", {
        qrCode: qrDataUrl,
        error: null,
      });
    }

    // Si ya tiene secret, solo pedir el código
    return res.render("2fa", {
      qrCode: null,
      error: null,
    });

  } else {
    const newCaptcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: "#ccf2ff"
    });
    req.session.captcha = newCaptcha.text;
    req.session.captchaSvg = newCaptcha.data;
    return res.render("login", {
      error: "Usuario o contraseña incorrectos.",
      captchaSvg: newCaptcha.data,
    });
  }
});

// Verificar código 2FA (paso 2)
router.post("/verify-2fa", (req, res) => {
  const { token } = req.body;
  const verified = speakeasy.totp.verify({
    secret: req.session.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    req.session.authenticated = true;
    return res.render("confirmacion");
  } else {
    return res.render("2fa", {
      qrCode: null,
      error: "Código inválido, inténtalo de nuevo.",
    });
  }
});

module.exports = router;
