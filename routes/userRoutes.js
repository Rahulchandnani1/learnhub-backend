const express=require("express");

const router=express.Router();

const userController=require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    userController.getUsers
);

router.get("/:id", authMiddleware, userController.getUserById);

router.put("/:id", authMiddleware, userController.updateUser);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    userController.deleteUser
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("Admin","User"),
    userController.profile
);
module.exports=router;