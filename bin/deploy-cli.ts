#!/usr/bin/env node

import * as pkg from "../package.json"
import fs from "fs"
import { program } from "commander"
import { resolve, join } from "path"
import { deploy } from '../index'

program.version(pkg.version, "-v, -V, --version")

program
  .command("init")
  .description("Initialize")
  .action(() => {
    fs.copyFileSync(
      resolve(__dirname, "../template/.env.template"),
      join(process.cwd(), ".env.deploy")
    )
  })

program
  .command("start", { isDefault: true })
  .description("Start deployment")
  .action(async () => {
    await deploy()
  })

program.parse()

