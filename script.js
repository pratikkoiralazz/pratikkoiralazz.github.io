 const postsData = [
      {
        file: 'living-a-life.md',
        title: 'Why Live a Life?',
        desc: 'A quick reflection on purpose',
        date: '25th Sep 2026',
        tag: 'tech'
      },
      {
        file: 'civic-tech-impact.md',
        title: 'Building Civic Tech for Local Impact',
        desc: 'Lessons from RateMyPalika & Report2Clean',
        date: '26th Sep 2026',
        tag: 'civic'
      },
      {
        file: 'bytecafe-update.md',
        title: 'Building ByteCafe’s Menu Engine',
        desc: 'Optimizing load times on 3G mobile networks',
        date: 'Sep 2026',
        tag: 'tech'
      }
    ];

    document.addEventListener('DOMContentLoaded', () => {
      renderPostsList();
      updateClock();
      setInterval(updateClock, 1000);
      fetchTodayCommits();
    });

    // Automatically render posts from the manifest
    function renderPostsList() {
      const container = document.getElementById('articles-list');
      if (!container) return;

      container.innerHTML = postsData.map(post => `
        <div class="project-item article-item" data-tag="${post.tag}" onclick="openFullArticle('${post.file}', '${post.title.replace(/'/g, "\\'")}', '${post.date}')">
          <div>
            <a>${post.title}</a>
            <div class="project-desc">${post.desc}</div>
          </div>
          <span class="project-desc" style="white-space: nowrap;">${post.date}</span>
        </div>
      `).join('');
    }

    // Page Navigation Router
    function showPage(pageId) {
      document.querySelectorAll('main').forEach(m => m.classList.remove('active'));
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

      if (pageId === 'home') {
        document.getElementById('page-home').classList.add('active');
        document.getElementById('nav-home').classList.add('active');
      } else if (pageId === 'posts') {
        document.getElementById('page-posts').classList.add('active');
        document.getElementById('nav-posts').classList.add('active');
      } else if (pageId === 'reader') {
        document.getElementById('page-article-reader').classList.add('active');
        document.getElementById('nav-posts').classList.add('active');
      }
    }

    // 1. Live Clock
    function updateClock() {
      const clockEl = document.getElementById('live-time');
      if (clockEl) {
        clockEl.textContent = new Date().toLocaleString('en-US', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
      }
    }

    // 2. Fetch Live GitHub Commits
    async function fetchTodayCommits() {
      const countElement = document.getElementById('commit-count');
      if (!countElement) return;

      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://api.github.com/users/pratikkoiralazz/events/public?t=${cacheBuster}`);
        if (!response.ok) {
          countElement.textContent = '0';
          return;
        }
        const events = await response.json();
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        let total = 0;

        events.forEach(event => {
          if (event.type === 'PushEvent' && new Date(event.created_at).getTime() >= startOfToday) {
            total += (event.payload && event.payload.commits) ? event.payload.commits.length : 1;
          }
        });
        countElement.textContent = total;
      } catch (err) {
        countElement.textContent = '0';
      }
    }

    // Widget Navigation & Close Controls
    function showWidget(id) {
      showPage('home');
      ['box-snake', 'box-bug', 'box-typing'].forEach(boxId => {
        const box = document.getElementById(boxId);
        if (!box) return;
        if (boxId === id) {
          box.style.display = box.style.display === 'block' ? 'none' : 'block';
          if (box.style.display === 'block') {
            if (id === 'box-snake') startSnakeGame();
            if (id === 'box-bug') loadBugChallenge();
            if (id === 'box-typing') resetEngine();
          } else {
            if (id === 'box-snake') clearInterval(snakeInterval);
          }
        } else {
          box.style.display = 'none';
          if (boxId === 'box-snake') clearInterval(snakeInterval);
        }
      });
    }

    function closeWidget(id) {
      const box = document.getElementById(id);
      if (box) {
        box.style.display = 'none';
        if (id === 'box-snake') clearInterval(snakeInterval);
        if (id === 'box-typing') clearInterval(timerInterval);
      }
    }

    // System Drawer Controls
    function toggleDrawer() {
      const drawer = document.getElementById('system-drawer');
      if (drawer) drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
    }

    function closeDrawer(e) {
      if (e) e.preventDefault();
      const drawer = document.getElementById('system-drawer');
      if (drawer) drawer.style.display = 'none';
    }

    // Theme Switcher (White theme by default)
    const themes = ['white', 'dark', 'solarized', 'oled'];
    let currentThemeIndex = 0;
    function cycleTheme() {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const theme = themes[currentThemeIndex];
      if (theme === 'white') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't' && document.activeElement.tagName !== 'INPUT') {
        cycleTheme();
      }
    });

    // Tag Filtering for Projects
    function filterProjects(tag, btn) {
      document.querySelectorAll('.tag-filters .tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.project-item:not(.article-item)').forEach(item => {
        item.style.display = (tag === 'all' || item.getAttribute('data-tag') === tag) ? 'flex' : 'none';
      });
    }

    // Tag Filtering for Articles
    function filterArticles(tag, btn) {
      document.querySelectorAll('#page-posts .tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#articles-list .article-item').forEach(item => {
        item.style.display = (tag === 'all' || item.getAttribute('data-tag') === tag) ? 'flex' : 'none';
      });
    }

    // Open Full Standalone Article Reader Page
   // Open Full Standalone Article Reader Page
    async function openFullArticle(filename, title, date) {
      const titleEl = document.getElementById('reader-title');
      const dateEl = document.getElementById('reader-date');
      const bodyEl = document.getElementById('reader-body');

      titleEl.textContent = title;
      dateEl.textContent = date;
      bodyEl.innerHTML = '<p style="color: var(--muted-dark);">Loading article...</p>';
      showPage('reader');

      try {
        const response = await fetch(`posts/${filename}`);
        if (!response.ok) throw new Error('Post not found');
        const markdownText = await response.text();

        if (!markdownText.trim()) {
          bodyEl.innerHTML = '<p style="color: var(--muted-dark);">This article is empty.</p>';
        } else {
          bodyEl.innerHTML = marked.parse(markdownText);
        }
      } catch (err) {
        bodyEl.innerHTML = '<p style="color: var(--muted-dark);">Article content unavailable.</p>';
      }
    }
    /* TERMINAL ASCII SNAKE LOGIC */
    let snakeInterval = null;
    let snake = [{x: 150, y: 100}];
    let snakeDir = {x: 10, y: 0};
    let bugFood = {x: 50, y: 50};
    let snakeScore = 0;
    let snakeHighScore = localStorage.getItem('snakeHighScore') || 0;

    const snakeHighEl = document.getElementById('snake-high');
    if (snakeHighEl) snakeHighEl.textContent = snakeHighScore;

    function startSnakeGame() {
      resetSnakeGame();
      clearInterval(snakeInterval);
      snakeInterval = setInterval(snakeGameLoop, 90);
    }

    function resetSnakeGame() {
      snake = [{x: 150, y: 100}, {x: 140, y: 100}];
      snakeDir = {x: 10, y: 0};
      snakeScore = 0;
      const scoreEl = document.getElementById('snake-score');
      if (scoreEl) scoreEl.textContent = snakeScore;
      spawnBug();
    }

    function spawnBug() {
      bugFood.x = Math.floor(Math.random() * 29) * 10;
      bugFood.y = Math.floor(Math.random() * 19) * 10;
    }

    function snakeGameLoop() {
      const canvas = document.getElementById('snake-board');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const head = {x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y};

      if (head.x < 0 || head.x >= 300 || head.y < 0 || head.y >= 200 || snake.some(p => p.x === head.x && p.y === head.y)) {
        if (snakeScore > snakeHighScore) {
          snakeHighScore = snakeScore;
          localStorage.setItem('snakeHighScore', snakeHighScore);
          if (snakeHighEl) snakeHighEl.textContent = snakeHighScore;
        }
        resetSnakeGame();
        return;
      }

      snake.unshift(head);

      if (head.x === bugFood.x && head.y === bugFood.y) {
        snakeScore += 10;
        const scoreEl = document.getElementById('snake-score');
        if (scoreEl) scoreEl.textContent = snakeScore;
        spawnBug();
      } else {
        snake.pop();
      }

      ctx.fillStyle = '#050a0e';
      ctx.fillRect(0, 0, 300, 200);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bugFood.x + 1, bugFood.y + 1, 8, 8);

      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#22c55e' : '#00a3ff';
        ctx.fillRect(part.x + 1, part.y + 1, 8, 8);
      });
    }

    document.addEventListener('keydown', (e) => {
      const snakeBox = document.getElementById('box-snake');
      if (snakeBox && snakeBox.style.display === 'block') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
        if (e.key === 'ArrowUp' && snakeDir.y === 0) snakeDir = {x: 0, y: -10};
        if (e.key === 'ArrowDown' && snakeDir.y === 0) snakeDir = {x: 0, y: 10};
        if (e.key === 'ArrowLeft' && snakeDir.x === 0) snakeDir = {x: -10, y: 0};
        if (e.key === 'ArrowRight' && snakeDir.x === 0) snakeDir = {x: 10, y: 0};
      }
    });

    /* CODE BUG HUNTER LOGIC */
    const bugChallenges = [
      // --- JAVASCRIPT (10) ---
      {
        lang: 'javascript',
        code: [
          "async function fetchUser(id) {",
          "  const res = fetch(`/api/users/${id}`);",
          "  const data = await res.json();",
          "  return data.name;",
          "}"
        ],
        bugLine: 1,
        reason: "Missing 'await' keyword on fetch promise call."
      },
      {
        lang: 'javascript',
        code: [
          "function calculateAverage(nums) {",
          "  let sum = 0;",
          "  for (let i = 0; i <= nums.length; i++) {",
          "    sum += nums[i];",
          "  }",
          "  return sum / nums.length;",
          "}"
        ],
        bugLine: 2,
        reason: "Off-by-one array boundary error (i <= nums.length causes NaN)."
      },
      {
        lang: 'javascript',
        code: [
          "function updatePrice(price, tax) {",
          "  const total = price + tax;",
          "  total = total * 0.9;",
          "  return total;",
          "}"
        ],
        bugLine: 2,
        reason: "Attempting to reassign a const variable."
      },
      {
        lang: 'javascript',
        code: [
          "function getFirstElement(arr) {",
          "  if (arr.length = 0) {",
          "    return null;",
          "  }",
          "  return arr[0];",
          "}"
        ],
        bugLine: 1,
        reason: "Assignment (=) used inside condition instead of comparison (===)."
      },
      {
        lang: 'javascript',
        code: [
          "function formatName(user) {",
          "  Object.freeze(user);",
          "  user.name = user.name.toUpperCase();",
          "  return user.name;",
          "}"
        ],
        bugLine: 2,
        reason: "Cannot modify property of a frozen object."
      },
      {
        lang: 'javascript',
        code: [
          "function processItems(items) {",
          "  items.forEach(async (item) => {",
          "    await saveToDB(item);",
          "  });",
          "  console.log('Complete');",
          "}"
        ],
        bugLine: 1,
        reason: "Array.prototype.forEach does not wait for async promises."
      },
      {
        lang: 'javascript',
        code: [
          "function incrementCounter(val) {",
          "  let count = '10';",
          "  count += val;",
          "  return count;",
          "}"
        ],
        bugLine: 2,
        reason: "String concatenation occurs instead of numeric addition."
      },
      {
        lang: 'javascript',
        code: [
          "function getEvens(nums) {",
          "  return nums.map(n => {",
          "    n % 2 === 0;",
          "  });",
          "}"
        ],
        bugLine: 2,
        reason: "Missing return statement inside block body arrow function."
      },
      {
        lang: 'javascript',
        code: [
          "function createGreeting(name) {",
          "  return",
          "    'Hello ' + name;",
          "}"
        ],
        bugLine: 1,
        reason: "Automatic Semicolon Insertion (ASI) returns undefined."
      },
      {
        lang: 'javascript',
        code: [
          "function bindClick() {",
          "  const btn = document.getElementById('btn');",
          "  btn.addEventListener('click', () => {",
          "    this.classList.add('active');",
          "  });",
          "}"
        ],
        bugLine: 3,
        reason: "Arrow functions do not bind their own 'this' context."
      },

      // --- PYTHON (10) ---
      {
        lang: 'python',
        code: [
          "def add_item(item, target=[]):",
          "    target.append(item)",
          "    return target"
        ],
        bugLine: 0,
        reason: "Mutable default argument persists state across function calls."
      },
      {
        lang: 'python',
        code: [
          "numbers = [1, 2, 3, 4, 5]",
          "for i in range(len(numbers)):",
          "    if numbers[i] % 2 == 0:",
          "        numbers.remove(numbers[i])"
        ],
        bugLine: 3,
        reason: "Modifying a list while iterating over its index causes skip/IndexError."
      },
      {
        lang: 'python',
        code: [
          "title = 'hello world'",
          "title[0] = 'H'",
          "print(title)"
        ],
        bugLine: 1,
        reason: "Strings are immutable in Python and cannot be assigned by index."
      },
      {
        lang: 'python',
        code: [
          "def get_average(scores):",
          "    total = sum(scores)",
          "    return total / len(scores)",
          "print(get_average([]))"
        ],
        bugLine: 2,
        reason: "Passing an empty list triggers ZeroDivisionError."
      },
      {
        lang: 'python',
        code: [
          "functions = []",
          "for i in range(3):",
          "    functions.append(lambda: i)",
          "print([f() for f in functions])"
        ],
        bugLine: 2,
        reason: "Late binding closure captures reference to variable i, returning [2, 2, 2]."
      },
      {
        lang: 'python',
        code: [
          "user_data = {'name': 'Alex'}",
          "if user_data.has_key('name'):",
          "    print('Exists')"
        ],
        bugLine: 1,
        reason: "has_key() was removed in Python 3; use 'in' operator instead."
      },
      {
        lang: 'python',
        code: [
          "list_a = [1, 2, 3]",
          "list_b = list_a",
          "list_b.append(4)",
          "assert len(list_a) == 3"
        ],
        bugLine: 3,
        reason: "list_b is a reference to list_a, so mutating list_b changes list_a."
      },
      {
        lang: 'python',
        code: [
          "class User:",
          "    def __init__(name):",
          "        self.name = name"
        ],
        bugLine: 1,
        reason: "Missing 'self' parameter in class instance method definition."
      },
      {
        lang: 'python',
        code: [
          "coords = (10, 20)",
          "coords.append(30)",
          "print(coords)"
        ],
        bugLine: 1,
        reason: "Tuples are immutable and do not have an append method."
      },
      {
        lang: 'python',
        code: [
          "try:",
          "    value = 10 / 0",
          "except Exception:",
          "    pass",
          "print(value)"
        ],
        bugLine: 4,
        reason: "Variable 'value' is uninitialized due to exception in try block."
      },

      // --- PHP (10) ---
      {
        lang: 'php',
        code: [
          "<?php",
          "$globalCount = 10;",
          "function printCount() {",
          "  echo $globalCount;",
          "}",
          "printCount();"
        ],
        bugLine: 3,
        reason: "Global variable accessed inside function without 'global' keyword."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$user = ['name' => 'John'];",
          "if ($user['role'] == 'admin') {",
          "  echo 'Access granted';",
          "}"
        ],
        bugLine: 2,
        reason: "Undefined array key 'role' causes warning/error."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$items = [1, 2, 3];",
          "foreach ($items as &$item) {}",
          "foreach ($items as$item) {}",
          "print_r($items);"
        ],
        bugLine: 3,
        reason: "Reusing reference variable $item in second loop mutates last element."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$data = null;",
          "if (count($data) > 0) {",
          "  echo 'Has elements';",
          "}"
        ],
        bugLine: 2,
        reason: "Calling count() on null throws a TypeError in modern PHP."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$text = 'Hello World';",
          "if (strpos($text, 'Hello') == false) {",
          "  echo 'Not found';",
          "}"
        ],
        bugLine: 2,
        reason: "strpos returns 0 for index 0, which loosely equals false (=== required)."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$qty = '10 items';",
          "$total =$qty + 5;",
          "echo $total;"
        ],
        bugLine: 2,
        reason: "Performing arithmetic on non-numeric string throws TypeError/Warning."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "class Client {",
          "  private function connect() {}",
          "}",
          "$c = new Client();",
          "$c->connect();"
        ],
        bugLine: 5,
        reason: "Cannot invoke private method connect() outside class context."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$handle = fopen('file.txt', 'r');",
          "fclose('file.txt');"
        ],
        bugLine: 2,
        reason: "fclose expects a file resource handle, not a string filename."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "define('LIMIT', 50);",
          "LIMIT = 100;"
        ],
        bugLine: 2,
        reason: "Cannot reassign constant defined via define()."
      },
      {
        lang: 'php',
        code: [
          "<?php",
          "$list = [10, 20, 30];",
          "echo $list;"
        ],
        bugLine: 2,
        reason: "Directly echoing an array triggers Array to string conversion error."
      },

      // --- SQL (10) ---
      {
        lang: 'sql',
        code: [
          "SELECT user_id, COUNT(*)",
          "FROM orders",
          "WHERE COUNT(*) > 5",
          "GROUP BY user_id;"
        ],
        bugLine: 2,
        reason: "Aggregate functions like COUNT(*) must be used in HAVING, not WHERE."
      },
      {
        lang: 'sql',
        code: [
          "SELECT id, username",
          "FROM users",
          "WHERE email = NULL;"
        ],
        bugLine: 2,
        reason: "NULL comparisons require IS NULL rather than equality operator (=)."
      },
      {
        lang: 'sql',
        code: [
          "SELECT category, price",
          "FROM products",
          "GROUP BY category;"
        ],
        bugLine: 0,
        reason: "Unaggregated column 'price' selected without being included in GROUP BY."
      },
      {
        lang: 'sql',
        code: [
          "INSERT INTO logs (id, message)",
          "VALUES (10, 'Login')",
          "WHERE id NOT IN (SELECT id FROM logs);"
        ],
        bugLine: 2,
        reason: "WHERE clause is invalid in direct INSERT INTO ... VALUES syntax."
      },
      {
        lang: 'sql',
        code: [
          "SELECT * FROM users",
          "WHERE status NOT IN ('active', 'pending', NULL);"
        ],
        bugLine: 1,
        reason: "NOT IN returns 0 rows if set contains NULL due to 3-valued logic."
      },
      {
        lang: 'sql',
        code: [
          "UPDATE accounts",
          "SET balance = balance - 50;",
          "WHERE account_id = 100;"
        ],
        bugLine: 1,
        reason: "Premature semicolon after SET clause truncates query before WHERE."
      },
      {
        lang: 'sql',
        code: [
          "SELECT name FROM employees",
          "ORDER BY salary DESC",
          "WHERE status = 'ACTIVE';"
        ],
        bugLine: 1,
        reason: "ORDER BY must appear after WHERE clause in SQL syntax."
      },
      {
        lang: 'sql',
        code: [
          "DELETE FROM orders",
          "INNER JOIN users ON orders.user_id = users.id;"
        ],
        bugLine: 0,
        reason: "Delete target table alias missing before FROM in JOIN deletion."
      },
      {
        lang: 'sql',
        code: [
          "SELECT title FROM posts",
          "LIMIT 10",
          "WHERE published = 1;"
        ],
        bugLine: 1,
        reason: "LIMIT clause must be placed at the end of the query."
      },
      {
        lang: 'sql',
        code: [
          "SELECT DISTINCT category, COUNT(*)",
          "FROM inventory;"
        ],
        bugLine: 0,
        reason: "DISTINCT cannot be combined with un-grouped COUNT(*) without GROUP BY."
      }
    ];

    let filteredBugChallenges = [...bugChallenges];
    let currentBugIndex = 0;
    let bugStreak = 0;

    function updateBugLanguagePreference() {
      const selectEl = document.getElementById('bug-lang-select');
      const bugBox = document.getElementById('box-bug');
      const val = selectEl ? selectEl.value : 'all';

      if (val === 'off') {
        if (bugBox) bugBox.style.display = 'none';
        return;
      }

      if (bugBox) bugBox.style.display = 'block';

      if (val === 'all') {
        filteredBugChallenges = [...bugChallenges];
      } else {
        filteredBugChallenges = bugChallenges.filter(item => item.lang === val);
      }

      currentBugIndex = 0;
      loadBugChallenge();
    }

    function loadBugChallenge() {
      const bugBox = document.getElementById('box-bug');
      if (bugBox && bugBox.style.display === 'none') return;

      if (filteredBugChallenges.length === 0) return;

      const challenge = filteredBugChallenges[currentBugIndex];
      const blockEl = document.getElementById('bug-code-block');
      if (!blockEl) return;

      blockEl.innerHTML = challenge.code.map((line, idx) => `
        <div class="code-line" onclick="checkBugLine(${idx})">${idx + 1}. ${line}</div>
      `).join('');
      document.getElementById('bug-feedback').textContent = "Click on the line containing the bug";
      document.getElementById('bug-feedback').style.color = "var(--muted)";
    }

    function checkBugLine(idx) {
      if (filteredBugChallenges.length === 0) return;

      const challenge = filteredBugChallenges[currentBugIndex];
      const feedback = document.getElementById('bug-feedback');
      if (idx === challenge.bugLine) {
        bugStreak++;
        feedback.textContent = `Correct! ${challenge.reason}`;
        feedback.style.color = "var(--correct)";
        document.getElementById('bug-streak').textContent = bugStreak;
        setTimeout(() => {
          currentBugIndex = (currentBugIndex + 1) % filteredBugChallenges.length;
          loadBugChallenge();
        }, 1500);
      } else {
        bugStreak = 0;
        document.getElementById('bug-streak').textContent = 0;
        feedback.textContent = "Wrong line! Look closely for syntax, logic, or type issues.";
        feedback.style.color = "var(--incorrect)";
      }
    }

    /* MONKEYTYPE MODE ENGINE LOGIC */
    const devDict = ['react', 'nextjs', 'postgres', 'express', 'node', 'civic', 'pipeline', 'async', 'await', 'git', 'push', 'commit', 'deploy', 'rest', 'api', 'schema', 'query', 'function'];
    let timeLimit = 15;
    let timeRemaining = 15;
    let words = [];
    let activeWordIndex = 0;
    let typedHistory = [];
    let testActive = false;
    let testFinished = false;
    let timerInterval = null;

    function setTypingMode(val, el) {
      timeLimit = val;
      timeRemaining = val;
      document.querySelectorAll('.config-opt').forEach(opt => opt.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('timer-val').textContent = val;
      resetEngine();
    }

    function focusEngine() {
      if (!testFinished) document.getElementById('engine-input').focus();
    }

    function appendWords(count = 30) {
      const newBatch = Array.from({length: count}, () => devDict[Math.floor(Math.random() * devDict.length)]);
      const startIndex = words.length;
      words.push(...newBatch);
      const wordsInner = document.getElementById('words-inner');
      if (!wordsInner) return;
      const batchHTML = newBatch.map((w, i) => {
        const wi = startIndex + i;
        return `<div class="word" id="w-${wi}">${w.split('').map((c, ci) => `<span class="char" id="c-${wi}-${ci}">${c}</span>`).join('')}</div>`;
      }).join('');
      wordsInner.insertAdjacentHTML('beforeend', batchHTML);
    }

    function resetEngine() {
      clearInterval(timerInterval);
      testActive = false;
      testFinished = false;
      activeWordIndex = 0;
      typedHistory = [];
      timeRemaining = timeLimit;

      document.getElementById('timer-val').textContent = timeLimit;
      document.getElementById('results-card').style.display = 'none';
      document.getElementById('words-container').style.display = 'block';
      document.getElementById('config-bar').style.display = 'flex';
      document.getElementById('engine-input').value = '';

      words = [];
      document.getElementById('words-inner').innerHTML = '';
      appendWords(40);
      document.getElementById('caret').style.display = 'block';
      focusEngine();
      updateCaret();
    }

    function handleEngineInput(e) {
      if (testFinished) return;
      const input = e.target.value;
      const currentWord = words[activeWordIndex];

      if (!testActive && input.length > 0) {
        testActive = true;
        timerInterval = setInterval(() => {
          timeRemaining--;
          document.getElementById('timer-val').textContent = timeRemaining;
          if (timeRemaining <= 0) finishEngine();
        }, 1000);
      }

      if (e.data === ' ') {
        if (input.trim().length > 0) {
          typedHistory[activeWordIndex] = input.trim();
          activeWordIndex++;
          e.target.value = '';
          if (activeWordIndex + 15 >= words.length) appendWords(30);
        }
      } else {
        typedHistory[activeWordIndex] = input;
        const wordEl = document.getElementById(`w-${activeWordIndex}`);
        if (wordEl) {
          const charSpans = wordEl.querySelectorAll('.char');
          charSpans.forEach((span, i) => {
            if (i < input.length) {
              span.className = (input[i] === currentWord[i]) ? 'char correct' : 'char incorrect';
            } else {
              span.className = 'char';
            }
          });
        }
      }
      updateCaret();
    }

    function updateCaret() {
      const activeWordEl = document.getElementById(`w-${activeWordIndex}`);
      if (!activeWordEl) return;
      const inputVal = document.getElementById('engine-input').value;
      const charEl = activeWordEl.querySelectorAll('.char')[inputVal.length];
      const caret = document.getElementById('caret');

      if (charEl) {
        caret.style.left = `${charEl.offsetLeft}px`;
        caret.style.top = `${charEl.offsetTop}px`;
      } else {
        const lastChar = activeWordEl.lastElementChild;
        if (lastChar) {
          caret.style.left = `${lastChar.offsetLeft + lastChar.offsetWidth}px`;
          caret.style.top = `${lastChar.offsetTop}px`;
        }
      }
    }

    function finishEngine() {
      clearInterval(timerInterval);
      testFinished = true;
      testActive = false;

      const currentVal = document.getElementById('engine-input').value.trim();
      if (currentVal.length > 0) typedHistory[activeWordIndex] = currentVal;

      let totalTypedChars = 0;
      let correctChars = 0;

      typedHistory.forEach((typed, idx) => {
        const target = words[idx];
        if (!typed || !target) return;
        totalTypedChars += typed.length + 1;
        for (let i = 0; i < typed.length; i++) {
          if (i < target.length && typed[i] === target[i]) correctChars++;
        }
        if (typed === target) correctChars++;
      });

      const elapsedMinutes = timeLimit / 60;
      const wpm = Math.round((correctChars / 5) / elapsedMinutes) || 0;
      const accuracy = totalTypedChars > 0 ? Math.min(100, Math.round((correctChars / totalTypedChars) * 100)) : 100;

      document.getElementById('caret').style.display = 'none';
      document.getElementById('words-container').style.display = 'none';
      document.getElementById('config-bar').style.display = 'none';
      
      document.getElementById('res-wpm').textContent = wpm;
      document.getElementById('res-acc').textContent = `${accuracy}%`;
      document.getElementById('res-type').innerHTML = `time ${timeLimit}<br>english`;
      document.getElementById('results-card').style.display = 'flex';
    }

    /* Command Palette Modal Manager */
    function openPalette() {
      document.getElementById('palette-modal').style.display = 'flex';
      document.getElementById('palette-search').value = '';
      document.getElementById('palette-search').focus();
      searchPalette();
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
        item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
      });
    }

    function execCmd(action) {
      closePalette();
      if (action === 'game-snake') showWidget('box-snake');
      if (action === 'game-bug') showWidget('box-bug');
      if (action === 'game-typing') showWidget('box-typing');
      if (action === 'nav-posts') showPage('posts');
      if (action === 'github') window.open('https://github.com/pratikkoiralazz', '_blank');
      if (action === 'linkedin') window.open('https://www.linkedin.com/in/pratikkoiralazz/', '_blank');
      if (action === 'theme') cycleTheme();
      if (action === 'drawer') toggleDrawer();
      if (action === 'matrix') triggerMatrix();
    }

    /* Konami Code Matrix Rain Easter Egg */
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
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.style.display = 'block';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const binaryTokens = ['1', '0', '00', '11', '01', '10'];
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(1);

      function draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#16a34a';
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