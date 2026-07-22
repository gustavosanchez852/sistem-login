// server/controllers/authController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Función para validar la contraseña
const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// REGISTRO
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "La contraseña no cumple con los requisitos." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, password_hash]
    );
    res.status(201).json({ message: "Usuario registrado con éxito." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { credential, password } = req.body; // 'credential' puede ser username o email

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [credential]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    //const validPassword = true;

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    //const username = user.rows[0].username;

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
    //res.status(201).json({username});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// OLVIDÉ MI CONTRASEÑA
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      // No revelar si el email existe o no por seguridad
      return res
        .status(200)
        .json({
          message:
            "Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.",
        });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000; // 1 hora

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [token, expires, email]
    );

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Usa una contraseña de aplicación si tienes 2FA
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Restablecimiento de Contraseña",
      text: `Para restablecer tu contraseña, por favor haz clic en el siguiente enlace: \n\n http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error enviando email:", err);
        return res.status(500).send("Error enviando el correo.");
      }
      res.status(200).json({ message: "Correo de restablecimiento enviado." });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// RESTABLECER CONTRASEÑA
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "La contraseña no cumple con los requisitos." });
  }

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > $2",
      [token, Date.now()]
    );

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "El token es inválido o ha expirado." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [password_hash, user.rows[0].id]
    );

    res.status(200).json({ message: "Contraseña restablecida con éxito." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
