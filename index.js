"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const tar_1 = __importDefault(require("tar"));
const node_ssh_1 = require("node-ssh");
const posix_1 = require("path/posix");
const fs_1 = require("fs");
dotenv_1.default.config({ path: './.env.deploy' });
const config = {
    host: process.env.SSH_HOST,
    username: process.env.SSH_USER,
    port: Number(process.env.SSH_PORT),
    password: process.env.SSH_PASSWORD,
};
const ssh = new node_ssh_1.NodeSSH();
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dist = process.env.DIST;
            const files = (0, fs_1.readdirSync)(dist);
            const filename = 'dist.tgz';
            const RemoteDir = process.env.REMOTE_UPLOAD_DIR;
            const publicDir = (0, posix_1.join)(RemoteDir, '..');
            const spinner = (0, ora_1.default)().start();
            // 压缩文件
            spinner.text = `${chalk_1.default.green('Compressing file...')}`;
            yield tar_1.default.create({
                cwd: dist,
                file: filename
            }, files);
            spinner.succeed(chalk_1.default.green('File compressed successfully!'));
            // ssh连接服务器
            spinner.text = `${chalk_1.default.green('Connecting server...')}`;
            yield ssh.connect(config);
            spinner.succeed(chalk_1.default.green("Connection successful"));
            // 上传文件
            spinner.text = `${chalk_1.default.green('Uploading file...')}`;
            yield ssh.putFile(filename, (0, posix_1.join)(publicDir, filename));
            spinner.succeed(`${chalk_1.default.green('File uploaded successfully!')}`);
            // 删除服务端的旧文件
            spinner.text = `${chalk_1.default.green('Deleting files...')}`;
            yield ssh.execCommand(`rm -r ${(0, posix_1.join)(RemoteDir, '/*')}`);
            spinner.succeed(`${chalk_1.default.green('Files deleted.')}`);
            // 解压文件
            spinner.text = `${chalk_1.default.green('Extracting file...')}`;
            yield ssh.execCommand(`tar xf ${filename} -C ${RemoteDir} && rm -f ${filename}`, {
                cwd: publicDir
            });
            spinner.succeed(`${chalk_1.default.green('File extracted successfully!')}`);
        }
        catch (error) {
            console.log(chalk_1.default.red(error));
        }
        finally {
            ssh.dispose();
        }
    });
}
exports.deploy = deploy;
