require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 读取所有文件
function getFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    return items.flatMap(item => {
        const full = path.join(dir, item.name);
        return item.isDirectory() ? getFiles(full) : full;
    });
}

async function deploy() {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        console.error("❌ ERROR: Missing VERCEL_TOKEN in .env");
        return;
    }

    const files = getFiles("./").map(file => ({
        file: file.replace("./", ""),
        data: fs.readFileSync(file).toString()
    }));

    const payload = {
        name: "my-static-site",
        files,
        projectSettings: { framework: "static" }
    };

    console.log("🚀 Deploying to Vercel...");

    const res = await axios.post(
        "https://api.vercel.com/v12/now/deployments",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("🎉 Deployment successful!");
    console.log("🌍 URL:", res.data.url);
}

deploy();
