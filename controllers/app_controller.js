import bcrypt from "bcrypt";
import text_model from "../model/text_model.js";
import token_model from "../model/token_model.js";
import user_model from "../model/user_model.js";
import * as code_generator from "../utils/code_generator.js";
import { sendMail } from "../utils/mailer.js";
import axios from 'axios';

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
              id: user._id,
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
  const { name, email, password, username, firebaseId } = req.body;

  if (!name) return res.status(403).send({ message: "Please input a name" });
  if (!email) return res.status(403).send({ message: "Please input an email" });
  if (!password)
    return res.status(403).send({ message: "Please input a password" });
  if (!username)
    return res.status(403).send({ message: "Please input a username" });
  if (!firebaseId)
    return res.status(403).send({ message: "Please input a device id" });

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
        devices: [firebaseId],
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

export async function forgotPassword(req, res) {
  const { email } = req.body;

  user_model
    .findOne({ email })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({
          message: "User does not exist",
          status: "404",
        });
      } else {
        await token_model.deleteMany({ user: user._id });

        const code = code_generator.generateCode(5);
        const verify_token = new token_model({
          token: code,
          user: user._id,
        });

        await verify_token.save();

        sendMail({
          from: "Copy n Sync",
          email: email,
          subject: "Forgot Password",
          text: code,
          html: "html",
        });

        return res.status(202).send({
          message:
            "A verification Code has been sent to your email, code expires in 5 minutes ",
          status: "202",
        });
      }
    })
    .catch((error) => {
      return res.status(500).send({ message: "Server Error", status: "500" });
    });
}

export async function verifyToken(req, res) {
  const { email, code } = req.body;

  user_model
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User does not exist",
          status: "404",
        });
      } else {
        token_model
          .findOne({
            user: user._id,
            token: code,
          })
          .then(async (userToken) => {
            if (userToken) {
              await token_model.findByIdAndDelete(userToken._id);
              const hasExpired = code_generator.validateCode(
                userToken.createdAt,
                5
              );
              if (hasExpired) {
                const token = code_generator.generateToken(user._id);
                return res.status(200).send({
                  message: "Verified",
                  code: token,
                  status: "200",
                });
              } else {
                return res.status(400).send({
                  message: "Code Expired",
                  status: "400",
                });
              }
            } else {
              return res.status(404).send({
                message: "Invalid Verification Code",
                status: "404",
              });
            }
          })
          .catch((error) => {
            return res.status(503).send({
              message: `An Error ${error} Occured`,
              status: "503",
            });
          });
      }
    })
    .catch((error) => {
      return res.status(500).send({ message: "Server Error", status: "500" });
    });
}

export async function updatePassword(req, res) {
  const { token, password } = req.body;

  // const id =
  const tokenResponse = code_generator.validateToken(token);
  if (tokenResponse.exp) {
    return res.status(400).send({
      message: "Token Expired, Please restart the process",
      status: "400",
    });
  } else {
    bcrypt
      .hash(password, 10)
      .then((hashPass) => {
        user_model
          .findByIdAndUpdate(tokenResponse.id, { password: hashPass })
          .then((newDetails) => {
            if (!newDetails) {
              return res.status(404).send({
                message: "A Wrong Token Provided",
                status: "404",
              });
            } else {
              return res.status(200).send({
                message: "Password Updated successfully",
                status: "200",
              });
            }
          })
          .catch((e) => {
            return res
              .status(503)
              .send({ message: "An Error Occured", status: "503" });
          });
      })
      .catch((error) => {
        res.status(403).send({
          message: "Unable to Hash Password",
          status: "403",
        });
      });
  }
}

