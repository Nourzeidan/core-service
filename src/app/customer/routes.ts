import {Router} from "express";
import { AddressController } from "./addresses/controller/address.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js"

const addressRouter = Router();
const addressController = container.resolve<AddressController>(TOKENS.AddressController);

addressRouter.get("/addresses", authenticate, addressController.findAllAddresses);
addressRouter.post("/addresses", authenticate, addressController.createAddress);
addressRouter.patch("/addresses/:id", authenticate, addressController.updateAddress);
addressRouter.delete("/addresses/:id", authenticate, addressController.deleteAddress);

export {addressRouter};