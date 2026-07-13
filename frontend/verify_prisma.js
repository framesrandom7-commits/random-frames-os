"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
console.log('shoot:', !!prisma.shoot);
console.log('client:', !!prisma.client);
console.log('project:', !!prisma.project);
process.exit(0);
