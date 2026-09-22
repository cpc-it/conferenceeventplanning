// Minimal, framework-free lightbox for your existing WP HTML
(function () {
  if (typeof window.__teamLightboxCleanup === 'function') {
    window.__teamLightboxCleanup();
  }
  window.__teamLightboxInitialized = true;

  const bios = {
    "erin-scherer": {
      title: "Erin Scherer",
      role: "Director",
      img: "erin-scherer.jpg",
      html: `<p>Through a unique blend of strategic planning, operational expertise and collaborative leadership Erin leads this amazing team by supporting them with event logistics and management.</p><p>In addition to directing high-profile events, Erin is instrumental in aligning conference and event strategies with client’s overall goals to ensure seamless logistical execution and effective utilization of resources.</p>`
    },
    "tammy-farrell": {
      title: "Tammy Farrell",
      role: "Senior Accounting Analyst",
      img: "tammy-farrell.jpg",
      html: `<p>A key figure in both Conference & Event Planning and the Performing Arts Center, Tammy oversees all financial transactions, actively participates in the annual budget process and so much more all to ensure that financial plans align seamlessly with organizational goals and objectives, fostering sustainable growth and resource allocation.</p>`
    },
    "harlie-adams": {
      title: "Harlie Adams",
      role: "Event and Project Coordinator",
      img: "harlie-adams.jpg",
      html: `<p>Harlie excels at planning and executing events, meticulously aligning every detail with client goals and expectations. From choosing venues and managing vendors to coordinating timelines and overseeing on-site logistics, Harlie brings creativity, expertise and experience to craft seamless, memorable experiences.</p>`
    },
    "brandon-hancock": {
      title: "Brandon Hancock",
      role: "Event Operations Specialist",
      img: "brandon-hancock.jpg",
      html: `<p>Brandon Hancock is passionate about creating memorable experiences through thoughtful event planning and execution. A 2018 graduate of Cal Poly with a degree in Wine & Viticulture, Brandon is committed to enhancing the campus experience and supporting meaningful connections between the university and its community. He enjoys collaborating with clients, bringing events to life, and ensuring every attendee has a positive and engaging experience from start to finish.</p>`
    },
    "nicole-lopez": {
      title: "Nicole Lopez",
      role: "Event Operations Specialist",
      img: "nicole-lopez.jpg",
      html: `<p>Nicole Lopez is a 2026 graduate of Cal Poly, San Luis Obispo, where she earned a degree in Experience Industry Management with a focus on Sports Management. A Portland native, Nicole joined the team in June 2026 and works to create seamless event production from planning to breakdown. She brings a detail-oriented, collaborative approach to every project, helping ensure that each event runs smoothly while delivering a memorable experience for clients.</p>`
    },
    "chiara-cipolla-jones": {
      title: "Chiara Cipolla-Jones",
      role: "Event Coordinator",
      img: "chiara-cipolla-jones.jpg",
      html: `<p>Chiara Cipolla-Jones grew up in Pismo Beach, CA, and went on to graduate from Cal Poly in 2020 with a degree in Experience Industry Management and a concentration in Sports Management. Chiara has a passion for event planning and brings her organization and love for creating memorable experiences to every event she plans. She especially enjoys the behind-the-scenes details that make an event a success and creating a fun, stress-free experience for her clients and their guests.</p>`
    }
  };

  function slugify(s) {
    return (s || "")
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // Create modal once
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6)';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const panel = document.createElement('div');
  panel.classList.add('lightbox-panel');
  panel.style.cssText =
    'position:relative;max-width:1024px;width:min(92vw,1024px);max-height:85vh;overflow:auto;background:#fff;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.25)';
  overlay.appendChild(panel);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';
  closeBtn.style.cssText =
    'position:absolute;top:8px;right:12px;width:45px;height:45px;border:none;border-radius:18px;background:#fff;font-size:28px;line-height:34px;cursor:pointer';
  closeBtn.onclick = hide;
  panel.appendChild(closeBtn);

  const content = document.createElement('div');
  panel.appendChild(content);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  function show(html) {
    content.innerHTML = html;
    overlay.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
  }
  function hide() {
    overlay.style.display = 'none';
    document.documentElement.style.overflow = '';
  }

  function ensureOverlayMounted() {
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay);
    }
  }

  function handleTeamClick(e) {
    const a = e.target && e.target.closest('a');
    if (!a) return;

    const teamContainer = a.closest('.team');
    if (!teamContainer) return;

    const text = (a.textContent || '').trim();
    if (!/^Meet\s+/i.test(text)) return;

    e.preventDefault();

    const card = a.closest('.wp-block-column');
    if (!card) return;

    const name = (card.querySelector('h3')?.textContent || '').trim();
    const role = (card.querySelector('h3 + p')?.textContent || '').trim();

    const slug = slugify(name);
    const b = bios[slug] || {};

    const safeTitle = b.title || name || 'Team Member';
    const safeRole = b.role || role || '';

    const staticBase = '/team/';
    const staticName = b.img || `${slug}.jpg`;
    const staticSrc = `${staticBase}${staticName}`;
    const imgAlt = safeTitle;

    const html = `
      <div class="content-wrap">
        <div>
          <img
            src="${staticSrc}"
            alt="${imgAlt}"
            loading="lazy"
            onerror="this.style.display='none'"
          />
        </div>
        <div>
          ${safeRole ? `<h4 style="margin-top:50px;">${safeRole}</h4>` : ''}
          <h3>${safeTitle}</h3>
          <div>${b.html || '<p>No bio available yet.</p>'}</div>
        </div>
      </div>
    `;

    ensureOverlayMounted();
    show(html);
  }

  function init() {
    ensureOverlayMounted();
    document.addEventListener('click', handleTeamClick);
    window.__teamLightboxCleanup = function () {
      document.removeEventListener('click', handleTeamClick);
      overlay.remove();
      document.documentElement.style.overflow = '';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
