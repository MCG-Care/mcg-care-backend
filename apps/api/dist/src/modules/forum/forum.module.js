"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumModule = void 0;
const common_1 = require("@nestjs/common");
const forum_posts_service_1 = require("./forum-posts.service");
const forum_comments_service_1 = require("./forum-comments.service");
const forum_posts_controller_1 = require("./forum-posts.controller");
const forum_comments_controller_1 = require("./forum-comments.controller");
const database_module_1 = require("../../config/database.module");
const supabase_service_1 = require("../../config/supabase.service");
let ForumModule = class ForumModule {
};
exports.ForumModule = ForumModule;
exports.ForumModule = ForumModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [forum_posts_controller_1.ForumPostsController, forum_comments_controller_1.ForumCommentsController],
        providers: [forum_posts_service_1.ForumPostsService, forum_comments_service_1.ForumCommentsService, supabase_service_1.SupabaseService],
        exports: [forum_posts_service_1.ForumPostsService, forum_comments_service_1.ForumCommentsService],
    })
], ForumModule);
//# sourceMappingURL=forum.module.js.map