export async function saveFirebaseId(req, res) {
  const { userId, firebaseId, deviceName} = req.body;


    user_model
      .findByIdAndUpdate(
        userId,
        { $push: { devices: {
          deviceName: deviceName,
          deviceId: firebaseId
        } } },
        { new: true }
      )
      .then((updatedUser) => {
        return res.status(200).send({
          message: "Devices registered successfully",
          devices: updatedUser.devices,
          status: "200",
        });
      })
      .catch((err) => {
        return res
          .status(404)
          .send({ message: "User not Found!", status: "404" });
      });


      // await user_model
      // .findOneAndUpdate(
      //   { _id: userId, devices: previousFirebaseId },
      //   { $set: { "devices.$[oldId]": firebaseId } },
      //   { arrayFilters: [{ oldId: previousFirebaseId }] },
      //   { new: true }
      // )
      // .then((updatedUser) => {
      //   return res.status(200).send({
      //     message: "Devices registered successfully",
      //     devices: updatedUser.devices,
      //     status: "200",
      //   })
      // })
      // .catch((err) => {
      //   return res
      //     .status(404)
      //     .send({ message: "Device/ User not Found!", status: "404" });
      // });
  }   
  
    
export async function sendText(req, res) {
  const { text, userId, firebaseId } = req.body;

  const newText = new text_model({
    text: text,
    user: userId,
  });
  user_model
    .findById(userId)
    .then(async (userExists) => {
      if (!userExists) {
        return res.status(404).send({
          message: "User does not exist",
          status: "404", 
        });
      } else {
        const allDevices = userExists.devices.map(e=>e.deviceId);
        const devices = allDevices.filter(item => item !== firebaseId);
        console.log(devices);
        const data = {
          data: {
            message: text,
          },
          registration_ids: devices,
        };
        const config = {
          headers: {
            "Content-Type": "application/json", // Example header
            "Authorization":
              "key=AAAAvpWeRDI:APA91bGE6UO3t4FjRzyW1WC2IiYcI8IwROXifW2TYyRjtdMUn8k48qDCpiv2wHFaRSp5v_0xPCA4nTTfxtP_oQGPAe8OUKKI-7V7AaCpRI50RLNYUDQM1rlpsvynT6xsfHer4VFEmBWQ", // Example header
          },
        };
        let responseData = "e";
        await axios
          .post("https://fcm.googleapis.com/fcm/send", data, config)
          .then((response) => {
            // Handle the response from the API
            responseData = response.data;
          })
          .catch((error) => {
            // Handle the error from the API
            console.error("Error:", error);
            
            responseData = error.toLocaleString;
          });

        newText
          .save()
          .then((result) => {
            user_model
              .findByIdAndUpdate(
                userId,
                { $push: { texts: result._id } },
                { new: true }
              )
              .then((updatedUser) => {
                return res.status(200).send({
                  message: "Text Sent successfully",
                  data: responseData,
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
        data: responseData,
        status: "503",
      });
    });
}

export async function getLatestText(req, res) {
  const { id } = req.query;

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
              message: "No Texts yet!",
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
      message: "Server Error",
      status: "500",
    });
  }
}

export async function getTexts(req, res) {
  const { id } = req.query;

  var textList;
  await user_model
    .findById(id)
    .then(async (result) => {
      if (!result) {
        textList = "nouser";
        return res.status(404).send({
          message: "Cant Find User",
          status: "404",
        });
      }
      const promises = result.texts.map((textId) => {
        return text_model.findById(textId).then((response) => {
          return {
            text: response.text,
            time: response.createdAt.toLocaleString(undefined, {
              weekday: "short",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
        });
      });
      textList = await Promise.all(promises);
    })
    .catch((err) => {
      res.status(503).send({
        message: "Invalid id number",
        status: "500",
      });
      textList = null;
    });

  if (Array.isArray(textList) && textList.length === 0) {
    return res.status(200).send({
      message: "No texts yet",
      data: textList,
      status: "200",
    });
  } else if (textList === null) {
  } else if (textList === "nouser") {
  } else {
    return res.status(202).send({
      message: "Texts Retrieved Successfully",
      data: textList,
      status: "202",
    });
  }
}

export async function getUserDetail(req, res) {
  const { id } = req.query;

  user_model
    .findById(id)
    .then((userDetails) => {
      if (!userDetails)
        return res.status(404).send({
          message: "Cant Find User",
          status: "404",
        });

      return res.status(202).send({
        message: "User details Retrieved Successfully",
        data: {
          email: userDetails.email,
          username: userDetails.username,
          name: userDetails.name,
        },
        status: "202",
      });
    })
    .catch((err) => {
      res.status(404).send({
        message: "User does not exist",
        status: "404",
      });
    });
}
