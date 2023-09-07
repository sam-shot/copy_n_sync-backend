import Router from "express";
import *  as controlller from '../controllers/app_controller.js'
const router = Router();



router.route('/auth/login').post(controlller.login);
router.route('/auth/register').post(controlller.register);
router.route('/auth/forgotpassword').post(controlller.forgotPassword);
router.route('/auth/forgotpassword/verify').post(controlller.verifyToken);
router.route('/auth/forgotpassword/updatePassword').post(controlller.updatePassword);


router.route('/user/updateDeviceId').post(controlller.saveFirebaseId);
router.route('/user/removeDevice').post(controlller.removeDevice);

router.route('/send/text').post(controlller.sendText);
router.route('/send/text/history').post(controlller.sendHistory);



router.route('/get/text/latest').get(controlller.getLatestText);
router.route('/get/texts').get(controlller.getTexts);
router.route('/get/userdetail').get(controlller.getUserDetail);




export default router;