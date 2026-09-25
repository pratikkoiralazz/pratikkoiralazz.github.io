

    // 1. Live Clock Function
    function updateClock() {
      const now = new Date();
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      document.getElementById('live-time').textContent = now.toLocaleString('en-US', options);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Fetch Live GitHub Commits
    async function fetchTodayCommits() {
      const username = 'pratikkoiralazz';
      const countElement = document.getElementById('commit-count');

      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://api.github.com/users/${username}/events/public?t=${cacheBuster}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const events = await response.json();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + (24 * 60 * 60 * 1000);

        let totalCommits = 0;
        events.forEach(event => {
          if (event.type === 'PushEvent') {
            const eventTime = new Date(event.created_at).getTime();
            if (eventTime >= startOfToday && eventTime < endOfToday) {
              if (event.payload && Array.isArray(event.payload.commits) && event.payload.commits.length > 0) {
                totalCommits += event.payload.commits.length;
              } else if (event.payload && event.payload.size) {
                totalCommits += event.payload.size;
              } else {
                totalCommits += 1;
              }
            }
          }
        });
        countElement.textContent = totalCommits;
      } catch (error) {
        console.error('Error fetching commits:', error);
      }
    }
    fetchTodayCommits();
    setInterval(fetchTodayCommits, 60000);

    // 3. System Drawer Toggle
    function toggleDrawer() {
      const drawer = document.getElementById('system-drawer');
      drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
    }

    // 4. Multi-Theme Switcher
    const themes = ['default', 'white', 'solarized', 'oled'];
    let currentThemeIndex = 0;

    function cycleTheme() {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const theme = themes[currentThemeIndex];
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        cycleTheme();
      }
    });

    // 5. Project Tag Filtering
    function filterProjects(tag, btn) {
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.project-item').forEach(item => {
        if (tag === 'all' || item.getAttribute('data-tag') === tag) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    }

    // 6. Interactive Code Runner
    function runCode() {
      const code = document.getElementById('code-input').value;
      const outputEl = document.getElementById('code-output');
      try {
        const result = new Function(code)();
        outputEl.style.color = 'var(--accent)';
        outputEl.textContent = `⇒ ${result}`;
      } catch (err) {
        outputEl.style.color = '#ef4444';
        outputEl.textContent = `Error: ${err.message}`;
      }
    }

    // 7. Command Palette Modal (Cmd+K / Ctrl+K)
    function openPalette() {
      document.getElementById('palette-modal').style.display = 'flex';
      document.getElementById('palette-search').focus();
    }

    function closePalette(e) {
      document.getElementById('palette-modal').style.display = 'none';
    }

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    function searchPalette() {
      const query = document.getElementById('palette-search').value.toLowerCase();
      document.querySelectorAll('.modal-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    }

    function execCmd(action) {
      closePalette();
      if (action === 'github') window.open('https://github.com/pratikkoiralazz', '_blank');
      if (action === 'linkedin') window.open('https://www.linkedin.com/in/pratikkoiralazz/', '_blank');
      if (action === 'theme') cycleTheme();
      if (action === 'drawer') toggleDrawer();
      if (action === 'matrix') triggerMatrix();
    }

    // 8. Strictly Binary Matrix Rain (1, 0, 00, 11)
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          triggerMatrix();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });

    function triggerMatrix() {
      const canvas = document.getElementById('matrix-canvas');
      const ctx = canvas.getContext('2d');
      canvas.style.display = 'block';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Pure binary tokens array
      const binaryTokens = ['1', '0', '00', '11', '01', '10'];
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(1);

      function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#22c55e';
        ctx.font = fontSize + 'px ui-monospace, SFMono-Regular, monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = binaryTokens[Math.floor(Math.random() * binaryTokens.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }

      const interval = setInterval(draw, 33);
      setTimeout(() => {
        clearInterval(interval);
        canvas.style.display = 'none';
      }, 5000);
    }
