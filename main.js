// ==UserScript==
// @name        Anti Censorship: Extreme Edition
// @namespace   anti-censorship-extreme-edition
// @version     1.0
// @description Блокировка российских государственных, цензурных и финансовых сайтов. Заменяет страницу на уведомление и блокирует дальнейшие сетевые запросы.
// @match       *://*/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    // -----------------------
    // === Списки доменов ===
    // -----------------------

    const governmentDomains = [
        'eais.rkn.gov.ru',
        'rkn.gov.ru',
        'register.rkn.gov.ru',
        'pd.rkn.gov.ru',
        'reestr.rkn.gov.ru',
        'blocklist.rkn.gov.ru',
        'zapret-info.gov.ru',
        'gosuslugi.ru',
        'government.ru',
        'kremlin.ru',
        'prezident.ru',
        'duma.gov.ru',
        'sovet.gov.ru',
        'gov.ru',
        'minfin.gov.ru',
        'minzdrav.gov.ru',
        'edu.gov.ru',
        'minobrnauki.gov.ru',
        'minjust.gov.ru',
        'mintrans.gov.ru',
        'mintrud.gov.ru',
        'minenergo.gov.ru',
        'mchs.gov.ru',
        'mid.ru',
        'fns.gov.ru',
        'nalog.gov.ru',
        'pfr.gov.ru',
        'gossluzhba.gov.ru',
        'goszakupki.gov.ru',
        'zakupki.gov.ru',
        'genproc.gov.ru',
        'prokuratura.gov.ru',
        'mvd.gov.ru',
        'fsb.ru',
        'rosguard.gov.ru',
        'fssp.ru',
        'customs.gov.ru',
        'roscomnadzor.gov.ru',
        'gov.spb.ru',
        'mosreg.ru',
        'tatarstan.ru'
    ];

    const censorshipMediaDomains = [
        'ria.ru','tass.ru','rt.com','sputniknews.com','lenta.ru','iz.ru','kp.ru',
        'rg.ru','aif.ru','vesti.ru','smotrim.ru','1tv.ru','vgtrk.ru','tvzvezda.ru',
        'ntv.ru','ren.tv','360tv.ru','mk.ru','vz.ru','ura.news','regnum.ru','ng.ru','rbc.ru'
    ];

    const socialMediaDomains = [
        'vk.com','vkontakte.ru','ok.ru','odnoklassniki.ru','mail.ru','my.mail.ru',
        'agent.mail.ru','max.ru','yandex.ru','ya.ru'
    ];

    const bankDomains = [
        'sberbank.ru','online.sberbank.ru','vtb.ru','gazprombank.ru','alfabank.ru',
        'tinkoff.ru','pochta.ru','tbank.ru','rosbank.ru','unicredit.ru'
    ];

    const otherHosts = [
        '95.163.69.98'
    ];

    const blockedKeywords = [
        'rkn.gov.ru','zapret-info','roscomnadzor','реестр запрещенных',
        'блокировка сайтов','госуслуги','gosuslugi','вконтакте','vkontakte',
        'одноклассники','odnoklassniki','mail.ru','sberbank','vtb','gazprombank','ркн','rkn'
    ];

    // -----------------------
    // === Вспомогательные ===
    // -----------------------

    function expandDomains(domains) {
        const result = new Set();
        for (const d of domains) {
            const dd = d.trim().toLowerCase();
            if (!dd) continue;
            result.add(dd);
            if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(dd) && !dd.startsWith('www.')) {
                result.add('www.' + dd);
            }
        }
        return Array.from(result);
    }

    const allBlockedDomains = expandDomains([
        ...governmentDomains,
        ...censorshipMediaDomains,
        ...socialMediaDomains,
        ...bankDomains,
        ...otherHosts
    ]);

    function isBlockedSite() {
        const hostname = (window.location.hostname || '').toLowerCase();
        const url = (window.location.href || '').toLowerCase();

        if (!hostname) return false;

        for (const domain of allBlockedDomains) {
            if (!domain) continue;
            if (hostname === domain || hostname.endsWith('.' + domain)) return true;
        }

        for (const kw of blockedKeywords) {
            if (!kw) continue;
            if (url.includes(kw)) return true;
        }

        return false;
    }

    function createBlockPageHTML(blockedHostname) {
        const now = new Date().toLocaleString();
        return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🚫 Доступ заблокирован — Anti Censorship: Extreme Edition</title>
<style>
  html,body{height:100%;margin:0}
  body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial;background:#0f1724;color:#e6eef8;display:flex;align-items:center;justify-content:center}
  .card{max-width:720px;padding:36px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.05));box-shadow:0 8px 30px rgba(2,6,23,0.7);text-align:center}
  h1{margin:0 0 8px;font-size:28px;color:#ff6b6b}
  p{margin:8px 0 18px;color:#cde3ff}
  .meta{font-size:13px;color:#98b3d6;margin-top:12px}
  .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#112233;color:#cfe8ff;font-weight:600;font-size:13px;margin-top:10px}
  a.link{display:inline-block;margin-top:18px;padding:10px 16px;border-radius:10px;background:#203a56;color:#dff3ff;text-decoration:none;font-weight:600}
</style>
</head>
<body>
  <div class="card" role="alert">
    <h1>🚫 Доступ заблокирован</h1>
    <div class="badge">Anti Censorship: Extreme Edition</div>
    <p>Доступ к ресурсу <strong>${escapeHtml(blockedHostname)}</strong> на этом устройстве ограничён.</p>
    <p class="meta">Причина: ресурс входит в список государственных/цензурных/финансовых сайтов.<br>Время: ${escapeHtml(now)}</p>
    <a class="link" href="about:blank" onclick="location.href='about:blank'">Закрыть</a>
  </div>
</body>
</html>`;
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function blockAccess() {
        try {
            if (typeof window.stop === 'function') window.stop();
            if (document && document.documentElement) {
                const html = createBlockPageHTML(window.location.hostname);
                document.open('text/html', 'replace');
                document.write(html);
                document.close();
            } else { location.href = 'about:blank'; }
            const blockFn = () => Promise.reject(new Error('Blocked by Anti Censorship: Extreme Edition'));
            Object.defineProperty(window, 'fetch', { value: blockFn, configurable: false, writable: false });
            function BlockedXHR() { throw new Error('Blocked by Anti Censorship: Extreme Edition'); }
            Object.defineProperty(window, 'XMLHttpRequest', { value: BlockedXHR, configurable: false, writable: false });
            Object.defineProperty(window, 'WebSocket', { value: function() { throw new Error('Blocked by Anti Censorship: Extreme Edition'); }, configurable: false, writable: false });
        } catch (err) { console.error('Anti Censorship: error blocking', err); }
    }

    if (isBlockedSite()) {
        console.info('Anti Censorship: blocking', window.location.hostname);
        blockAccess();
    }

})();
