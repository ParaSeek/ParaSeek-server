import express from 'express';
import verifyJWT, { authorizeRoles } from '../middlewares/auth.middleware.js';
import { deleteUser, getAllJobsAdmin, getAllUsersAdmin, updateUserRole } from '../controllers/admin.controller.js';


const adminRouter = express.Router();

adminRouter.get('/get-all-users',verifyJWT,authorizeRoles('admin'),getAllUsersAdmin);
adminRouter.get('/get-all-jobs',verifyJWT,authorizeRoles('admin'),getAllJobsAdmin);
adminRouter.patch('/update-role',verifyJWT,authorizeRoles('admin'),updateUserRole);
adminRouter.delete('/delete-user',verifyJWT,authorizeRoles('admin'),deleteUser);

export {
    adminRouter
}