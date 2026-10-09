
export const TOKENS = {
    // service
    AuthService: Symbol.for("AuthService"),
    UserService: Symbol.for("UserService"),
    RestaurantService: Symbol.for("RestaurantService"),
    BranchService: Symbol.for("BranchService"),
    MemberService: Symbol.for("MemberService"),
    ProductService: Symbol.for("ProductService"),
    AddressService: Symbol.for("AddressService"),
    PermissionCacheService: Symbol.for("PermissionCacheService"),

    // controllers

    AuthController: Symbol.for("AuthController"),
    UserController: Symbol.for("UserController"),
    RestaurantController: Symbol.for("RestaurantController"),
    BranchController: Symbol.for("BranchController"),
    MemberController: Symbol.for("MemberController"),
    ProductController: Symbol.for("ProductController"),
    AddressController: Symbol.for("AddressController"),

    // Lib/info/
    Logger: Symbol.for("Logger"),
    CacheProvider: Symbol.for("CacheProvider"),
    // Lib/email/
    EmailProvider: Symbol.for("EmailProvider"),

}