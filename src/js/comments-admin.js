// Comment approval page. The admin password is kept only for this browser tab.
(function () {
  var loginForm = document.getElementById("login");
  var panel = document.getElementById("admin-panel");
  var list = document.getElementById("admin-list");
  var statusEl = document.getElementById("admin-status");
  var toggles = panel.querySelectorAll("[data-status]");
  var key = "";
  var view = "pending";
  try { key = sessionStorage.getItem("pe-admin-key") || ""; } catch (e) {}

  var dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

  function say(text, kind) { statusEl.textContent = text; statusEl.className = "comment-status" + (kind ? " " + kind : ""); }

  function api(method, body) {
    return fetch("/api/admin/comments" + (method === "GET" ? "?status=" + view : ""), {
      method: method,
      headers: { "X-Admin-Key": key, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.error || "Something went wrong.");
        return d;
      });
    });
  }

  function button(label, cls, onClick) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn " + cls; b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function render(comments) {
    list.textContent = "";
    if (!comments.length) {
      var p = document.createElement("p"); p.className = "muted";
      p.textContent = view === "pending" ? "Nothing waiting for approval." : "No approved comments yet.";
      list.appendChild(p); return;
    }
    comments.forEach(function (c) {
      var item = document.createElement("article"); item.className = "comment";
      var head = document.createElement("p"); head.className = "comment-head";
      var name = document.createElement("strong"); name.textContent = c.name;
      var when = document.createElement("time"); when.textContent = dateFmt.format(new Date(c.created_at));
      head.appendChild(name); head.appendChild(when);
      var where = document.createElement("a"); where.className = "comment-post"; where.href = c.post + "#comments"; where.textContent = c.post;
      var body = document.createElement("p"); body.style.whiteSpace = "pre-wrap"; body.textContent = c.body;
      var actions = document.createElement("div"); actions.className = "comment-buttons";
      if (c.status === "pending") actions.appendChild(button("Approve", "btn-primary", function () { act(c.id, "approve", item); }));
      actions.appendChild(button("Delete", "btn-danger", function () {
        if (this.dataset.armed) { act(c.id, "delete", item); return; }
        this.dataset.armed = "1"; this.textContent = "Tap again to delete";
      }));
      item.appendChild(head); item.appendChild(where); item.appendChild(body); item.appendChild(actions);
      list.appendChild(item);
    });
  }

  function act(id, action, item) {
    api("POST", { id: id, action: action })
      .then(function () { item.remove(); say(action === "approve" ? "Approved. It's now showing on the post." : "Deleted.", "ok"); if (!list.children.length) render([]); })
      .catch(function (e) { say(e.message, "error"); });
  }

  function load() {
    say("Loading…");
    api("GET").then(function (d) {
      say("");
      loginForm.hidden = true; panel.hidden = false;
      try { sessionStorage.setItem("pe-admin-key", key); } catch (e) {}
      render(d.comments || []);
    }).catch(function (e) {
      say(e.message, "error");
      if (/password/i.test(e.message)) { key = ""; try { sessionStorage.removeItem("pe-admin-key"); } catch (x) {} loginForm.hidden = false; panel.hidden = true; }
    });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    key = new FormData(loginForm).get("key");
    load();
  });

  toggles.forEach(function (t) {
    t.addEventListener("click", function () {
      view = t.getAttribute("data-status");
      toggles.forEach(function (x) { x.setAttribute("aria-pressed", String(x === t)); });
      load();
    });
  });

  if (key) load();
})();
