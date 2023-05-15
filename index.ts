import dotenv from "dotenv"
import ora from "ora"
import chalk from "chalk"
import tar from "tar"
import { NodeSSH } from "node-ssh"
import { join } from "path/posix"
import { readdirSync } from "fs"

dotenv.config({ path: './.env.deploy' })

const config = {
  host: process.env.SSH_HOST,
  username: process.env.SSH_USER,
  port: Number(process.env.SSH_PORT),
  password: process.env.SSH_PASSWORD,
}

const ssh = new NodeSSH()

export async function deploy() {
  try {
    const dist = process.env.DIST as string
    const files = readdirSync(dist)
    const filename = 'dist.tgz'
    const RemoteDir = process.env.REMOTE_UPLOAD_DIR as string
    const publicDir = join(RemoteDir, '..')
    const spinner = ora().start()
    // 压缩文件
    spinner.text = `${chalk.green('Compressing file...')}`
    await tar.create({
      cwd: dist,
      file: filename
    }, files)
    spinner.succeed(chalk.green('File compressed successfully!'))

    // ssh连接服务器
    spinner.text = `${chalk.green('Connecting server...')}`
    await ssh.connect(config)
    spinner.succeed(chalk.green("Connection successful"))

    // 上传文件
    spinner.text = `${chalk.green('Uploading file...')}`
    await ssh.putFile(filename, join(publicDir, filename))
    spinner.succeed(`${chalk.green('File uploaded successfully!')}`)

    // 删除服务端的旧文件
    spinner.text = `${chalk.green('Deleting files...')}`
    await ssh.execCommand(`rm -r ${join(RemoteDir, '/*')}`)
    spinner.succeed(`${chalk.green('Files deleted.')}`)

    // 解压文件
    spinner.text = `${chalk.green('Extracting file...')}`
    await ssh.execCommand(`tar xf ${filename} -C ${RemoteDir} && rm -f ${filename}`, {
      cwd: publicDir
    })
    spinner.succeed(`${chalk.green('File extracted successfully!')}`)
  } catch (error) {
    console.log(chalk.red(error))
  } finally {
    ssh.dispose()
  }
}
