import crypto from "crypto";
import jwt from "jsonwebtoken";

export function generateCode(length) {
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  const code = buffer.toString("hex").slice(0, length);
  return parseInt(code, 16).toString().padStart(length, "0");
}

export function validateCode(createdAt, expiryTimeInMinutes) {
  const currentDate = new Date();
  const expiryDate = new Date(
    createdAt.getTime() + expiryTimeInMinutes * 60000
  );

  if (currentDate <= expiryDate) {
    return true;
  } else {
    return false;
  }
}

export function generateToken(userId) {
  // Define the payload containing the user data
  const payload = {
    userId: userId,
  };

  // Generate the JWT token
  const token = jwt.sign(payload, "COPYNSYNCBYSAM", { expiresIn: 6000 });

  return token;
}

export function validateToken(token) {
  try {
    const payload = jwt.verify(token, "COPYNSYNCBYSAM");
    const res = {
        "id": payload.userId,
        "exp" : false
    }
    return res;
  } catch (error) {
    const res = {
        "id": "",
        "exp" : true
    }
    return res;
  }
}
