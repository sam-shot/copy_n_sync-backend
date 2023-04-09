import user_model from "../model/user_model.js";
import text_model from "../model/text_model.js";
import bcrypt from "bcrypt";
import { json } from "express";

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    user_model
      .findOne({ email })
      .then((user) => {
        bcrypt.compare(password, user.password).then((passwordCheck) => {
          if (!passwordCheck)
            return res.status(400).send({
              message: "Password do not match",
              status: "400",
            });

          return res.status(200).send({
            message: "Login Successfull",
            data: {
              email: user.email,
              username: user.username,
              name: user.name,
            },
            status: "200",
          });
        });
      })
      .catch((error) => {
        return res.status(404).send({
          message: "User not found!",
          status: "404",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Network Error",
      status: "500",
    });
  }
}

export async function register(req, res) {
  const { name, email, password, username } = req.body;

  if (!name) return res.status(403).send({ message: "Please input a name" });
  if (!email) return res.status(403).send({ message: "Please input an email" });
  if (!password)
    return res.status(403).send({ message: "Please input a password" });
  if (!username)
    return res.status(403).send({ message: "Please input a username" });

  const existingUser = await user_model.find({
    $or: [{ email }, { username }],
  });
  if (existingUser.length > 0) {
    return res
      .status(409)
      .json({ message: "User already exists", status: "409" });
  }
  bcrypt
    .hash(password, 10)
    .then((hashPass) => {
      const user = new user_model({
        name,
        email,
        password: hashPass,
        username,
      });
      user
        .save()
        .then((result) => {
          res.status(200).send({
            message: "User Created Successfully",
            data: {
              name: name,
              email: email,
              username: username,
              password: hashPass,
            },
            status: "200",
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: error,
            status: "500",
          });
        });
    })
    .catch((error) => {
      res.status(403).send({
        message: "Unable to Hash Password",
        status: "403",
      });
    });
}

export async function sendText(req, res) {
  const { text, id } = req.body;

  const newText = new text_model({
    text: text,
    user: id,
  });
  user_model
    .findById(id)
    .then((userExists) => {
      if (!userExists) {
        return res.status(404).send({
            message: "User does not exist",
            status: "404"
          })
      } else {
        newText
          .save()
          .then((result) => {
            user_model
              .findByIdAndUpdate(
                id,
                { $push: { texts: result._id } },
                { new: true }
              )
              .then((updatedUser) => {
                return res.status(200).send({
                  message: "Text Uploaded successfully",
                  user: updatedUser._id,
                  status: "200",
                });
              })
              .catch((err) => {
                return res
                  .status(404)
                  .send({ message: "User not Found!", status: "404" });
              });
          })
          .catch((error) => {
            return res
              .status(503)
              .send({ message: "An Error Occured", status: "503" });
          });
      }
    })
    .catch((err) => {
      return res.status(503).send({
        message: "Id number in Incorrect format ",
        status: "503"
      })
    });
}

export async function getLatestText(req, res) {
  const { id } = req.body;

  try {
    user_model
      .findById(id)
      .then((result) => {
        const latestTextId = result.texts[result.texts.length - 1];
        text_model
          .findById(latestTextId)
          .then((response) => {
            const latestText = response.text;
            return res.status(200).send({
              message: "Text Retrieved Sucessfully",
              data: {
                text: latestText,
              },
              status: "200",
            });
          })
          .catch((error) => {
            return res.status(404).send({
              message: error,
              status: "404",
            });
          });
      })
      .catch((error) => {
        return res.status(404).send({
          message: "Cant Find User",
          status: "404",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: error,
      status: "500",
    });
  }
}

export async function getTexts(req, res) {
  const { id } = req.body;
  user_model.findById(id).then((result) => {
    if (!result)
      return res.status(404).send({
        message: "Cant Find User",
        status: "404",
      });
    var i = 0;
    var textList = [];
    for (i; i < result.texts.length; i++) {
      text_model.findById(result.texts[i]).then((response) => {
        const latestText = response.text;
        console.log(latestText);
        textList.push(latestText)
      });
    }
    console.log(textList)
    // console.log(result);
  });
}
