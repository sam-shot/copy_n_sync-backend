import nodemailer from "nodemailer";

export async function sendMail({ email, from, subject, text, html }) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'copynsync@gmail.com',
        pass: 'twqupfpvpsufwypu'
    }
});

  let message = {
    from: from,
    to: email,
    subject: subject,
    text: text,
    html: `<div>
    <div><div style="max-width:686px;padding:0 15px 30px 15px;margin:auto;background:#ffffff;margin-top:60px">
      <div style="background:#ffffff;padding-top:44px;padding-left:30px">
        <img src="https://lh3.googleusercontent.com/xaePLAnCDxkydWIX9WDbnIf8kuZ5ypjb5BTw3ByBjmXEKU50bFgjkMLGUltzjAExofkaF9t_SVeW72bbD7XZAEzlsfYpyYnqQvsuXp7U" style="width:100px" alt="logo" class="CToWUd a6T" data-bit="iit" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 137px; top: 81.9844px;"><div id=":1pm" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc2NzY2Nzk5MDI0MjMwMTA2NyIsbnVsbCxbXV0." data-tooltip-class="a1V" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
      </div>
      
      <div style="padding:5%">
        <div style="font-size:18px;font-weight:normal;line-height:21px">
          Hello Samuel,
        </div>

        <div style="font-size:15px;font-weight:normal;line-height:21px;margin-top:20px">
        You recently requested to change your password, Copy this verification code to the app, it expires in 5 minutes!


        </div>

        <div style="color:#fff;font-size:25px;width:100px;height:50px;background:#001E2B;border-radius:6px;outline:none;border:none; margin: 1.2rem; padding-left:.3rem; padding-top:.2rem">
            ${text}
          </div>
        <div style="font-size:15px;font-weight:normal;line-height:21px;color:#586069;margin-top:43px">
          <div style="margin-bottom:20px">Thank You,</div>
          </div></div><div class="adL">
      </div></div><div class="adL">
    </div></div></div><div class="adL">
  </div></div>`,
  };
 transporter
    .sendMail(message)
    .then((info) => {
      console.log(info);
      return true;
    })
    .catch((e) => {
        
      console.log(e);
      return false;
    });
}
