import { Injectable, OnModuleInit, INestApplication } from "@nestjs/common";

// Load PrismaClient at runtime to avoid TS errors when client isn't generated yet.
let _PrismaClient: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _PrismaClient = require("@prisma/client").PrismaClient;
} catch (e) {
  _PrismaClient = undefined;
}

@Injectable()
export class PrismaService implements OnModuleInit {
  private client: any;

  constructor() {
    if (_PrismaClient) this.client = new _PrismaClient();
  }

  // Provide direct accessors so existing code can call prisma.user.findUnique(...)
  get user() {
    return this.client?.user;
  }

  // expose $connect and $on to keep parity with PrismaClient
  async $connect() {
    if (!this.client || typeof this.client.$connect !== "function") return;
    return this.client.$connect();
  }

  $on(event: string, callback: (...args: any[]) => void) {
    if (!this.client || typeof this.client.$on !== "function") return;
    return this.client.$on(event, callback);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    if (this.client && typeof this.client.$on === "function") {
      try {
        this.client.$on("beforeExit", async () => {
          await app.close();
        });
        return;
      } catch (e) {
        // fall through to process listener
      }
    }

    // Fallback for Prisma 5 (library engine): listen on process beforeExit
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}
