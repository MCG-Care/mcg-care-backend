"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../users/user.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersService, jwt) {
        this.usersService = usersService;
        this.jwt = jwt;
    }
    async register(data) {
        try {
            const hashed = await bcrypt.hash(data.password, 10);
            const user = await this.usersService.createUser({
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                role: data.role,
                password: hashed,
            });
            const address = await this.usersService.createAddress(user.id, data.address);
            await this.usersService.setPrimaryAddress(user.id, address.id);
            const userWithAddress = await this.usersService.getUserById(user.id);
            return this.generateToken(userWithAddress);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async login(email, password) {
        try {
            const user = await this.usersService.getUserByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            if (!user.password) {
                console.error('User found but password is missing:', email);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const result = this.generateToken(user);
            return result;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            console.error('Login error:', err);
            console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
            throw new common_1.InternalServerErrorException('An error occurred during login. Please try again.');
        }
    }
    generateToken(user) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            const toISOString = (date) => {
                if (!date)
                    return null;
                try {
                    const dateObj = date instanceof Date ? date : new Date(date);
                    if (isNaN(dateObj.getTime()))
                        return null;
                    return dateObj.toISOString();
                }
                catch (_a) {
                    return null;
                }
            };
            const sanitizedUser = {
                id: userWithoutPassword.id,
                name: userWithoutPassword.name,
                email: userWithoutPassword.email,
                phoneNo: userWithoutPassword.phoneNo,
                role: userWithoutPassword.role,
                primaryAddressId: (_a = userWithoutPassword.primaryAddressId) !== null && _a !== void 0 ? _a : null,
                createdAt: toISOString(userWithoutPassword.createdAt),
                updatedAt: toISOString(userWithoutPassword.updatedAt),
            };
            if (userWithoutPassword.address && typeof userWithoutPassword.address === 'object') {
                sanitizedUser.address = {
                    id: (_b = userWithoutPassword.address.id) !== null && _b !== void 0 ? _b : null,
                    name: (_c = userWithoutPassword.address.name) !== null && _c !== void 0 ? _c : null,
                    address: (_d = userWithoutPassword.address.address) !== null && _d !== void 0 ? _d : null,
                    township: (_e = userWithoutPassword.address.township) !== null && _e !== void 0 ? _e : null,
                    city: (_f = userWithoutPassword.address.city) !== null && _f !== void 0 ? _f : null,
                    district: (_g = userWithoutPassword.address.district) !== null && _g !== void 0 ? _g : null,
                    createdAt: toISOString(userWithoutPassword.address.createdAt),
                    updatedAt: toISOString(userWithoutPassword.address.updatedAt),
                };
            }
            else {
                sanitizedUser.address = null;
            }
            return {
                access_token: this.jwt.sign({
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                }),
                user: sanitizedUser,
            };
        }
        catch (error) {
            console.error('Error in generateToken:', error);
            throw new common_1.InternalServerErrorException('Failed to generate authentication token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map