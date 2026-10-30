# Local testing, GitHub commit aur Hostinger deploy

Ye commands future manual releases ke liye hain. In changes ko pehle sirf local par test kiya gaya tha; baad mein release `301001` ke liye GitHub publishing aur Hostinger deployment authorize kiya gaya.

## 1. Local install aur checks — PowerShell terminal 1

Node.js 24 aur Git required hain. Har command successful hone ke baad next command chalayein.

```powershell
Set-Location 'C:\xamppx\htdocs\Interior-main'
node --version
npm.cmd ci --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { throw 'Install failed' }
npm.cmd run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint failed' }
npm.cmd run check:cms
if ($LASTEXITCODE -ne 0) { throw 'CMS checks failed' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
npm.cmd start -- --hostname 127.0.0.1 --port 3000
```

Agar port 3000 par purana local server chal raha hai to uske terminal mein Ctrl+C karein, phir build/start karein. Data ke liye `.data/` folder rakhein; existing admin par `setup:admin` dobara chalana zaroori nahi hai.

## 2. Local acceptance — PowerShell terminal 2

```powershell
Set-Location 'C:\xamppx\htdocs\Interior-main'
$env:TEST_ORIGIN = 'http://localhost:3000'
node scripts/check-local-updates.mjs
if ($LASTEXITCODE -ne 0) { throw 'Local acceptance failed' }
Start-Process 'http://localhost:3000/admin/login'
```

Browser mein left menu, Clients/Testimonials add/edit, Gallery, social icons aur Blog pages check karein. Featured blog images: **1920 × 1080**, maximum 5 MB. Firebase setup: [FIREBASE-SETUP.md](FIREBASE-SETUP.md).

Optional automated browser check: Chrome ko dedicated local debugging profile par start karein, phir script chalayein. Ye test temporary local records bana kar delete karta hai; credentials `.data/local-admin.txt` se padhta hai.

```powershell
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -WindowStyle Hidden -ArgumentList '--headless=new --disable-gpu --no-first-run --remote-debugging-port=9222 --user-data-dir=C:\xamppx\htdocs\Interior-main\.browser-preview-local-updates about:blank'
node scripts/check-local-updates-ui.mjs
if ($LASTEXITCODE -ne 0) { throw 'Browser acceptance failed' }
```

## 3. Aapka GitHub commit aur push

**`main` push se configured Hostinger auto-deployment trigger ho sakta hai.** Live database/uploads ka backup hPanel se lein aur current deploy healthy confirm karein. Private persistent data location: `/home/u835816219/domains/pakmoo.in/private-data/`. Is directory ko Git mein add ya overwrite na karein. `.env`, `.data`, credentials aur backups ignored hi rehne dein.

```powershell
Set-Location 'C:\xamppx\htdocs\Interior-main'
git status --short
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Fix whitespace errors first' }
git diff --stat
git branch --show-current
git remote -v
git fetch origin main
if ($LASTEXITCODE -ne 0) { throw 'Git fetch failed' }
git log --oneline HEAD..origin/main
# Agar yahan commits dikhte hain, pehle upstream changes reconcile karein.
# Is project ka deployment branch main hai; current branch ko check karein.
git add -A
git diff --cached --stat
git diff --cached --name-only
# Staged list inspect karein: .env, .data ya private keys nahi hone chahiye.
$commitMessage = Read-Host 'Apna commit name/version enter karein'
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) { throw 'Commit failed' }
git push origin HEAD:main
if ($LASTEXITCODE -ne 0) { throw 'Push failed; force push mat karein' }
git log -1 --oneline
```

GitHub authentication ke liye Git Credential Manager/browser sign-in use karein. GitHub account password ko terminal command ya remote URL mein na likhein.

## 4. Hostinger deployment

Normal flow: upar ka Git push → existing Hostinger GitHub integration build/deploy karega. Node **24**, app **Next.js**, build **build**, output **.next** rakhein. hPanel → pakmoo.in → Deployments mein exact commit aur **Completed** status verify karein. Failed clone ho to GitHub connection/repository access check karein.

Agar aap terminal se manual deployment karna chahein, official [Hostinger CLI install guide](https://www.hostinger.com/support/11679133-how-to-use-hostinger-api-cli/) ke Windows release se `hostinger.exe` PATH mein install karein. Phir:

```powershell
Set-Location 'C:\xamppx\htdocs\Interior-main'
hostinger version
hostinger link
# Browser sign-in complete karein. EXISTING pakmoo.in site select karein.
# New website create na karein. Build settings Node 24 / Next.js / .next check karein.
hostinger up
if ($LASTEXITCODE -ne 0) { throw 'Hostinger deployment failed' }
```

Auto-deploy complete ho chuka ho to same update ke liye manual `hostinger up` dobara chalane ki zarurat nahi hai. CLI deployment source upload karta hai; runtime environment aur persistent data ko hPanel mein preserve karein. [Official CLI deployment guide](https://www.hostinger.com/support/how-to-deploy-a-website-with-the-hostinger-cli/).

## 5. Live verification — deployment complete hone ke baad

```powershell
(Invoke-WebRequest 'https://pakmoo.in/' -UseBasicParsing).StatusCode
(Invoke-WebRequest 'https://pakmoo.in/blog' -UseBasicParsing).StatusCode
(Invoke-WebRequest 'https://pakmoo.in/admin/login' -UseBasicParsing).StatusCode
Start-Process 'https://pakmoo.in/admin/login'
```

Existing login se sidebar, original products/blogs/authors, one image upload aur social links verify karein. Local Firebase settings SQLite mein hain, isliye woh Git push se live database par copy nahi honge: production `/admin/firebase` mein intended new project config alag save karein, aur Firebase mein `pakmoo.in` authorized domain add karein. Existing images ke old bucket ko files migrate hone tak delete na karein.
