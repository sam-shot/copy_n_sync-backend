import Router from "express";
import *  as controlller from '../controllers/app_controller.js'
const router = Router();



router.route('/auth/login').get(controlller.login);
router.route('/auth/register').post(controlller.register);



export default router;