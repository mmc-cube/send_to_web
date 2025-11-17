const form = document.getElementById("downloadForm");
const input = document.getElementById("passwordInput");
const button = document.getElementById("downloadButton");
const messageEl = document.getElementById("message");
const BUTTON_COOLDOWN_MS = 1500;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  startDownload(input.value);
});

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = type ? type : "";
}

function disableButtonTemporarily() {
  button.disabled = true;
  setTimeout(() => {
    button.disabled = false;
  }, BUTTON_COOLDOWN_MS);
}

function buildDownloadUrl(password) {
  const encodedPassword = encodeURIComponent(password);
  const relativePath = `packages/${encodedPassword}/content.zip`;
  return new URL(relativePath, window.location.href).toString();
}

async function urlExists(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("HEAD 请求失败，尝试 GET 验证", error);
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("第二次检查失败", error);
    throw error;
  }
}

async function startDownload(rawPassword) {
  const password = rawPassword.trim();

  if (!password) {
    setMessage("请输入密码", "error");
    input.focus();
    return;
  }

  if (/[/\\\\]/.test(password)) {
    setMessage("密码不可包含斜杠等特殊字符", "error");
    input.focus();
    return;
  }

  disableButtonTemporarily();
  setMessage("正在检查文件…");

  const downloadUrl = buildDownloadUrl(password);

  try {
    const exists = await urlExists(downloadUrl);

    if (!exists) {
      setMessage("密码错误或对应内容不存在，请确认后重试", "error");
      return;
    }

    triggerDownload(downloadUrl);
    setMessage("已触发下载，请关注浏览器下载提示", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    setMessage("下载失败，请稍后重试", "error");
  }
}

function triggerDownload(url) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "content.zip";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
