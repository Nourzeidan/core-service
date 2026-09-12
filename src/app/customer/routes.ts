import {Router} from "express";
import { addressController } from "./addresses/controller/address.controller.js";
import { authenticate } from "../../common/auth/guard.js";

const addressRouter = Router();
addressRouter.get("/addresses", authenticate, addressController.findAllAddresses);
addressRouter.post("/addresses", authenticate, addressController.createAddress);
addressRouter.patch("/addresses/:id", authenticate, addressController.updateAddress);
addressRouter.delete("/addresses/:id", authenticate, addressController.deleteAddress);

export {addressRouter};