import Router from "express";
import *  as controlller from '../controllers/app_controller.js'
const router = Router();



router.route('/auth/login').post(controlller.login);
router.route('/auth/register').post(controlller.register);
router.route('/auth/forgotpassword').post(controlller.forgotPassword);
router.route('/auth/forgotpassword/verify').post(controlller.verifyToken);
router.route('/auth/forgotpassword/updatePassword').post(controlller.updatePassword);

router.route('/send/text').post(controlller.sendText);



router.route('/get/text/latest').get(controlller.getLatestText);
router.route('/get/texts').get(controlller.getTexts);
router.route('/get/userdetail').get(controlller.getUserDetail);




export default router;